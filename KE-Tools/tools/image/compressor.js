/* ============================================
   KE Tools — Image Compressor
   ============================================ */
KE.registerTool("compressor", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="dropzone" id="ic-dropzone">
      <div class="dz-ico">🖼️</div>
      <div class="dz-title">Drop an image here</div>
      <div class="dz-sub">or Browse — JPG, PNG or WEBP</div>
      <input type="file" id="ic-file-input" accept="image/*" />
    </div>
    <div class="form-row" style="margin-top:18px;">
      <div class="form-group"><label>Quality: <span id="ic-quality-val">75</span>%</label><input type="range" id="ic-quality" min="1" max="100" value="75" /></div>
      <div class="form-group"><label>Output format</label><select id="ic-format"><option value="image/jpeg">JPEG</option><option value="image/webp">WEBP</option><option value="image/png">PNG</option></select></div>
    </div>
    <div class="preview-compare hidden" id="ic-compare">
      <div class="preview-box"><img id="ic-original-img" /><div class="pb-label">Original</div><div class="pb-size" id="ic-original-size">—</div></div>
      <div class="preview-box"><img id="ic-compressed-img" /><div class="pb-label">Compressed</div><div class="pb-size" id="ic-compressed-size">—</div></div>
    </div>
    <div class="result-panel hidden" id="ic-savings"></div>
    <div class="btn-row hidden" id="ic-actions"><button class="btn btn-accent" id="ic-download">Download compressed image</button></div>
  `;
  let originalFile = null, originalImg = null;
  const dz = container.querySelector("#ic-dropzone");
  const fileInput = container.querySelector("#ic-file-input");
  const qualitySlider = container.querySelector("#ic-quality");
  const qualityVal = container.querySelector("#ic-quality-val");
  const formatSelect = container.querySelector("#ic-format");
  const compareBox = container.querySelector("#ic-compare");
  const savingsBox = container.querySelector("#ic-savings");
  const actions = container.querySelector("#ic-actions");
  let compressedBlob = null;

  dz.addEventListener("click", () => fileInput.click());
  ["dragover","dragleave","drop"].forEach(evt => dz.addEventListener(evt, e => e.preventDefault()));
  dz.addEventListener("dragover", () => dz.classList.add("drag-over"));
  dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
  dz.addEventListener("drop", e => { dz.classList.remove("drag-over"); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener("change", () => { if(fileInput.files[0]) handleFile(fileInput.files[0]); });
  qualitySlider.addEventListener("input", () => { qualityVal.textContent = qualitySlider.value; if(originalImg) compress(); });
  formatSelect.addEventListener("change", () => { if(originalImg) compress(); });

  async function handleFile(file){
    if(!file.type.startsWith("image/")){ KE.Utils.toast("Please choose an image file.", "error"); return; }
    originalFile = file;
    const dataUrl = await KE.Utils.readFileAsDataURL(file);
    originalImg = await KE.Utils.loadImage(dataUrl);
    container.querySelector("#ic-original-img").src = dataUrl;
    container.querySelector("#ic-original-size").textContent = KE.Utils.formatBytes(file.size);
    compareBox.classList.remove("hidden");
    compress();
  }

  function compress(){
    const canvas = document.createElement("canvas");
    canvas.width = originalImg.naturalWidth;
    canvas.height = originalImg.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(originalImg, 0, 0);
    const quality = Number(qualitySlider.value) / 100;
    const format = formatSelect.value;
    canvas.toBlob(blob => {
      if(!blob){ KE.Utils.toast("Compression failed for this format.", "error"); return; }
      compressedBlob = blob;
      const url = URL.createObjectURL(blob);
      container.querySelector("#ic-compressed-img").src = url;
      container.querySelector("#ic-compressed-size").textContent = KE.Utils.formatBytes(blob.size);
      const savedPct = ((originalFile.size - blob.size) / originalFile.size) * 100;
      savingsBox.classList.remove("hidden");
      savingsBox.innerHTML = `<div class="result-row"><span class="rlabel">Size change</span><span class="rval" style="color:${savedPct>0?'var(--success)':'var(--danger)'}">${savedPct>0 ? savedPct.toFixed(1)+"% smaller" : (-savedPct).toFixed(1)+"% larger"}</span></div>`;
      actions.classList.remove("hidden");
    }, format, format === "image/png" ? undefined : quality);
  }

  container.querySelector("#ic-download").addEventListener("click", () => {
    if(!compressedBlob){ KE.Utils.toast("Choose an image first.", "error"); return; }
    const ext = formatSelect.value.split("/")[1].replace("jpeg","jpg");
    KE.Utils.downloadBlob(`compressed.${ext}`, compressedBlob);
  });
});
