/* ============================================
   KE Tools — URL Encoder / Decoder
   ============================================ */
KE.registerTool("url", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="tab-strip">
      <div class="tab-btn active" data-mode="encode">Encode</div>
      <div class="tab-btn" data-mode="decode">Decode</div>
    </div>
    <div class="form-group"><label id="url-label">Text / URL to encode</label>
      <textarea id="url-input" placeholder="Enter or paste a URL or text..." style="min-height:120px;"></textarea>
    </div>
    <div class="btn-row">
      <button class="btn btn-accent" id="url-run">Encode</button>
      <button class="btn btn-sm" id="url-copy">Copy</button>
      <button class="btn btn-ghost" id="url-clear">Clear</button>
    </div>
    <div class="form-group" style="margin-top:14px;"><label>Output</label><div class="code-output" id="url-output">Result will appear here.</div></div>
  `;
  let mode = "encode";
  const input = container.querySelector("#url-input");
  const output = container.querySelector("#url-output");
  const label = container.querySelector("#url-label");
  const runBtn = container.querySelector("#url-run");

  container.querySelectorAll(".tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      container.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      mode = tab.dataset.mode;
      label.textContent = mode === "encode" ? "Text / URL to encode" : "Encoded URL to decode";
      runBtn.textContent = mode === "encode" ? "Encode" : "Decode";
      output.textContent = "Result will appear here."; output.className = "code-output";
    });
  });

  runBtn.addEventListener("click", () => {
    const text = input.value;
    if(!text){ KE.Utils.toast("Enter some text first.", "error"); return; }
    try{
      output.textContent = mode === "encode" ? encodeURIComponent(text) : decodeURIComponent(text);
      output.className = "code-output";
    }catch(e){
      output.className = "code-output error-text";
      output.textContent = "Could not decode this text. Please check the input.";
    }
  });

  container.querySelector("#url-copy").addEventListener("click", () => {
    const t = output.textContent;
    if(!t || t === "Result will appear here."){ KE.Utils.toast("Nothing to copy yet.", "error"); return; }
    KE.Utils.copyToClipboard(t).then(() => KE.Utils.toast("Copied to clipboard.", "success"));
  });
  container.querySelector("#url-clear").addEventListener("click", () => {
    input.value = ""; output.textContent = "Result will appear here."; output.className = "code-output";
  });
});
