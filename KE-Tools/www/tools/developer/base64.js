/* ============================================
   KE Tools — Base64 Encoder / Decoder
   ============================================ */
KE.registerTool("base64", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="tab-strip">
      <div class="tab-btn active" data-mode="encode">Encode</div>
      <div class="tab-btn" data-mode="decode">Decode</div>
    </div>
    <div class="form-group">
      <label id="b64-input-label">Text to encode</label>
      <textarea id="b64-input" placeholder="Enter or paste text..." style="min-height:160px;"></textarea>
    </div>
    <div class="btn-row">
      <button class="btn btn-accent" id="b64-run">Encode</button>
      <button class="btn btn-sm" id="b64-copy">Copy</button>
      <button class="btn btn-sm" id="b64-download">Download</button>
      <button class="btn btn-ghost" id="b64-clear">Clear</button>
    </div>
    <div class="form-group" style="margin-top:14px;">
      <label>Output</label>
      <div class="code-output" id="b64-output">Result will appear here.</div>
    </div>
  `;
  let mode = "encode";
  const input = container.querySelector("#b64-input");
  const output = container.querySelector("#b64-output");
  const label = container.querySelector("#b64-input-label");
  const runBtn = container.querySelector("#b64-run");

  container.querySelectorAll(".tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      container.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      mode = tab.dataset.mode;
      label.textContent = mode === "encode" ? "Text to encode" : "Base64 to decode";
      input.placeholder = mode === "encode" ? "Enter or paste text..." : "Enter or paste Base64...";
      runBtn.textContent = mode === "encode" ? "Encode" : "Decode";
      output.textContent = "Result will appear here.";
      output.className = "code-output";
    });
  });

  runBtn.addEventListener("click", () => {
    const text = input.value;
    if(!text){ KE.Utils.toast("Enter some text first.", "error"); return; }
    try{
      if(mode === "encode"){
        output.textContent = btoa(unescape(encodeURIComponent(text)));
      } else {
        output.textContent = decodeURIComponent(escape(atob(text.trim())));
      }
      output.className = "code-output";
    }catch(e){
      output.className = "code-output error-text";
      output.textContent = mode === "encode" ? "Could not encode this text." : "This isn't valid Base64. Please check the input.";
    }
  });

  container.querySelector("#b64-copy").addEventListener("click", () => {
    const t = output.textContent;
    if(!t || t === "Result will appear here."){ KE.Utils.toast("Nothing to copy yet.", "error"); return; }
    KE.Utils.copyToClipboard(t).then(() => KE.Utils.toast("Copied to clipboard.", "success"));
  });
  container.querySelector("#b64-download").addEventListener("click", () => {
    const t = output.textContent;
    if(!t || t === "Result will appear here."){ KE.Utils.toast("Nothing to download yet.", "error"); return; }
    KE.Utils.downloadText("base64-result.txt", t);
  });
  container.querySelector("#b64-clear").addEventListener("click", () => {
    input.value = ""; output.textContent = "Result will appear here."; output.className = "code-output";
  });
});
