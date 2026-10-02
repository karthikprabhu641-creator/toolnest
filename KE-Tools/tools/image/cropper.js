/* ============================================
   KE Tools — Image Cropper
   Free crop + fixed aspect ratios + rotate/flip, all via canvas.
   ============================================ */
KE.registerTool("cropper", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="dropzone" id="cr-dropzone">
      <div class="dz-ico">✂️</div><div class="dz-title">Drop an image here</div><div class="dz-sub">or Browse</div>
      <input type="file" id="cr-file-input" accept="image/*" />
    </div>
    <div id="cr-editor" class="hidden">
      <div class="form-row" style="margin-top:16px;">
        <div class="form-group"><label>Aspect ratio</label>
          <select id="cr-ratio">
            <option value="free">Free</option><option value="1:1">1:1 (Square)</option>
            <option value="4:3">4:3</option><option value="16:9">16:9</option><option value="3:2">3:2</option>
          </select>
        </div>
        <div class="form-group" style="display:flex; align-items:flex-end; gap:8px;">
          <button class="btn btn-sm" id="cr-rot-ccw" title="Rotate left">⟲ Rotate</button>
          <button class="btn btn-sm" id="cr-rot-cw" title="Rotate right">⟳ Rotate</button>
          <button class="btn btn-sm" id="cr-flip-h" title="Flip horizontal">⇋ Flip H</button>
          <button class="btn btn-sm" id="cr-flip-v" title="Flip vertical">⇵ Flip V</button>
        </div>
      </div>
      <div style="position:relative; display:inline-block; max-width:100%; margin-top:10px; background:var(--bg-2); border-radius:var(--radius-md); overflow:hidden;" id="cr-stage">
        <img id="cr-img" style="display:block; max-width:100%; user-select:none; -webkit-user-drag:none;" draggable="false" />
        <div id="cr-box" style="position:absolute; border:2px solid var(--cyan); box-shadow:0 0 0 2000px rgba(0,0,0,.45); cursor:move;">
          <div class="cr-handle" data-h="nw" style="position:absolute; width:14px; height:14px; left:-7px; top:-7px; background:var(--cyan); border-radius:50%; cursor:nwse-resize;"></div>
          <div class="cr-handle" data-h="ne" style="position:absolute; width:14px; height:14px; right:-7px; top:-7px; background:var(--cyan); border-radius:50%; cursor:nesw-resize;"></div>
          <div class="cr-handle" data-h="sw" style="position:absolute; width:14px; height:14px; left:-7px; bottom:-7px; background:var(--cyan); border-radius:50%; cursor:nesw-resize;"></div>
          <div class="cr-handle" data-h="se" style="position:absolute; width:14px; height:14px; right:-7px; bottom:-7px; background:var(--cyan); border-radius:50%; cursor:nwse-resize;"></div>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn-accent" id="cr-apply">Crop &amp; preview</button>
        <button class="btn btn-ghost" id="cr-reset-box">Reset selection</button>
      </div>
      <div class="preview-box hidden" id="cr-preview" style="max-width:340px;"><img id="cr-out-img" /><div class="pb-label" id="cr-out-info">—</div></div>
      <div class="btn-row hidden" id="cr-actions"><button class="btn btn-accent" id="cr-download">Download cropped image</button></div>
    </div>
  `;

  const dz = container.querySelector("#cr-dropzone");
  const fileInput = container.querySelector("#cr-file-input");
  const editor = container.querySelector("#cr-editor");
  const stage = container.querySelector("#cr-stage");
  const imgEl = container.querySelector("#cr-img");
  const box = container.querySelector("#cr-box");
  const ratioSelect = container.querySelector("#cr-ratio");
  const preview = container.querySelector("#cr-preview");
  const actions = container.querySelector("#cr-actions");

  let sourceCanvas = null; // holds current (post rotate/flip) full-res pixels
  let rect = { x:40, y:40, w:160, h:120 }; // in displayed px, relative to stage
  let outBlob = null;

  dz.addEventListener("click", () => fileInput.click());
  ["dragover","dragleave","drop"].forEach(evt => dz.addEventListener(evt, e => e.preventDefault()));
  dz.addEventListener("dragover", () => dz.classList.add("drag-over"));
  dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
  dz.addEventListener("drop", e => { dz.classList.remove("drag-over"); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener("change", () => { if(fileInput.files[0]) handleFile(fileInput.files[0]); });

  async function handleFile(f){
    if(!f.type.startsWith("image/")){ KE.Utils.toast("Please choose an image file.", "error"); return; }
    const img = await KE.Utils.loadImage(await KE.Utils.readFileAsDataURL(f));
    sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = img.naturalWidth; sourceCanvas.height = img.naturalHeight;
    sourceCanvas.getContext("2d").drawImage(img, 0, 0);
    updateDisplay();
    editor.classList.remove("hidden");
    imgEl.onload = () => resetBox();
  }

  function updateDisplay(){
    imgEl.src = sourceCanvas.toDataURL("image/png");
  }

  function transformCanvas(rotateDeg, flipH, flipV){
    const w = sourceCanvas.width, h = sourceCanvas.height;
    const swap = Math.abs(rotateDeg) === 90;
    const out = document.createElement("canvas");
    out.width = swap ? h : w; out.height = swap ? w : h;
    const ctx = out.getContext("2d");
    ctx.save();
    ctx.translate(out.width/2, out.height/2);
    ctx.rotate(rotateDeg * Math.PI/180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(sourceCanvas, -w/2, -h/2);
    ctx.restore();
    sourceCanvas = out;
    updateDisplay();
  }

  container.querySelector("#cr-rot-cw").addEventListener("click", () => transformCanvas(90, false, false));
  container.querySelector("#cr-rot-ccw").addEventListener("click", () => transformCanvas(-90, false, false));
  container.querySelector("#cr-flip-h").addEventListener("click", () => transformCanvas(0, true, false));
  container.querySelector("#cr-flip-v").addEventListener("click", () => transformCanvas(0, false, true));

  function ratioValue(){
    const v = ratioSelect.value;
    if(v === "free") return null;
    const [a,b] = v.split(":").map(Number);
    return a/b;
  }

  function resetBox(){
    const stageW = stage.clientWidth, stageH = imgEl.clientHeight || stage.clientHeight;
    let w = stageW * 0.6, h = stageH * 0.6;
    const ar = ratioValue();
    if(ar) h = w / ar;
    rect = { x:(stageW-w)/2, y:(stageH-h)/2, w, h };
    clampRect();
    renderBox();
  }
  container.querySelector("#cr-reset-box").addEventListener("click", resetBox);
  ratioSelect.addEventListener("change", resetBox);

  function clampRect(){
    const stageW = stage.clientWidth, stageH = imgEl.clientHeight || stage.clientHeight;
    rect.w = KE.Utils.clamp(rect.w, 20, stageW);
    rect.h = KE.Utils.clamp(rect.h, 20, stageH);
    rect.x = KE.Utils.clamp(rect.x, 0, stageW - rect.w);
    rect.y = KE.Utils.clamp(rect.y, 0, stageH - rect.h);
  }

  function renderBox(){
    box.style.left = rect.x + "px"; box.style.top = rect.y + "px";
    box.style.width = rect.w + "px"; box.style.height = rect.h + "px";
  }

  // Dragging the whole box
  let dragMode = null, dragStart = null, rectStart = null;
  box.addEventListener("pointerdown", (e) => {
    if(e.target.classList.contains("cr-handle")) return;
    dragMode = "move"; dragStart = { x:e.clientX, y:e.clientY }; rectStart = { ...rect };
    box.setPointerCapture(e.pointerId);
  });
  box.querySelectorAll(".cr-handle").forEach(h => {
    h.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      dragMode = "resize-" + h.dataset.h; dragStart = { x:e.clientX, y:e.clientY }; rectStart = { ...rect };
      h.setPointerCapture(e.pointerId);
    });
  });
  window.addEventListener("pointermove", (e) => {
    if(!dragMode) return;
    const dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
    const ar = ratioValue();
    if(dragMode === "move"){
      rect.x = rectStart.x + dx; rect.y = rectStart.y + dy;
    } else {
      const corner = dragMode.split("-")[1];
      let { x,y,w,h } = rectStart;
      if(corner === "se"){ w += dx; h = ar ? w/ar : h + dy; }
      if(corner === "sw"){ w -= dx; x += dx; h = ar ? w/ar : h + dy; }
      if(corner === "ne"){ w += dx; h = ar ? w/ar : h - dy; y = ar ? y + (rectStart.h - h) : y + dy; }
      if(corner === "nw"){ w -= dx; x += dx; h = ar ? w/ar : h - dy; y = ar ? y + (rectStart.h - h) : y + dy; }
      rect = { x, y, w: Math.max(20,w), h: Math.max(20,h) };
    }
    clampRect();
    renderBox();
  });
  window.addEventListener("pointerup", () => { dragMode = null; });

  container.querySelector("#cr-apply").addEventListener("click", () => {
    if(!sourceCanvas){ KE.Utils.toast("Choose an image first.", "error"); return; }
    const scaleX = sourceCanvas.width / imgEl.clientWidth;
    const scaleY = sourceCanvas.height / imgEl.clientHeight;
    const sx = rect.x * scaleX, sy = rect.y * scaleY, sw = rect.w * scaleX, sh = rect.h * scaleY;
    const out = document.createElement("canvas");
    out.width = Math.round(sw); out.height = Math.round(sh);
    out.getContext("2d").drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, out.width, out.height);
    out.toBlob(blob => {
      outBlob = blob;
      preview.classList.remove("hidden");
      container.querySelector("#cr-out-img").src = URL.createObjectURL(blob);
      container.querySelector("#cr-out-info").textContent = `${out.width} × ${out.height} — ${KE.Utils.formatBytes(blob.size)}`;
      actions.classList.remove("hidden");
    }, "image/png");
  });

  container.querySelector("#cr-download").addEventListener("click", () => {
    if(!outBlob){ KE.Utils.toast("Crop an image first.", "error"); return; }
    KE.Utils.downloadBlob("cropped.png", outBlob);
  });
});
