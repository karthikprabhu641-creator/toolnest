/* ============================================
   KE Tools — Split PDF
   Uses pdf-lib (loaded via CDN — see README).
   ============================================ */
KE.registerTool("split", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="dropzone" id="sp-dropzone">
      <div class="dz-ico">✂️</div><div class="dz-title">Drop a PDF here</div><div class="dz-sub">or Browse</div>
      <input type="file" id="sp-file-input" accept="application/pdf" />
    </div>
    <div class="file-list" id="sp-file-list"></div>
    <div class="tab-strip">
      <div class="tab-btn active" data-mode="every">Split every page</div>
      <div class="tab-btn" data-mode="range">Custom ranges</div>
    </div>
    <div id="sp-range-panel" class="hidden">
      <div class="form-group"><label>Page ranges (comma separated, e.g. 1-3,4-6,7)</label><input type="text" id="sp-ranges" placeholder="1-3,4-6,7" /></div>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="sp-run">Split PDF</button></div>
    <div id="sp-status"></div>
  `;
  let file = null, pageCount = 0, mode = "every";
  const dz = container.querySelector("#sp-dropzone");
  const fileInput = container.querySelector("#sp-file-input");
  const listBox = container.querySelector("#sp-file-list");
  const statusBox = container.querySelector("#sp-status");

  container.querySelectorAll(".tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      container.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      mode = tab.dataset.mode;
      container.querySelector("#sp-range-panel").classList.toggle("hidden", mode !== "range");
    });
  });

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

  container.querySelector("#sp-run").addEventListener("click", async () => {
    if(!file){ KE.Utils.toast("Choose a PDF first.", "error"); return; }
    statusBox.innerHTML = `<div class="helper-text">Splitting...</div>`;
    try{
      const bytes = await KE.Utils.readFileAsArrayBuffer(file);
      const src = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption:true });
      let groups = [];
      if(mode === "every"){
        for(let i=0;i<pageCount;i++) groups.push([i]);
      } else {
        const rangesStr = container.querySelector("#sp-ranges").value;
        const parts = rangesStr.split(",").map(p => p.trim()).filter(Boolean);
        if(parts.length === 0) throw new Error("Enter at least one page range.");
        groups = parts.map(p => KE.Utils.parsePageRange(p, pageCount));
      }
      const outputs = [];
      for(let g=0; g<groups.length; g++){
        const outDoc = await PDFLib.PDFDocument.create();
        const pages = await outDoc.copyPages(src, groups[g]);
        pages.forEach(p => outDoc.addPage(p));
        const outBytes = await outDoc.save();
        outputs.push({ name: `split-part-${g+1}.pdf`, blob: new Blob([outBytes], { type:"application/pdf" }) });
      }
      statusBox.innerHTML = `<div class="result-panel"><div class="result-row"><span class="rlabel">Created</span><span class="rval">${outputs.length} file(s)</span></div></div>
        <div class="file-list" id="sp-outputs"></div>`;
      const outBox = statusBox.querySelector("#sp-outputs");
      outputs.forEach(o => {
        const row = KE.Utils.el("div", { class:"file-item" }, [
          KE.Utils.el("span", { class:"fi-ico" }, "📄"),
          KE.Utils.el("span", { class:"fi-name" }, o.name),
          KE.Utils.el("button", { class:"btn btn-sm", onclick:() => KE.Utils.downloadBlob(o.name, o.blob) }, "Download"),
        ]);
        outBox.appendChild(row);
      });
    }catch(e){
      statusBox.innerHTML = `<div class="code-output error-text">${KE.Utils.escapeHtml(e.message)}</div>`;
    }
  });
});
