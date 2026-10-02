/* ============================================
   KE Tools — PDF → Images
   Uses PDF.js (loaded via CDN — see README).
   ============================================ */
KE.registerTool("pdf-to-images", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="dropzone" id="pi-dropzone">
      <div class="dz-ico">🖼️</div><div class="dz-title">Drop a PDF here</div><div class="dz-sub">or Browse</div>
      <input type="file" id="pi-file-input" accept="application/pdf" />
    </div>
    <div class="form-row" style="margin-top:16px;">
      <div class="form-group"><label>Image format</label><select id="pi-format"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option></select></div>
      <div class="form-group"><label>Resolution scale</label><select id="pi-scale"><option value="1">1x</option><option value="2" selected>2x</option><option value="3">3x</option></select></div>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="pi-run">Render pages</button></div>
    <div class="thumb-grid" id="pi-thumbs"></div>
    <div class="btn-row hidden" id="pi-actions"><button class="btn btn-accent" id="pi-download-all">Download all pages</button></div>
  `;
  let file = null;
  const dz = container.querySelector("#pi-dropzone");
  const fileInput = container.querySelector("#pi-file-input");
  const thumbsBox = container.querySelector("#pi-thumbs");
  const actions = container.querySelector("#pi-actions");

  dz.addEventListener("click", () => fileInput.click());
  ["dragover","dragleave","drop"].forEach(evt => dz.addEventListener(evt, e => e.preventDefault()));
  dz.addEventListener("dragover", () => dz.classList.add("drag-over"));
  dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
  dz.addEventListener("drop", e => { dz.classList.remove("drag-over"); if(e.dataTransfer.files[0]) file = e.dataTransfer.files[0]; });
  fileInput.addEventListener("change", () => { if(fileInput.files[0]) file = fileInput.files[0]; });

  let renderedBlobs = [];

  container.querySelector("#pi-run").addEventListener("click", async () => {
    if(!file){ KE.Utils.toast("Choose a PDF first.", "error"); return; }
    if(typeof pdfjsLib === "undefined"){ KE.Utils.toast("PDF rendering library failed to load. Check your internet connection.", "error"); return; }
    thumbsBox.innerHTML = `<div class="helper-text">Rendering pages...</div>`;
    actions.classList.add("hidden");
    renderedBlobs = [];
    try{
      const format = container.querySelector("#pi-format").value;
      const scale = Number(container.querySelector("#pi-scale").value);
      if(!pdfjsLib.GlobalWorkerOptions.workerSrc){
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
      const bytes = await KE.Utils.readFileAsArrayBuffer(file);
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      thumbsBox.innerHTML = "";
      for(let i=1;i<=pdf.numPages;i++){
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        const ext = format === "image/png" ? "png" : "jpg";
        const blob = await new Promise(res => canvas.toBlob(res, format, 0.92));
        renderedBlobs.push({ name: `page-${i}.${ext}`, blob });
        const card = KE.Utils.el("div", { class:"thumb-card" }, [
          canvas, KE.Utils.el("div", { class:"thumb-num" }, `Page ${i}`),
          KE.Utils.el("button", { class:"btn btn-sm", style:"width:100%;margin-top:4px;", onclick:() => KE.Utils.downloadBlob(`page-${i}.${ext}`, blob) }, "Download")
        ]);
        thumbsBox.appendChild(card);
      }
      actions.classList.remove("hidden");
    }catch(e){
      thumbsBox.innerHTML = `<div class="code-output error-text">${KE.Utils.escapeHtml(e.message)}</div>`;
    }
  });

  container.querySelector("#pi-download-all").addEventListener("click", () => {
    if(renderedBlobs.length === 0){ KE.Utils.toast("Render the pages first.", "error"); return; }
    renderedBlobs.forEach((r, i) => setTimeout(() => KE.Utils.downloadBlob(r.name, r.blob), i * 200));
  });
});
