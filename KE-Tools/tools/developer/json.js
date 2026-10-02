/* ============================================
   KE Tools — JSON Formatter
   ============================================ */
KE.registerTool("json", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="form-group">
      <label>JSON input</label>
      <textarea id="json-input" placeholder="Enter or paste JSON..." style="min-height:220px;"></textarea>
    </div>
    <div class="btn-row">
      <button class="btn btn-accent" id="json-format">Format</button>
      <button class="btn" id="json-minify">Minify</button>
      <button class="btn" id="json-validate">Validate</button>
      <button class="btn btn-sm" id="json-copy">Copy</button>
      <button class="btn btn-sm" id="json-download">Download</button>
      <button class="btn btn-ghost" id="json-clear">Clear</button>
    </div>
    <div id="json-status" style="margin-top:12px;"></div>
    <div class="form-group" style="margin-top:14px;">
      <label>Output</label>
      <div class="code-output" id="json-output">Formatted or minified JSON will appear here.</div>
    </div>
  `;
  const input = container.querySelector("#json-input");
  const output = container.querySelector("#json-output");
  const status = container.querySelector("#json-status");

  function parseWithLineInfo(text){
    try{
      return { ok:true, value: JSON.parse(text) };
    }catch(e){
      const match = /position (\d+)/.exec(e.message);
      let lineInfo = "";
      if(match){
        const pos = Number(match[1]);
        const upToError = text.slice(0, pos);
        const line = upToError.split("\n").length;
        const col = pos - upToError.lastIndexOf("\n");
        lineInfo = ` (line ${line}, column ${col})`;
      }
      return { ok:false, error: e.message + lineInfo };
    }
  }

  container.querySelector("#json-format").addEventListener("click", () => {
    const text = input.value.trim();
    if(!text){ KE.Utils.toast("Enter some JSON first.", "error"); return; }
    const r = parseWithLineInfo(text);
    if(!r.ok){
      output.className = "code-output error-text";
      output.textContent = "Invalid JSON: " + r.error;
      status.innerHTML = `<span class="badge badge-danger">Invalid</span>`;
      return;
    }
    output.className = "code-output";
    output.textContent = JSON.stringify(r.value, null, 2);
    status.innerHTML = `<span class="badge badge-success">Valid JSON</span>`;
  });

  container.querySelector("#json-minify").addEventListener("click", () => {
    const text = input.value.trim();
    if(!text){ KE.Utils.toast("Enter some JSON first.", "error"); return; }
    const r = parseWithLineInfo(text);
    if(!r.ok){
      output.className = "code-output error-text";
      output.textContent = "Invalid JSON: " + r.error;
      status.innerHTML = `<span class="badge badge-danger">Invalid</span>`;
      return;
    }
    output.className = "code-output";
    output.textContent = JSON.stringify(r.value);
    status.innerHTML = `<span class="badge badge-success">Valid JSON</span>`;
  });

  container.querySelector("#json-validate").addEventListener("click", () => {
    const text = input.value.trim();
    if(!text){ KE.Utils.toast("Enter some JSON first.", "error"); return; }
    const r = parseWithLineInfo(text);
    if(r.ok){
      status.innerHTML = `<span class="badge badge-success">Valid JSON</span>`;
      KE.Utils.toast("This is valid JSON.", "success");
    } else {
      status.innerHTML = `<span class="badge badge-danger">Invalid</span>`;
      output.className = "code-output error-text";
      output.textContent = "Invalid JSON: " + r.error;
    }
  });

  container.querySelector("#json-copy").addEventListener("click", () => {
    const text = output.textContent;
    if(!text || text.startsWith("Formatted")){ KE.Utils.toast("Nothing to copy yet.", "error"); return; }
    KE.Utils.copyToClipboard(text).then(() => KE.Utils.toast("Copied to clipboard.", "success"));
  });
  container.querySelector("#json-download").addEventListener("click", () => {
    const text = output.textContent;
    if(!text || text.startsWith("Formatted")){ KE.Utils.toast("Nothing to download yet.", "error"); return; }
    KE.Utils.downloadText("data.json", text, "application/json");
  });
  container.querySelector("#json-clear").addEventListener("click", () => {
    input.value = ""; output.textContent = "Formatted or minified JSON will appear here."; output.className="code-output"; status.innerHTML = "";
  });
});
