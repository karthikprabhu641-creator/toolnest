/* ============================================
   KE Tools — Hash Generator (Web Crypto API)
   ============================================ */
KE.registerTool("hash", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="tab-strip">
      <div class="tab-btn active" data-src="text">Text</div>
      <div class="tab-btn" data-src="file">File</div>
    </div>
    <div id="hash-text-panel">
      <div class="form-group"><label>Text</label><textarea id="hash-input" placeholder="Enter or paste text..." style="min-height:140px;"></textarea></div>
    </div>
    <div id="hash-file-panel" class="hidden">
      <div class="dropzone" id="hash-dropzone">
        <div class="dz-ico">📄</div>
        <div class="dz-title">Drop a file here</div>
        <div class="dz-sub">or Browse</div>
        <input type="file" id="hash-file-input" />
      </div>
      <div class="file-list" id="hash-file-list"></div>
    </div>
    <div class="btn-row" style="margin-top:14px;"><button class="btn btn-accent" id="hash-run">Generate hashes</button></div>
    <div class="result-panel" style="margin-top:16px;">
      <div class="result-row"><span class="rlabel">SHA-256</span></div>
      <div class="code-output" id="hash-256" style="margin-bottom:10px;">—</div>
      <div class="result-row"><span class="rlabel">SHA-384</span></div>
      <div class="code-output" id="hash-384" style="margin-bottom:10px;">—</div>
      <div class="result-row"><span class="rlabel">SHA-512</span></div>
      <div class="code-output" id="hash-512">—</div>
    </div>
  `;
  let src = "text";
  let file = null;

  container.querySelectorAll(".tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      container.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      src = tab.dataset.src;
      container.querySelector("#hash-text-panel").classList.toggle("hidden", src !== "text");
      container.querySelector("#hash-file-panel").classList.toggle("hidden", src !== "file");
    });
  });

  const dz = container.querySelector("#hash-dropzone");
  const fileInput = container.querySelector("#hash-file-input");
  const fileList = container.querySelector("#hash-file-list");
  dz.addEventListener("click", () => fileInput.click());
  ["dragover","dragleave","drop"].forEach(evt => dz.addEventListener(evt, e => e.preventDefault()));
  dz.addEventListener("dragover", () => dz.classList.add("drag-over"));
  dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
  dz.addEventListener("drop", e => { dz.classList.remove("drag-over"); if(e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener("change", () => { if(fileInput.files[0]) setFile(fileInput.files[0]); });

  function setFile(f){
    file = f;
    fileList.innerHTML = `<div class="file-item"><span class="fi-ico">📄</span><span class="fi-name">${KE.Utils.escapeHtml(f.name)}</span><span class="fi-size">${KE.Utils.formatBytes(f.size)}</span><button class="fi-remove">✕</button></div>`;
    fileList.querySelector(".fi-remove").addEventListener("click", () => { file = null; fileList.innerHTML = ""; fileInput.value = ""; });
  }

  async function digest(algo, buffer){
    const hashBuffer = await crypto.subtle.digest(algo, buffer);
    return [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2,"0")).join("");
  }

  container.querySelector("#hash-run").addEventListener("click", async () => {
    let buffer;
    if(src === "text"){
      const text = container.querySelector("#hash-input").value;
      if(!text){ KE.Utils.toast("Enter some text first.", "error"); return; }
      buffer = new TextEncoder().encode(text);
    } else {
      if(!file){ KE.Utils.toast("Choose a file first.", "error"); return; }
      buffer = await KE.Utils.readFileAsArrayBuffer(file);
    }
    try{
      const [h256, h384, h512] = await Promise.all([
        digest("SHA-256", buffer), digest("SHA-384", buffer), digest("SHA-512", buffer)
      ]);
      container.querySelector("#hash-256").textContent = h256;
      container.querySelector("#hash-384").textContent = h384;
      container.querySelector("#hash-512").textContent = h512;
      KE.Utils.toast("Hashes generated.", "success");
    }catch(e){
      KE.Utils.toast("Hashing requires a secure context (HTTPS or localhost).", "error");
    }
  });
});
