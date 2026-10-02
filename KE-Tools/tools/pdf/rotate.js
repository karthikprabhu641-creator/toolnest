/* ============================================
   KE Tools — Rotate Pages (PDF)
   Uses pdf-lib + PDF.js (loaded via CDN — see README).
   ============================================ */
KE.registerTool("rotate-pdf", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="dropzone" id="rp-dropzone">
      <div class="dz-ico">🔃</div><div class="dz-title">Drop a PDF here</div><div class="dz-sub">or Browse</div>
      <input type="file" id="rp-file-input" accept="application/pdf" />
    </div>
    <div class="helper-text" id="rp-hint"></div>
    <div class="thumb-grid" id="rp-thumbs"></div>
    <div class="btn-row hidden" id="rp-actions">
      <button class="btn" id="rp-90">Rotate selected 90°</button>
      <button class="btn" id="rp-180">Rotate selected 180°</button>
      <button class="btn" id="rp-270">Rotate selected 270°</button>
      <button class="btn btn-ghost" id="rp-clear-sel">Clear selection</button>
    </div>
    <div class="btn-row hidden" id="rp-save-row"><button class="btn btn-accent" id="rp-save">Save rotated PDF</button></div>
    <div id="rp-status"></div>
  `;
  let bytes = null;
  let rotations = []; // per-page cumulative rotation in degrees
  let selected = new Set();
  const dz = container.querySelector("#rp-dropzone");
  const fileInput = container.querySelector("#rp-file-input");
  const thumbsBox = container.querySelector("#rp-thumbs");
  const actions = container.querySelector("#rp-actions");
  const saveRow = container.querySelector("#rp-save-row");
  const statusBox = container.querySelector("#rp-status");
  const hint = container.querySelector("#rp-hint");

  dz.addEventListener("click", () => fileInput.click());
  ["dragover","dragleave","drop"].forEach(evt => dz.addEventListener(evt, e => e.preventDefault()));
  dz.addEventListener("dragover", () => dz.classList.add("drag-over"));
  dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
  dz.addEventListener("drop", e => { dz.classList.remove("drag-over"); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener("change", () => { if(fileInput.files[0]) handleFile(fileInput.files[0]); });

  async function handleFile(f){
    thumbsBox.innerHTML = `<div class="helper-text">Rendering pages...</div>`;
    selected = new Set();
    try{
      bytes = await KE.Utils.readFileAsArrayBuffer(f);
      const thumbs = await KE.Utils.renderPdfThumbnails(bytes);
      rotations = thumbs.map(() => 0);
      renderThumbs(thumbs);
      hint.textContent = `${thumbs.length} pages loaded. Tap pages to select, then choose a rotation.`;
      actions.classList.remove("hidden");
      saveRow.classList.remove("hidden");
    }catch(e){
      thumbsBox.innerHTML = `<div class="code-output error-text">${KE.Utils.escapeHtml(e.message)}</div>`;
    }
  }

  function renderThumbs(thumbs){
    thumbsBox.innerHTML = "";
    thumbs.forEach(t => {
      const wrap = KE.Utils.el("div", { class:"thumb-card", "data-page": t.pageNum });
      const inner = KE.Utils.el("div", {}, [t.canvas]);
      inner.style.transform = "rotate(0deg)";
      inner.style.transition = "transform .15s ease";
      wrap.appendChild(inner);
      wrap.appendChild(KE.Utils.el("div", { class:"thumb-num" }, `Page ${t.pageNum}`));
      wrap.addEventListener("click", () => {
        const idx = t.pageNum - 1;
        if(selected.has(idx)){ selected.delete(idx); wrap.classList.remove("selected"); }
        else { selected.add(idx); wrap.classList.add("selected"); }
      });
      wrap.querySelector("div").dataset.rotWrap = t.pageNum;
      thumbsBox.appendChild(wrap);
    });
  }

  function applyRotationPreview(idx){
    const wrap = thumbsBox.querySelector(`.thumb-card[data-page="${idx+1}"] > div`);
    if(wrap) wrap.style.transform = `rotate(${rotations[idx]}deg)`;
  }

  function rotateSelected(delta){
    if(selected.size === 0){ KE.Utils.toast("Select at least one page first.", "error"); return; }
    selected.forEach(idx => {
      rotations[idx] = ((rotations[idx] + delta) % 360 + 360) % 360;
      applyRotationPreview(idx);
    });
  }
  container.querySelector("#rp-90").addEventListener("click", () => rotateSelected(90));
  container.querySelector("#rp-180").addEventListener("click", () => rotateSelected(180));
  container.querySelector("#rp-270").addEventListener("click", () => rotateSelected(270));
  container.querySelector("#rp-clear-sel").addEventListener("click", () => {
    selected = new Set();
    thumbsBox.querySelectorAll(".thumb-card").forEach(c => c.classList.remove("selected"));
  });

  container.querySelector("#rp-save").addEventListener("click", async () => {
    if(!bytes){ KE.Utils.toast("Choose a PDF first.", "error"); return; }
    if(typeof PDFLib === "undefined"){ KE.Utils.toast("PDF library failed to load. Check your internet connection.", "error"); return; }
    try{
      const doc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption:true });
      const pages = doc.getPages();
      pages.forEach((page, i) => {
        if(rotations[i]){
          const current = page.getRotation().angle;
          page.setRotation(PDFLib.degrees((current + rotations[i]) % 360));
        }
      });
      const outBytes = await doc.save();
      const blob = new Blob([outBytes], { type:"application/pdf" });
      statusBox.innerHTML = `<div class="btn-row"><button class="btn btn-accent" id="rp-download">Download rotated.pdf</button></div>`;
      statusBox.querySelector("#rp-download").addEventListener("click", () => KE.Utils.downloadBlob("rotated.pdf", blob));
    }catch(e){
      statusBox.innerHTML = `<div class="code-output error-text">${KE.Utils.escapeHtml(e.message)}</div>`;
    }
  });
});
