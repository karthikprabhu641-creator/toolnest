/* ============================================
   KE Tools — Color Converter
   ============================================ */
KE.registerTool("color", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="color-swatch" id="color-preview"></div>
    <div class="form-row">
      <div class="form-group"><label>HEX</label><input type="text" id="c-hex" placeholder="#3d7fff" value="#3d7fff" /></div>
      <div class="form-group"><label>Picker</label><input type="color" id="c-picker" value="#3d7fff" style="height:41px; padding:4px;" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>RGB</label><input type="text" id="c-rgb" placeholder="rgb(61, 127, 255)" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>HSL</label><input type="text" id="c-hsl" placeholder="hsl(220, 100%, 62%)" /></div>
    </div>
    <div class="helper-text" id="c-error"></div>
  `;
  const hex = container.querySelector("#c-hex");
  const rgb = container.querySelector("#c-rgb");
  const hsl = container.querySelector("#c-hsl");
  const picker = container.querySelector("#c-picker");
  const preview = container.querySelector("#color-preview");
  const errorBox = container.querySelector("#c-error");

  function hexToRgb(h){
    h = h.replace("#","").trim();
    if(h.length === 3) h = h.split("").map(c => c+c).join("");
    if(!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    const num = parseInt(h, 16);
    return { r:(num>>16)&255, g:(num>>8)&255, b:num&255 };
  }
  function rgbToHex(r,g,b){ return "#" + [r,g,b].map(v => KE.Utils.clamp(Math.round(v),0,255).toString(16).padStart(2,"0")).join(""); }
  function rgbToHsl(r,g,b){
    r/=255; g/=255; b/=255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h,s,l = (max+min)/2;
    if(max === min){ h = s = 0; }
    else{
      const d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h = (g-b)/d + (g<b?6:0); break;
        case g: h = (b-r)/d + 2; break;
        case b: h = (r-g)/d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
  }
  function hslToRgb(h,s,l){
    h/=360; s/=100; l/=100;
    let r,g,b;
    if(s === 0){ r=g=b=l; }
    else{
      const hue2rgb = (p,q,t) => {
        if(t<0) t+=1; if(t>1) t-=1;
        if(t<1/6) return p+(q-p)*6*t;
        if(t<1/2) return q;
        if(t<2/3) return p+(q-p)*(2/3-t)*6;
        return p;
      };
      const q = l < 0.5 ? l*(1+s) : l+s-l*s;
      const p = 2*l - q;
      r = hue2rgb(p,q,h+1/3); g = hue2rgb(p,q,h); b = hue2rgb(p,q,h-1/3);
    }
    return { r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255) };
  }

  function updateAll(source, c){
    errorBox.textContent = "";
    const h = rgbToHsl(c.r,c.g,c.b);
    const hexVal = rgbToHex(c.r,c.g,c.b);
    if(source !== "hex") hex.value = hexVal;
    if(source !== "rgb") rgb.value = `rgb(${c.r}, ${c.g}, ${c.b})`;
    if(source !== "hsl") hsl.value = `hsl(${h.h}, ${h.s}%, ${h.l}%)`;
    if(source !== "picker") picker.value = hexVal;
    preview.style.background = hexVal;
  }

  hex.addEventListener("input", () => {
    const c = hexToRgb(hex.value);
    if(!c){ errorBox.textContent = "Enter a valid hex color, e.g. #3d7fff"; return; }
    updateAll("hex", c);
  });
  picker.addEventListener("input", () => { updateAll("picker", hexToRgb(picker.value)); });
  rgb.addEventListener("input", () => {
    const m = rgb.value.match(/(\d+)\D+(\d+)\D+(\d+)/);
    if(!m){ errorBox.textContent = "Enter a valid rgb() value, e.g. rgb(61, 127, 255)"; return; }
    const c = { r:+m[1], g:+m[2], b:+m[3] };
    if([c.r,c.g,c.b].some(v => v > 255)){ errorBox.textContent = "RGB values must be 0-255."; return; }
    updateAll("rgb", c);
  });
  hsl.addEventListener("input", () => {
    const m = hsl.value.match(/(\d+)\D+(\d+)%\D+(\d+)%/);
    if(!m){ errorBox.textContent = "Enter a valid hsl() value, e.g. hsl(220, 100%, 62%)"; return; }
    updateAll("hsl", hslToRgb(+m[1], +m[2], +m[3]));
  });

  updateAll("hex", hexToRgb("#3d7fff"));
});
