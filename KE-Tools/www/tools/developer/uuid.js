/* ============================================
   KE Tools — UUID Generator
   ============================================ */
KE.registerTool("uuid", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="form-row">
      <div class="form-group" style="max-width:200px;">
        <label>How many?</label>
        <input type="number" id="uuid-count" min="1" max="200" value="5" />
      </div>
      <div class="form-group" style="max-width:200px; display:flex; align-items:flex-end;">
        <label style="display:flex; align-items:center; gap:8px; margin:0;"><input type="checkbox" id="uuid-uppercase" /> Uppercase</label>
      </div>
      <div class="form-group" style="max-width:200px; display:flex; align-items:flex-end;">
        <label style="display:flex; align-items:center; gap:8px; margin:0;"><input type="checkbox" id="uuid-hyphens" checked /> Include hyphens</label>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-accent" id="uuid-gen">Generate</button>
      <button class="btn btn-sm" id="uuid-copy">Copy all</button>
      <button class="btn btn-sm" id="uuid-download">Download</button>
    </div>
    <div class="form-group" style="margin-top:14px;"><label>Generated UUIDs</label><div class="code-output" id="uuid-output">Click "Generate" to create UUID v4 values.</div></div>
  `;
  const output = container.querySelector("#uuid-output");

  function genUUID(){
    if(crypto.randomUUID) return crypto.randomUUID();
    // Fallback using crypto.getRandomValues
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map(b => b.toString(16).padStart(2,"0"));
    return `${hex.slice(0,4).join("")}-${hex.slice(4,6).join("")}-${hex.slice(6,8).join("")}-${hex.slice(8,10).join("")}-${hex.slice(10,16).join("")}`;
  }

  container.querySelector("#uuid-gen").addEventListener("click", () => {
    const count = KE.Utils.clamp(Number(container.querySelector("#uuid-count").value) || 1, 1, 200);
    const upper = container.querySelector("#uuid-uppercase").checked;
    const hyphens = container.querySelector("#uuid-hyphens").checked;
    let list = Array.from({length: count}, () => genUUID());
    if(!hyphens) list = list.map(u => u.replace(/-/g,""));
    if(upper) list = list.map(u => u.toUpperCase());
    output.textContent = list.join("\n");
  });

  container.querySelector("#uuid-copy").addEventListener("click", () => {
    const t = output.textContent;
    if(!t || t.startsWith('Click')){ KE.Utils.toast("Generate UUIDs first.", "error"); return; }
    KE.Utils.copyToClipboard(t).then(() => KE.Utils.toast("Copied to clipboard.", "success"));
  });
  container.querySelector("#uuid-download").addEventListener("click", () => {
    const t = output.textContent;
    if(!t || t.startsWith('Click')){ KE.Utils.toast("Generate UUIDs first.", "error"); return; }
    KE.Utils.downloadText("uuids.txt", t);
  });
});
