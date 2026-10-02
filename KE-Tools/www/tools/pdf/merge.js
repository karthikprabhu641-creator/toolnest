/* ============================================
   KE Tools — Merge PDF
   Uses pdf-lib (loaded via CDN — see README).
   ============================================ */
KE.registerTool("merge", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="dropzone" id="mg-dropzone">
      <div class="dz-ico">📎</div><div class="dz-title">Drop PDFs here</div><div class="dz-sub">or Browse — choose multiple files</div>
      <input type="file" id="mg-file-input" accept="application/pdf" multiple />
    </div>
    <div class="helper-text">Drag the ☰ handle to reorder files before merging.</div>
    <div class="file-list" id="mg-file-list"></div>
    <div class="btn-row"><button class="btn btn-accent" id="mg-merge">Merge PDFs</button><button class="btn btn-ghost" id="mg-clear">Clear all</button></div>
    <div id="mg-status"></div>
  `;
  let files = [];
  const dz = container.querySelector("#mg-dropzone");
  const fileInput = container.querySelector("#mg-file-input");
  const listBox = container.querySelector("#mg-file-list");
  const statusBox = container.querySelector("#mg-status");

  dz.addEventListener("click", () => fileInput.click());
  ["dragover","dragleave","drop"].forEach(evt => dz.addEventListener(evt, e => e.preventDefault()));
  dz.addEventListener("dragover", () => dz.classList.add("drag-over"));
  dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
  dz.addEventListener("drop", e => { dz.classList.remove("drag-over"); addFiles(e.dataTransfer.files); });
  fileInput.addEventListener("change", () => addFiles(fileInput.files));

  function addFiles(fileListObj){
    Array.from(fileListObj).forEach(f => {
      if(f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")){
        KE.Utils.toast(`"${f.name}" isn't a PDF and was skipped.`, "error"); return;
      }
      files.push({ id: KE.Utils.uid(), file: f });
    });
    renderList();
  }

  let dragIndex = null;
  function renderList(){
    listBox.innerHTML = files.map((item, i) => `
      <div class="file-item" draggable="true" data-id="${item.id}">
        <span class="fi-drag">☰</span>
        <span class="fi-ico">📄</span>
        <span class="fi-name">${i+1}. ${KE.Utils.escapeHtml(item.file.name)}</span>
        <span class="fi-size">${KE.Utils.formatBytes(item.file.size)}</span>
        <button class="fi-remove">✕</button>
      </div>`).join("");

    listBox.querySelectorAll(".file-item").forEach((el, i) => {
      el.querySelector(".fi-remove").addEventListener("click", () => {
        files = files.filter(f => f.id !== el.dataset.id);
        renderList();
      });
      el.addEventListener("dragstart", () => { dragIndex = i; el.classList.add("dragging"); });
      el.addEventListener("dragend", () => el.classList.remove("dragging"));
      el.addEventListener("dragover", (e) => e.preventDefault());
      el.addEventListener("drop", (e) => {
        e.preventDefault();
        if(dragIndex === null || dragIndex === i) return;
        const [moved] = files.splice(dragIndex, 1);
        files.splice(i, 0, moved);
        dragIndex = null;
        renderList();
      });
    });
  }

  container.querySelector("#mg-clear").addEventListener("click", () => { files = []; renderList(); statusBox.innerHTML=""; });

  container.querySelector("#mg-merge").addEventListener("click", async () => {
    if(typeof PDFLib === "undefined"){ KE.Utils.toast("PDF library failed to load. Check your internet connection.", "error"); return; }
    if(files.length < 2){ KE.Utils.toast("Add at least two PDF files to merge.", "error"); return; }
    statusBox.innerHTML = `<div class="helper-text">Merging ${files.length} files...</div>`;
    try{
      const merged = await PDFLib.PDFDocument.create();
      for(const item of files){
        const bytes = await KE.Utils.readFileAsArrayBuffer(item.file);
        const src = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption:true });
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const outBytes = await merged.save();
      const blob = new Blob([outBytes], { type:"application/pdf" });
      statusBox.innerHTML = `<div class="result-panel"><div class="result-row"><span class="rlabel">Merged file</span><span class="rval">${merged.getPageCount()} pages · ${KE.Utils.formatBytes(blob.size)}</span></div></div>
        <div class="btn-row"><button class="btn btn-accent" id="mg-download">Download merged.pdf</button></div>`;
      statusBox.querySelector("#mg-download").addEventListener("click", () => KE.Utils.downloadBlob("merged.pdf", blob));
    }catch(e){
      statusBox.innerHTML = `<div class="code-output error-text">Could not merge these PDFs: ${KE.Utils.escapeHtml(e.message)}</div>`;
    }
  });
});
