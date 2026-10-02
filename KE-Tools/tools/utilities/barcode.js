/* ============================================
   KE Tools — Barcode Generator
   Uses the JsBarcode library (loaded via CDN — see README).
   ============================================ */
KE.registerTool("barcode", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Generated locally in your browser</div>
    <div class="form-row">
      <div class="form-group" style="flex:2;"><label>Value</label><input type="text" id="bc-value" placeholder="e.g. 123456789012" /></div>
      <div class="form-group"><label>Format</label>
        <select id="bc-format">
          <option value="CODE128">CODE128</option>
          <option value="EAN13">EAN-13</option>
          <option value="UPC">UPC-A</option>
          <option value="CODE39">CODE39</option>
          <option value="ITF14">ITF-14</option>
          <option value="MSI">MSI</option>
          <option value="pharmacode">Pharmacode</option>
        </select>
      </div>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="bc-gen">Generate barcode</button></div>
    <div class="qr-canvas-wrap hidden" id="bc-canvas-wrap"><svg id="bc-svg"></svg></div>
    <div id="bc-error" class="helper-text"></div>
    <div class="btn-row hidden" id="bc-actions">
      <button class="btn btn-sm" id="bc-download-svg">Download SVG</button>
      <button class="btn btn-sm" id="bc-download-png">Download PNG</button>
    </div>
  `;
  const wrap = container.querySelector("#bc-canvas-wrap");
  const svg = container.querySelector("#bc-svg");
  const errorBox = container.querySelector("#bc-error");
  const actions = container.querySelector("#bc-actions");

  container.querySelector("#bc-gen").addEventListener("click", () => {
    if(typeof JsBarcode === "undefined"){
      KE.Utils.toast("Barcode library failed to load. Check your internet connection.", "error");
      return;
    }
    const value = container.querySelector("#bc-value").value.trim();
    const format = container.querySelector("#bc-format").value;
    if(!value){ KE.Utils.toast("Enter a value to encode.", "error"); return; }
    errorBox.textContent = "";
    try{
      JsBarcode(svg, value, {
        format, lineColor:"#000", width:2, height:90, displayValue:true,
        valid: (isValid) => {
          if(!isValid){
            errorBox.textContent = `"${value}" isn't a valid value for ${format}. Try a different format or value.`;
          }
        }
      });
      wrap.classList.remove("hidden");
      actions.classList.remove("hidden");
    }catch(e){
      errorBox.textContent = "Could not generate this barcode: " + e.message;
    }
  });

  container.querySelector("#bc-download-svg").addEventListener("click", () => {
    if(!svg.innerHTML){ KE.Utils.toast("Generate a barcode first.", "error"); return; }
    const blob = new Blob([svg.outerHTML], { type:"image/svg+xml" });
    KE.Utils.downloadBlob("barcode.svg", blob);
  });

  container.querySelector("#bc-download-png").addEventListener("click", () => {
    if(!svg.innerHTML){ KE.Utils.toast("Generate a barcode first.", "error"); return; }
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type:"image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width || svg.width.baseVal.value;
      canvas.height = img.height || svg.height.baseVal.value;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => { KE.Utils.downloadBlob("barcode.png", blob); URL.revokeObjectURL(url); });
    };
    img.src = url;
  });
});
