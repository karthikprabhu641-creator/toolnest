/* ============================================
   KE Tools — Image Rotate / Flip
   ============================================ */
KE.registerTool("rotate", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="dropzone" id="rt-dropzone">
      <div class="dz-ico">🔁</div><div class="dz-title">Drop an image here</div><div class="dz-sub">or Browse</div>
      <input type="file" id="rt-file-input" accept="image/*" />
    </div>
    <div class="btn-row hidden" id="rt-controls">
      <button class="btn" id="rt-cw">⟳ Rotate 90°</button>
      <button class="btn" id="rt-ccw">⟲ Rotate -90°</button>
      <button class="btn" id="rt-fliph">⇋ Flip horizontal</button>
      <button class="btn" id="rt-flipv">⇵ Flip vertical</button>
      <button class="btn btn-ghost" id="rt-undo">Reset</button>
    </div>
    <div class="preview-box hidden" id="rt-preview" style="max-width:380px;"><img id="rt-img" /><div class="pb-label" id="rt-info">—</div></div>
    <div class="btn-row hidden" id="rt-actions"><button class="btn btn-accent" id="rt-download">Download image</button></div>
  `;
  const dz = container.querySelector("#rt-dropzone");
  const fileInput = container.querySelector("#rt-file-input");
  const controls = container.querySelector("#rt-controls");
  const preview = container.querySelector("#rt-preview");
  const actions = container.querySelector("#rt-actions");
  let originalImg = null, canvas = null, outBlob = null;

  dz.addEventListener("click", () => fileInput.click());
  ["dragover","dragleave","drop"].forEach(evt => dz.addEventListener(evt, e => e.preventDefault()));
  dz.addEventListener("dragover", () => dz.classList.add("drag-over"));
  dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
  dz.addEventListener("drop", e => { dz.classList.remove("drag-over"); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener("change", () => { if(fileInput.files[0]) handleFile(fileInput.files[0]); });

  async function handleFile(f){
    if(!f.type.startsWith("image/")){ KE.Utils.toast("Please choose an image file.", "error"); return; }
    originalImg = await KE.Utils.loadImage(await KE.Utils.readFileAsDataURL(f));
    canvas = document.createElement("canvas");
    canvas.width = originalImg.naturalWidth; canvas.height = originalImg.naturalHeight;
    canvas.getContext("2d").drawImage(originalImg, 0, 0);
    controls.classList.remove("hidden");
    render();
  }

  function transform(rotateDeg, flipH, flipV){
    const w = canvas.width, h = canvas.height;
    const swap = Math.abs(rotateDeg) === 90;
    const out = document.createElement("canvas");
    out.width = swap ? h : w; out.height = swap ? w : h;
    const ctx = out.getContext("2d");
    ctx.save();
    ctx.translate(out.width/2, out.height/2);
    ctx.rotate(rotateDeg * Math.PI/180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(canvas, -w/2, -h/2);
    ctx.restore();
    canvas = out;
    render();
  }

  function render(){
    canvas.toBlob(blob => {
      outBlob = blob;
      preview.classList.remove("hidden");
      container.querySelector("#rt-img").src = URL.createObjectURL(blob);
      container.querySelector("#rt-info").textContent = `${canvas.width} × ${canvas.height} — ${KE.Utils.formatBytes(blob.size)}`;
      actions.classList.remove("hidden");
    }, "image/png");
  }

  container.querySelector("#rt-cw").addEventListener("click", () => transform(90, false, false));
  container.querySelector("#rt-ccw").addEventListener("click", () => transform(-90, false, false));
  container.querySelector("#rt-fliph").addEventListener("click", () => transform(0, true, false));
  container.querySelector("#rt-flipv").addEventListener("click", () => transform(0, false, true));
  container.querySelector("#rt-undo").addEventListener("click", () => {
    if(!originalImg) return;
    canvas = document.createElement("canvas");
    canvas.width = originalImg.naturalWidth; canvas.height = originalImg.naturalHeight;
    canvas.getContext("2d").drawImage(originalImg, 0, 0);
    render();
  });

  container.querySelector("#rt-download").addEventListener("click", () => {
    if(!outBlob){ KE.Utils.toast("Choose an image first.", "error"); return; }
    KE.Utils.downloadBlob("rotated.png", outBlob);
  });
});
