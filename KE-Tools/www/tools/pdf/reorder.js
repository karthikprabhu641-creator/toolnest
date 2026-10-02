/* ============================================
   KE Tools — Reorder Pages
   Uses pdf-lib + PDF.js (loaded via CDN — see README).
   ============================================ */
KE.registerTool("reorder", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="dropzone" id="ro-dropzone">
      <div class="dz-ico">↕️</div><div class="dz-title">Drop a PDF here</div><div class="dz-sub">or Browse</div>
      <input type="file" id="ro-file-input" accept="application/pdf" />
    </div>
    <div class="helper-text" id="ro-hint"></div>
    <div class="thumb-grid" id="ro-thumbs"></div>
    <div class="btn-row hidden" id="ro-actions"><button class="btn btn-accent" id="ro-run">Save reordered PDF</button></div>
    <div id="ro-status"></div>
  `;
  let bytes = null;
  let order = []; // array of original page indices (0-based), current order
  const dz = container.querySelector("#ro-dropzone");
  const fileInput = container.querySelector("#ro-file-input");
  const thumbsBox = container.querySelector("#ro-thumbs");
  const actions = container.querySelector("#ro-actions");
  const statusBox = container.querySelector("#ro-status");
  const hint = container.querySelector("#ro-hint");
  let thumbCanvases = [];

  dz.addEventListener("click", () => fileInput.click());
  ["dragover","dragleave","drop"].forEach(evt => dz.addEventListener(evt, e => e.preventDefault()));
  dz.addEventListener("dragover", () => dz.classList.add("drag-over"));
  dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
  dz.addEventListener("drop", e => { dz.classList.remove("drag-over"); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener("change", () => { if(fileInput.files[0]) handleFile(fileInput.files[0]); });

  async function handleFile(f){
    thumbsBox.innerHTML = `<div class="helper-text">Rendering pages...</div>`;
    try{
      bytes = await KE.Utils.readFileAsArrayBuffer(f);
      const thumbs = await KE.Utils.renderPdfThumbnails(bytes);
      thumbCanvases = thumbs.map(t => t.canvas);
      order = thumbs.map((t,i) => i);
      renderThumbs();
      hint.textContent = `${thumbs.length} pages loaded. Drag a page to move it.`;
      actions.classList.remove("hidden");
    }catch(e){
      thumbsBox.innerHTML = `<div class="code-output error-text">${KE.Utils.escapeHtml(e.message)}</div>`;
    }
  }

  let dragFrom = null;
  function renderThumbs(){
    thumbsBox.innerHTML = "";
    order.forEach((origIdx, pos) => {
      const card = KE.Utils.el("div", { class:"thumb-card", draggable:"true" }, [
        cloneCanvas(thumbCanvases[origIdx]),
        KE.Utils.el("div", { class:"thumb-num" }, `Position ${pos+1} (orig. page ${origIdx+1})`)
      ]);
      card.addEventListener("dragstart", () => { dragFrom = pos; card.classList.add("dragging"); });
      card.addEventListener("dragend", () => card.classList.remove("dragging"));
      card.addEventListener("dragover", (e) => e.preventDefault());
      card.addEventListener("drop", (e) => {
        e.preventDefault();
        if(dragFrom === null || dragFrom === pos) return;
        const [moved] = order.splice(dragFrom, 1);
        order.splice(pos, 0, moved);
        dragFrom = null;
        renderThumbs();
      });
      thumbsBox.appendChild(card);
    });
  }

  function cloneCanvas(src){
    const c = document.createElement("canvas");
    c.width = src.width; c.height = src.height;
    c.getContext("2d").drawImage(src, 0, 0);
    return c;
  }

  container.querySelector("#ro-run").addEventListener("click", async () => {
    if(!bytes){ KE.Utils.toast("Choose a PDF first.", "error"); return; }
    if(typeof PDFLib === "undefined"){ KE.Utils.toast("PDF library failed to load. Check your internet connection.", "error"); return; }
    try{
      const src = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption:true });
      const outDoc = await PDFLib.PDFDocument.create();
      const pages = await outDoc.copyPages(src, order);
      pages.forEach(p => outDoc.addPage(p));
      const outBytes = await outDoc.save();
      const blob = new Blob([outBytes], { type:"application/pdf" });
      statusBox.innerHTML = `<div class="btn-row"><button class="btn btn-accent" id="ro-download">Download reordered.pdf</button></div>`;
      statusBox.querySelector("#ro-download").addEventListener("click", () => KE.Utils.downloadBlob("reordered.pdf", blob));
    }catch(e){
      statusBox.innerHTML = `<div class="code-output error-text">${KE.Utils.escapeHtml(e.message)}</div>`;
    }
  });
});
