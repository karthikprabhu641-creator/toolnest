/* ============================================
   KE Tools — Regex Tester
   ============================================ */
KE.registerTool("regex", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="form-row">
      <div class="form-group" style="flex:2;">
        <label>Regular expression</label>
        <input type="text" id="rx-pattern" placeholder="e.g. \\b[A-Z][a-z]+\\b" />
      </div>
      <div class="form-group" style="max-width:160px;">
        <label>Flags</label>
        <input type="text" id="rx-flags" placeholder="g, i, m..." value="g" />
      </div>
    </div>
    <div class="form-group">
      <label>Test string</label>
      <textarea id="rx-test" placeholder="Enter or paste the text to test..." style="min-height:150px;"></textarea>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="rx-run">Test</button><button class="btn btn-ghost" id="rx-clear">Clear</button></div>
    <div id="rx-result"></div>
  `;
  const pattern = container.querySelector("#rx-pattern");
  const flags = container.querySelector("#rx-flags");
  const test = container.querySelector("#rx-test");
  const resultBox = container.querySelector("#rx-result");

  container.querySelector("#rx-clear").addEventListener("click", () => {
    pattern.value=""; flags.value="g"; test.value=""; resultBox.innerHTML="";
  });

  container.querySelector("#rx-run").addEventListener("click", () => {
    if(!pattern.value){ KE.Utils.toast("Enter a regular expression.", "error"); return; }
    let re;
    try{
      re = new RegExp(pattern.value, flags.value);
    }catch(e){
      resultBox.innerHTML = `<div class="code-output error-text">Invalid regular expression: ${KE.Utils.escapeHtml(e.message)}</div>`;
      return;
    }
    const str = test.value;
    let matches = [];
    if(re.global){
      let m;
      while((m = re.exec(str)) !== null){
        matches.push(m);
        if(m.index === re.lastIndex) re.lastIndex++;
        if(matches.length > 500) break;
      }
    } else {
      const m = re.exec(str);
      if(m) matches.push(m);
    }

    if(matches.length === 0){
      resultBox.innerHTML = `<div class="result-panel">No matches found.</div>`;
      return;
    }

    let highlighted = "";
    let lastIndex = 0;
    matches.forEach(m => {
      highlighted += KE.Utils.escapeHtml(str.slice(lastIndex, m.index));
      highlighted += `<mark style="background:var(--blue-soft);color:var(--cyan);border-radius:3px;">${KE.Utils.escapeHtml(m[0])}</mark>`;
      lastIndex = m.index + m[0].length;
    });
    highlighted += KE.Utils.escapeHtml(str.slice(lastIndex));

    const matchList = matches.map((m, i) => {
      const groups = m.length > 1 ? m.slice(1).map((g,gi) => `Group ${gi+1}: ${g === undefined ? "(no match)" : KE.Utils.escapeHtml(g)}`).join(", ") : "No capture groups";
      return `<div class="result-row"><span class="rlabel">Match ${i+1} @ index ${m.index}</span><span class="rval">"${KE.Utils.escapeHtml(m[0])}"</span></div>
              <div class="helper-text" style="margin:-4px 0 6px;">${groups}</div>`;
    }).join("");

    resultBox.innerHTML = `
      <div class="result-panel">
        <div class="result-row"><span class="rlabel">Match count</span><span class="rval">${matches.length}</span></div>
      </div>
      <div class="form-group" style="margin-top:16px;"><label>Highlighted text</label><div class="code-output">${highlighted || "(empty)"}</div></div>
      <div class="form-group" style="margin-top:14px;"><label>Matches &amp; groups</label><div class="result-panel">${matchList}</div></div>
    `;
  });
});
