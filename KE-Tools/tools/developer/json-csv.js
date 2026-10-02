/* ============================================
   KE Tools — JSON ↔ CSV
   ============================================ */
KE.registerTool("json-csv", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="tab-strip">
      <div class="tab-btn active" data-mode="json-to-csv">JSON → CSV</div>
      <div class="tab-btn" data-mode="csv-to-json">CSV → JSON</div>
    </div>
    <div class="form-group"><label id="jc-label">JSON array input</label>
      <textarea id="jc-input" placeholder='Enter or paste a JSON array, e.g. [{"name":"A","age":20}]' style="min-height:180px;"></textarea>
    </div>
    <div class="btn-row">
      <button class="btn btn-accent" id="jc-run">Convert</button>
      <button class="btn btn-sm" id="jc-copy">Copy</button>
      <button class="btn btn-sm" id="jc-download">Download</button>
      <button class="btn btn-ghost" id="jc-clear">Clear</button>
    </div>
    <div class="form-group" style="margin-top:14px;"><label>Output</label><div class="code-output" id="jc-output">Result will appear here.</div></div>
  `;
  let mode = "json-to-csv";
  const input = container.querySelector("#jc-input");
  const output = container.querySelector("#jc-output");
  const label = container.querySelector("#jc-label");

  container.querySelectorAll(".tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      container.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      mode = tab.dataset.mode;
      label.textContent = mode === "json-to-csv" ? "JSON array input" : "CSV input";
      input.placeholder = mode === "json-to-csv" ? 'Enter or paste a JSON array, e.g. [{"name":"A","age":20}]' : "Enter or paste CSV, first row as headers...";
      output.textContent = "Result will appear here."; output.className = "code-output";
    });
  });

  function jsonToCsv(arr){
    if(!Array.isArray(arr) || arr.length === 0) throw new Error("Input must be a non-empty JSON array of objects.");
    const headers = [...new Set(arr.flatMap(o => Object.keys(o)))];
    const escape = v => {
      if(v === null || v === undefined) return "";
      const s = typeof v === "object" ? JSON.stringify(v) : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    };
    const lines = [headers.join(",")];
    arr.forEach(o => lines.push(headers.map(h => escape(o[h])).join(",")));
    return lines.join("\n");
  }

  function parseCsvLine(line){
    const out = []; let cur = ""; let inQuotes = false;
    for(let i=0;i<line.length;i++){
      const ch = line[i];
      if(inQuotes){
        if(ch === '"' && line[i+1] === '"'){ cur += '"'; i++; }
        else if(ch === '"'){ inQuotes = false; }
        else cur += ch;
      } else {
        if(ch === '"') inQuotes = true;
        else if(ch === ','){ out.push(cur); cur = ""; }
        else cur += ch;
      }
    }
    out.push(cur);
    return out;
  }

  function csvToJson(text){
    const rows = text.replace(/\r\n/g,"\n").split("\n").filter(r => r.trim() !== "");
    if(rows.length < 1) throw new Error("CSV appears to be empty.");
    const headers = parseCsvLine(rows[0]);
    return rows.slice(1).map(row => {
      const cells = parseCsvLine(row);
      const obj = {};
      headers.forEach((h,i) => obj[h] = cells[i] !== undefined ? cells[i] : "");
      return obj;
    });
  }

  container.querySelector("#jc-run").addEventListener("click", () => {
    const text = input.value.trim();
    if(!text){ KE.Utils.toast("Enter some input first.", "error"); return; }
    try{
      if(mode === "json-to-csv"){
        const parsed = JSON.parse(text);
        output.textContent = jsonToCsv(parsed);
      } else {
        output.textContent = JSON.stringify(csvToJson(text), null, 2);
      }
      output.className = "code-output";
    }catch(e){
      output.className = "code-output error-text";
      output.textContent = "Conversion failed: " + e.message;
    }
  });

  container.querySelector("#jc-copy").addEventListener("click", () => {
    const t = output.textContent;
    if(!t || t === "Result will appear here."){ KE.Utils.toast("Nothing to copy yet.", "error"); return; }
    KE.Utils.copyToClipboard(t).then(() => KE.Utils.toast("Copied to clipboard.", "success"));
  });
  container.querySelector("#jc-download").addEventListener("click", () => {
    const t = output.textContent;
    if(!t || t === "Result will appear here."){ KE.Utils.toast("Nothing to download yet.", "error"); return; }
    KE.Utils.downloadText(mode === "json-to-csv" ? "data.csv" : "data.json", t);
  });
  container.querySelector("#jc-clear").addEventListener("click", () => { input.value=""; output.textContent="Result will appear here."; output.className="code-output"; });
});
