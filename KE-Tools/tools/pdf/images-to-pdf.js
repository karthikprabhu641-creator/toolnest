/* ============================================
   KE Tools — Images → PDF
   Uses pdf-lib (loaded via CDN — see README).
   ============================================ */
KE.registerTool("images-to-pdf", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="dropzone" id="ip-dropzone">
      <div class="dz-ico">🖨️</div><div class="dz-title">Drop images here</div><div class="dz-sub">or Browse — choose multiple images</div>
      <input type="file" id="ip-file-input" accept="image/png,image/jpeg" multiple />
    </div>
    <div class="helper-text">Drag the ☰ handle to reorder images before generating the PDF.</div>
    <div class="file-list" id="ip-file-list"></div>
    <div class="form-row" style="margin-top:16px;">
      <div class="form-group"><label>Page size</label>
        <select id="ip-page-size"><option value="a4">A4</option><option value="letter">Letter</option><option value="fit">Fit to image</option></select>
      </div>
      <div class="form-group"><label>Orientation</label>
        <select id="ip-orientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select>
      </div>
      <div class="form-group"><label>Margin (pt)</label><input type="number" id="ip-margin" min="0" max="100" value="20" /></div>
      <div class="form-group"><label>Image fit</label>
        <select id="ip-fit"><option value="contain">Fit within page</option><option value="cover">Fill page (crop)</option></select>
      </div>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="ip-run">Create PDF</button><button class="btn btn-ghost" id="ip-clear">Clear all</button></div>
    <div id="ip-status"></div>
  `;
  let files = [];
  const dz = container.querySelector("#ip-dropzone");
  const fileInput = container.querySelector("#ip-file-input");
  const listBox = container.querySelector("#ip-file-list");
  const statusBox = container.querySelector("#ip-status");

  dz.addEventListener("click", () => fileInput.click());
  ["dragover","dragleave","drop"].forEach(evt => dz.addEventListener(evt, e => e.preventDefault()));
  dz.addEventListener("dragover", () => dz.classList.add("drag-over"));
  dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
  dz.addEventListener("drop", e => { dz.classList.remove("drag-over"); addFiles(e.dataTransfer.files); });
  fileInput.addEventListener("change", () => addFiles(fileInput.files));

  function addFiles(fileListObj){
    Array.from(fileListObj).forEach(f => {
      if(f.type !== "image/png" && f.type !== "image/jpeg"){
        KE.Utils.toast(`"${f.name}" must be PNG or JPG — it was skipped.`, "error"); return;
      }
      files.push({ id: KE.Utils.uid(), file: f });
    });
    renderList();
  }

  let dragIndex = null;
  function renderList(){
    listBox.innerHTML = files.map((item, i) => `
      <div class="file-item" draggable="true" data-id="${item.id}">
        <span class="fi-drag">☰</span><span class="fi-ico">🖼️</span>
        <span class="fi-name">${i+1}. ${KE.Utils.escapeHtml(item.file.name)}</span>
        <span class="fi-size">${KE.Utils.formatBytes(item.file.size)}</span>
        <button class="fi-remove">✕</button>
      </div>`).join("");
    listBox.querySelectorAll(".file-item").forEach((el, i) => {
      el.querySelector(".fi-remove").addEventListener("click", () => { files = files.filter(f => f.id !== el.dataset.id); renderList(); });
      el.addEventListener("dragstart", () => { dragIndex = i; el.classList.add("dragging"); });
      el.addEventListener("dragend", () => el.classList.remove("dragging"));
      el.addEventListener("dragover", (e) => e.preventDefault());
      el.addEventListener("drop", (e) => {
        e.preventDefault();
        if(dragIndex === null || dragIndex === i) return;
        const [moved] = files.splice(dragIndex, 1);
        files.splice(i, 0, moved);
        dragIndex = null; renderList();
      });
    });
  }

  container.querySelector("#ip-clear").addEventListener("click", () => { files = []; renderList(); statusBox.innerHTML = ""; });

  const PAGE_SIZES = { a4:[595.28, 841.89], letter:[612, 792] };

  container.querySelector("#ip-run").addEventListener("click", async () => {
    if(typeof PDFLib === "undefined"){ KE.Utils.toast("PDF library failed to load. Check your internet connection.", "error"); return; }
    if(files.length === 0){ KE.Utils.toast("Add at least one image.", "error"); return; }
    statusBox.innerHTML = `<div class="helper-text">Building PDF...</div>`;
    try{
      const doc = await PDFLib.PDFDocument.create();
      const sizeKey = container.querySelector("#ip-page-size").value;
      const orientation = container.querySelector("#ip-orientation").value;
      const margin = Number(container.querySelector("#ip-margin").value) || 0;
      const fitMode = container.querySelector("#ip-fit").value;

      for(const item of files){
        const bytes = await KE.Utils.readFileAsArrayBuffer(item.file);
        const isPng = item.file.type === "image/png";
        const embedded = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        let pageW, pageH;
        if(sizeKey === "fit"){
          pageW = embedded.width + margin*2; pageH = embedded.height + margin*2;
        } else {
          [pageW, pageH] = PAGE_SIZES[sizeKey];
          if(orientation === "landscape") [pageW, pageH] = [pageH, pageW];
        }
        const page = doc.addPage([pageW, pageH]);
        const availW = pageW - margin*2, availH = pageH - margin*2;
        const scaleContain = Math.min(availW / embedded.width, availH / embedded.height);
        const scaleCover = Math.max(availW / embedded.width, availH / embedded.height);
        const scale = sizeKey === "fit" ? 1 : (fitMode === "cover" ? scaleCover : scaleContain);
        const drawW = embedded.width * scale, drawH = embedded.height * scale;
        page.drawImage(embedded, {
          x: (pageW - drawW)/2, y: (pageH - drawH)/2, width: drawW, height: drawH
        });
      }
      const outBytes = await doc.save();
      const blob = new Blob([outBytes], { type:"application/pdf" });
      statusBox.innerHTML = `<div class="result-panel"><div class="result-row"><span class="rlabel">PDF created</span><span class="rval">${files.length} page(s) · ${KE.Utils.formatBytes(blob.size)}</span></div></div>
        <div class="btn-row"><button class="btn btn-accent" id="ip-download">Download images.pdf</button></div>`;
      statusBox.querySelector("#ip-download").addEventListener("click", () => KE.Utils.downloadBlob("images.pdf", blob));
    }catch(e){
      statusBox.innerHTML = `<div class="code-output error-text">Could not build this PDF: ${KE.Utils.escapeHtml(e.message)}</div>`;
    }
  });
});
