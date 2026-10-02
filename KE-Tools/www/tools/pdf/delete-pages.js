/* ============================================
   KE Tools — Delete Pages
   Uses pdf-lib + PDF.js (loaded via CDN — see README).
   ============================================ */
KE.registerTool("delete-pages", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="dropzone" id="dp-dropzone">
      <div class="dz-ico">🗑️</div><div class="dz-title">Drop a PDF here</div><div class="dz-sub">or Browse</div>
      <input type="file" id="dp-file-input" accept="application/pdf" />
    </div>
    <div class="helper-text" id="dp-hint"></div>
    <div class="thumb-grid" id="dp-thumbs"></div>
    <div class="btn-row hidden" id="dp-actions">
      <button class="btn btn-accent" id="dp-run">Delete selected pages</button>
      <button class="btn btn-ghost" id="dp-clear-sel">Clear selection</button>
    </div>
    <div id="dp-status"></div>
  `;
  let file = null, bytes = null;
  let selected = new Set();
  const dz = container.querySelector("#dp-dropzone");
  const fileInput = container.querySelector("#dp-file-input");
  const thumbsBox = container.querySelector("#dp-thumbs");
  const actions = container.querySelector("#dp-actions");
  const statusBox = container.querySelector("#dp-status");
  const hint = container.querySelector("#dp-hint");

  dz.addEventListener("click", () => fileInput.click());
  ["dragover","dragleave","drop"].forEach(evt => dz.addEventListener(evt, e => e.preventDefault()));
  dz.addEventListener("dragover", () => dz.classList.add("drag-over"));
  dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
  dz.addEventListener("drop", e => { dz.classList.remove("drag-over"); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener("change", () => { if(fileInput.files[0]) handleFile(fileInput.files[0]); });

  async function handleFile(f){
    file = f; selected = new Set();
    thumbsBox.innerHTML = `<div class="helper-text">Rendering pages...</div>`;
    try{
      bytes = await KE.Utils.readFileAsArrayBuffer(f);
      const thumbs = await KE.Utils.renderPdfThumbnails(bytes);
      thumbsBox.innerHTML = "";
      thumbs.forEach(t => {
        const card = KE.Utils.el("div", { class:"thumb-card", "data-page": t.pageNum, onclick: () => toggle(t.pageNum, card) }, [
          t.canvas, KE.Utils.el("div", { class:"thumb-num" }, `Page ${t.pageNum}`)
        ]);
        thumbsBox.appendChild(card);
      });
      hint.textContent = `${thumbs.length} pages loaded. Tap pages to mark them for deletion.`;
      actions.classList.remove("hidden");
    }catch(e){
      thumbsBox.innerHTML = `<div class="code-output error-text">${KE.Utils.escapeHtml(e.message)}</div>`;
    }
  }

  function toggle(pageNum, card){
    if(selected.has(pageNum)){ selected.delete(pageNum); card.classList.remove("selected"); }
    else { selected.add(pageNum); card.classList.add("selected"); }
  }

  container.querySelector("#dp-clear-sel").addEventListener("click", () => {
    selected = new Set();
    thumbsBox.querySelectorAll(".thumb-card").forEach(c => c.classList.remove("selected"));
  });

  container.querySelector("#dp-run").addEventListener("click", async () => {
    if(!file){ KE.Utils.toast("Choose a PDF first.", "error"); return; }
    if(selected.size === 0){ KE.Utils.toast("Select at least one page to delete.", "error"); return; }
    if(typeof PDFLib === "undefined"){ KE.Utils.toast("PDF library failed to load. Check your internet connection.", "error"); return; }
    try{
      const src = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption:true });
      const total = src.getPageCount();
      if(selected.size >= total){ KE.Utils.toast("You can't delete every page — at least one must remain.", "error"); return; }
      const keepIndices = [];
      for(let i=0;i<total;i++) if(!selected.has(i+1)) keepIndices.push(i);
      const outDoc = await PDFLib.PDFDocument.create();
      const pages = await outDoc.copyPages(src, keepIndices);
      pages.forEach(p => outDoc.addPage(p));
      const outBytes = await outDoc.save();
      const blob = new Blob([outBytes], { type:"application/pdf" });
      statusBox.innerHTML = `<div class="result-panel"><div class="result-row"><span class="rlabel">Result</span><span class="rval">${keepIndices.length} of ${total} pages kept</span></div></div>
        <div class="btn-row"><button class="btn btn-accent" id="dp-download">Download result.pdf</button></div>`;
      statusBox.querySelector("#dp-download").addEventListener("click", () => KE.Utils.downloadBlob("result.pdf", blob));
    }catch(e){
      statusBox.innerHTML = `<div class="code-output error-text">${KE.Utils.escapeHtml(e.message)}</div>`;
    }
  });
});
