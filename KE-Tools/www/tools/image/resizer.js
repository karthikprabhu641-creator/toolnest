/* ============================================
   KE Tools — Image Resizer
   ============================================ */
KE.registerTool("resizer", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="dropzone" id="rs-dropzone">
      <div class="dz-ico">📐</div><div class="dz-title">Drop an image here</div><div class="dz-sub">or Browse</div>
      <input type="file" id="rs-file-input" accept="image/*" />
    </div>
    <div class="form-row" style="margin-top:18px;">
      <div class="form-group"><label>Width (px)</label><input type="number" id="rs-width" min="1" /></div>
      <div class="form-group"><label>Height (px)</label><input type="number" id="rs-height" min="1" /></div>
      <div class="form-group" style="display:flex; align-items:flex-end;">
        <label style="display:flex; align-items:center; gap:8px; margin:0;"><input type="checkbox" id="rs-lock" checked /> Lock aspect ratio</label>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Presets</label>
        <select id="rs-preset">
          <option value="">Custom</option>
          <option value="1920x1080">1920 × 1080 (Full HD)</option>
          <option value="1280x720">1280 × 720 (HD)</option>
          <option value="1080x1080">1080 × 1080 (Square)</option>
          <option value="800x600">800 × 600</option>
          <option value="640x480">640 × 480</option>
        </select>
      </div>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="rs-apply">Resize</button></div>
    <div class="preview-box hidden" id="rs-preview" style="max-width:340px;"><img id="rs-img" /><div class="pb-label" id="rs-info">—</div></div>
    <div class="btn-row hidden" id="rs-actions"><button class="btn btn-accent" id="rs-download">Download resized image</button></div>
  `;
  let img = null, ratio = 1, outBlob = null;
  const dz = container.querySelector("#rs-dropzone");
  const fileInput = container.querySelector("#rs-file-input");
  const widthInput = container.querySelector("#rs-width");
  const heightInput = container.querySelector("#rs-height");
  const lock = container.querySelector("#rs-lock");
  const preset = container.querySelector("#rs-preset");
  const preview = container.querySelector("#rs-preview");
  const actions = container.querySelector("#rs-actions");

  dz.addEventListener("click", () => fileInput.click());
  ["dragover","dragleave","drop"].forEach(evt => dz.addEventListener(evt, e => e.preventDefault()));
  dz.addEventListener("dragover", () => dz.classList.add("drag-over"));
  dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
  dz.addEventListener("drop", e => { dz.classList.remove("drag-over"); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener("change", () => { if(fileInput.files[0]) handleFile(fileInput.files[0]); });

  async function handleFile(f){
    if(!f.type.startsWith("image/")){ KE.Utils.toast("Please choose an image file.", "error"); return; }
    img = await KE.Utils.loadImage(await KE.Utils.readFileAsDataURL(f));
    ratio = img.naturalWidth / img.naturalHeight;
    widthInput.value = img.naturalWidth;
    heightInput.value = img.naturalHeight;
  }

  widthInput.addEventListener("input", () => { if(lock.checked && widthInput.value) heightInput.value = Math.round(widthInput.value / ratio); });
  heightInput.addEventListener("input", () => { if(lock.checked && heightInput.value) widthInput.value = Math.round(heightInput.value * ratio); });
  preset.addEventListener("change", () => {
    if(!preset.value) return;
    const [w,h] = preset.value.split("x").map(Number);
    lock.checked = false; widthInput.value = w; heightInput.value = h;
  });

  function resize(){
    if(!img) throw new Error("Choose an image first.");
    const w = Number(widthInput.value), h = Number(heightInput.value);
    if(!w || !h || w <= 0 || h <= 0) throw new Error("Enter a valid width and height.");
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);
    return canvas;
  }

  container.querySelector("#rs-apply").addEventListener("click", () => {
    let canvas;
    try{ canvas = resize(); }catch(e){ KE.Utils.toast(e.message, "error"); return; }
    canvas.toBlob(blob => {
      outBlob = blob;
      preview.classList.remove("hidden");
      container.querySelector("#rs-img").src = URL.createObjectURL(blob);
      container.querySelector("#rs-info").textContent = `${canvas.width} × ${canvas.height} — ${KE.Utils.formatBytes(blob.size)}`;
      actions.classList.remove("hidden");
    }, "image/png");
  });

  container.querySelector("#rs-download").addEventListener("click", () => {
    if(!outBlob){ KE.Utils.toast("Resize an image first.", "error"); return; }
    KE.Utils.downloadBlob("resized.png", outBlob);
  });
});
