/* ============================================
   KE Tools — HTML Entity Encoder / Decoder
   ============================================ */
KE.registerTool("html-entities", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="tab-strip">
      <div class="tab-btn active" data-mode="encode">Encode</div>
      <div class="tab-btn" data-mode="decode">Decode</div>
    </div>
    <div class="form-group"><label id="he-label">Text to encode</label>
      <textarea id="he-input" placeholder="Enter or paste text or HTML..." style="min-height:150px;"></textarea>
    </div>
    <div class="btn-row">
      <button class="btn btn-accent" id="he-run">Encode</button>
      <button class="btn btn-sm" id="he-copy">Copy</button>
      <button class="btn btn-ghost" id="he-clear">Clear</button>
    </div>
    <div class="form-group" style="margin-top:14px;"><label>Output</label><div class="code-output" id="he-output">Result will appear here.</div></div>
  `;
  let mode = "encode";
  const input = container.querySelector("#he-input");
  const output = container.querySelector("#he-output");
  const label = container.querySelector("#he-label");
  const runBtn = container.querySelector("#he-run");

  container.querySelectorAll(".tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      container.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      mode = tab.dataset.mode;
      label.textContent = mode === "encode" ? "Text to encode" : "HTML entities to decode";
      runBtn.textContent = mode === "encode" ? "Encode" : "Decode";
      output.textContent = "Result will appear here.";
    });
  });

  function encode(str){
    return str.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  }
  function decode(str){
    const ta = document.createElement("textarea");
    ta.innerHTML = str;
    return ta.value;
  }

  runBtn.addEventListener("click", () => {
    const text = input.value;
    if(!text){ KE.Utils.toast("Enter some text first.", "error"); return; }
    output.textContent = mode === "encode" ? encode(text) : decode(text);
  });

  container.querySelector("#he-copy").addEventListener("click", () => {
    const t = output.textContent;
    if(!t || t === "Result will appear here."){ KE.Utils.toast("Nothing to copy yet.", "error"); return; }
    KE.Utils.copyToClipboard(t).then(() => KE.Utils.toast("Copied to clipboard.", "success"));
  });
  container.querySelector("#he-clear").addEventListener("click", () => { input.value=""; output.textContent="Result will appear here."; });
});
