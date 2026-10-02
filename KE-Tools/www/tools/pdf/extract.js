/* ============================================
   KE Tools — Extract Pages
   Uses pdf-lib (loaded via CDN — see README).
   ============================================ */
KE.registerTool("extract", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="dropzone" id="ex-dropzone">
      <div class="dz-ico">📤</div><div class="dz-title">Drop a PDF here</div><div class="dz-sub">or Browse</div>
      <input type="file" id="ex-file-input" accept="application/pdf" />
    </div>
    <div class="file-list" id="ex-file-list"></div>
    <div class="form-group"><label>Pages to extract (e.g. 2,4,7-9)</label><input type="text" id="ex-pages" placeholder="2,4,7-9" /></div>
    <div class="btn-row"><button class="btn btn-accent" id="ex-run">Extract pages</button></div>
    <div id="ex-status"></div>
  `;
  let file = null, pageCount = 0;
  const dz = container.querySelector("#ex-dropzone");
  const fileInput = container.querySelector("#ex-file-input");
  const listBox = container.querySelector("#ex-file-list");
  const statusBox = container.querySelector("#ex-status");

  dz.addEventListener("click", () => fileInput.click());
  ["dragover","dragleave","drop"].forEach(evt => dz.addEventListener(evt, e => e.preventDefault()));
  dz.addEventListener("dragover", () => dz.classList.add("drag-over"));
  dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
  dz.addEventListener("drop", e => { dz.classList.remove("drag-over"); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener("change", () => { if(fileInput.files[0]) handleFile(fileInput.files[0]); });

  async function handleFile(f){
    if(typeof PDFLib === "undefined"){ KE.Utils.toast("PDF library failed to load. Check your internet connection.", "error"); return; }
    file = f;
    const bytes = await KE.Utils.readFileAsArrayBuffer(f);
    const doc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption:true });
    pageCount = doc.getPageCount();
    listBox.innerHTML = `<div class="file-item"><span class="fi-ico">📄</span><span class="fi-name">${KE.Utils.escapeHtml(f.name)}</span><span class="fi-size">${pageCount} pages · ${KE.Utils.formatBytes(f.size)}</span></div>`;
  }

  container.querySelector("#ex-run").addEventListener("click", async () => {
    if(!file){ KE.Utils.toast("Choose a PDF first.", "error"); return; }
    try{
      const indices = KE.Utils.parsePageRange(container.querySelector("#ex-pages").value, pageCount);
      const bytes = await KE.Utils.readFileAsArrayBuffer(file);
      const src = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption:true });
      const outDoc = await PDFLib.PDFDocument.create();
      const pages = await outDoc.copyPages(src, indices);
      pages.forEach(p => outDoc.addPage(p));
      const outBytes = await outDoc.save();
      const blob = new Blob([outBytes], { type:"application/pdf" });
      statusBox.innerHTML = `<div class="result-panel"><div class="result-row"><span class="rlabel">Extracted</span><span class="rval">${indices.length} page(s) · ${KE.Utils.formatBytes(blob.size)}</span></div></div>
        <div class="btn-row"><button class="btn btn-accent" id="ex-download">Download extracted.pdf</button></div>`;
      statusBox.querySelector("#ex-download").addEventListener("click", () => KE.Utils.downloadBlob("extracted.pdf", blob));
    }catch(e){
      statusBox.innerHTML = `<div class="code-output error-text">${KE.Utils.escapeHtml(e.message)}</div>`;
    }
  });
});
