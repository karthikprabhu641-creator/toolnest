/* ============================================
   KE Tools — Image → Base64
   ============================================ */
KE.registerTool("base64-image", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="dropzone" id="bi-dropzone">
      <div class="dz-ico">🖼️</div><div class="dz-title">Drop an image here</div><div class="dz-sub">or Browse</div>
      <input type="file" id="bi-file-input" accept="image/*" />
    </div>
    <div id="bi-result" class="hidden">
      <div class="preview-box" style="max-width:260px; margin:16px 0;"><img id="bi-preview-img" /></div>
      <div class="form-group"><label>Data URL</label><div class="code-output" id="bi-datauri"></div></div>
      <div class="form-group" style="margin-top:14px;"><label>Base64 (no prefix)</label><div class="code-output" id="bi-base64"></div></div>
      <div class="btn-row">
        <button class="btn btn-sm" id="bi-copy-datauri">Copy data URL</button>
        <button class="btn btn-sm" id="bi-copy-base64">Copy Base64</button>
        <button class="btn btn-sm" id="bi-download">Download as .txt</button>
      </div>
    </div>
  `;
  const dz = container.querySelector("#bi-dropzone");
  const fileInput = container.querySelector("#bi-file-input");
  const resultBox = container.querySelector("#bi-result");
  let currentDataUri = "";

  dz.addEventListener("click", () => fileInput.click());
  ["dragover","dragleave","drop"].forEach(evt => dz.addEventListener(evt, e => e.preventDefault()));
  dz.addEventListener("dragover", () => dz.classList.add("drag-over"));
  dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
  dz.addEventListener("drop", e => { dz.classList.remove("drag-over"); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener("change", () => { if(fileInput.files[0]) handleFile(fileInput.files[0]); });

  async function handleFile(f){
    if(!f.type.startsWith("image/")){ KE.Utils.toast("Please choose an image file.", "error"); return; }
    currentDataUri = await KE.Utils.readFileAsDataURL(f);
    container.querySelector("#bi-preview-img").src = currentDataUri;
    container.querySelector("#bi-datauri").textContent = currentDataUri;
    container.querySelector("#bi-base64").textContent = currentDataUri.split(",")[1] || "";
    resultBox.classList.remove("hidden");
  }

  container.querySelector("#bi-copy-datauri").addEventListener("click", () => {
    if(!currentDataUri){ KE.Utils.toast("Choose an image first.", "error"); return; }
    KE.Utils.copyToClipboard(currentDataUri).then(() => KE.Utils.toast("Data URL copied.", "success"));
  });
  container.querySelector("#bi-copy-base64").addEventListener("click", () => {
    if(!currentDataUri){ KE.Utils.toast("Choose an image first.", "error"); return; }
    KE.Utils.copyToClipboard(currentDataUri.split(",")[1]).then(() => KE.Utils.toast("Base64 copied.", "success"));
  });
  container.querySelector("#bi-download").addEventListener("click", () => {
    if(!currentDataUri){ KE.Utils.toast("Choose an image first.", "error"); return; }
    KE.Utils.downloadText("image-base64.txt", currentDataUri);
  });
});
