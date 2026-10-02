/* ============================================
   KE Tools — Image Converter
   ============================================ */
KE.registerTool("converter", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="dropzone" id="cv-dropzone">
      <div class="dz-ico">🔄</div>
      <div class="dz-title">Drop an image here</div>
      <div class="dz-sub">or Browse</div>
      <input type="file" id="cv-file-input" accept="image/*" />
    </div>
    <div class="form-row" style="margin-top:18px;">
      <div class="form-group"><label>Convert to</label>
        <select id="cv-format"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WEBP</option></select>
      </div>
      <div class="form-group"><label>Quality (JPG/WEBP): <span id="cv-q-val">92</span>%</label><input type="range" id="cv-quality" min="1" max="100" value="92" /></div>
    </div>
    <div class="preview-box hidden" id="cv-preview" style="max-width:340px;">
      <img id="cv-img" /><div class="pb-label" id="cv-info">—</div>
    </div>
    <div class="btn-row hidden" id="cv-actions"><button class="btn btn-accent" id="cv-download">Download converted image</button></div>
  `;
  let img = null, file = null;
  const dz = container.querySelector("#cv-dropzone");
  const fileInput = container.querySelector("#cv-file-input");
  const formatSelect = container.querySelector("#cv-format");
  const qualitySlider = container.querySelector("#cv-quality");
  const preview = container.querySelector("#cv-preview");
  const actions = container.querySelector("#cv-actions");
  let convertedBlob = null;

  container.querySelector("#cv-quality").addEventListener("input", () => container.querySelector("#cv-q-val").textContent = qualitySlider.value);
  dz.addEventListener("click", () => fileInput.click());
  ["dragover","dragleave","drop"].forEach(evt => dz.addEventListener(evt, e => e.preventDefault()));
  dz.addEventListener("dragover", () => dz.classList.add("drag-over"));
  dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
  dz.addEventListener("drop", e => { dz.classList.remove("drag-over"); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener("change", () => { if(fileInput.files[0]) handleFile(fileInput.files[0]); });
  formatSelect.addEventListener("change", convert);
  qualitySlider.addEventListener("change", convert);

  async function handleFile(f){
    if(!f.type.startsWith("image/")){ KE.Utils.toast("Please choose an image file.", "error"); return; }
    file = f;
    img = await KE.Utils.loadImage(await KE.Utils.readFileAsDataURL(f));
    convert();
  }

  function convert(){
    if(!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if(formatSelect.value === "image/jpeg"){ ctx.fillStyle = "#fff"; ctx.fillRect(0,0,canvas.width,canvas.height); }
    ctx.drawImage(img, 0, 0);
    const q = Number(qualitySlider.value)/100;
    canvas.toBlob(blob => {
      if(!blob){ KE.Utils.toast("This browser can't export that format.", "error"); return; }
      convertedBlob = blob;
      preview.classList.remove("hidden");
      container.querySelector("#cv-img").src = URL.createObjectURL(blob);
      container.querySelector("#cv-info").textContent = `${formatSelect.value.split("/")[1].toUpperCase()} — ${KE.Utils.formatBytes(blob.size)}`;
      actions.classList.remove("hidden");
    }, formatSelect.value, q);
  }

  container.querySelector("#cv-download").addEventListener("click", () => {
    if(!convertedBlob){ KE.Utils.toast("Choose an image first.", "error"); return; }
    const ext = formatSelect.value.split("/")[1].replace("jpeg","jpg");
    KE.Utils.downloadBlob(`converted.${ext}`, convertedBlob);
  });
});
