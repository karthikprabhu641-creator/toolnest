/* ============================================
   KE Tools — Target SGPA Calculator
   ============================================ */
KE.registerTool("target-sgpa", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="form-row">
      <div class="form-group"><label>Current CGPA</label><input type="number" id="ts-current" min="0" max="10" step="0.01" placeholder="e.g. 8.10" /></div>
      <div class="form-group"><label>Credits completed so far</label><input type="number" id="ts-credits-done" min="0" step="1" placeholder="e.g. 88" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Desired CGPA</label><input type="number" id="ts-target" min="0" max="10" step="0.01" placeholder="e.g. 8.50" /></div>
      <div class="form-group"><label>Credits in upcoming semester</label><input type="number" id="ts-credits-next" min="0" step="1" placeholder="e.g. 22" /></div>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="ts-calc">Calculate</button><button class="btn btn-ghost" id="ts-reset">Reset</button></div>
    <div id="ts-result"></div>
  `;
  const el = id => container.querySelector("#"+id);
  const resultBox = container.querySelector("#ts-result");

  container.querySelector("#ts-reset").addEventListener("click", () => {
    ["ts-current","ts-credits-done","ts-target","ts-credits-next"].forEach(id => el(id).value = "");
    resultBox.innerHTML = "";
  });

  container.querySelector("#ts-calc").addEventListener("click", () => {
    const vals = ["ts-current","ts-credits-done","ts-target","ts-credits-next"];
    for(const id of vals){ if(!KE.Utils.isValidNumber(el(id).value)){ KE.Utils.toast("Fill in all fields with valid numbers.", "error"); return; } }
    const cur = Number(el("ts-current").value), doneC = Number(el("ts-credits-done").value);
    const tgt = Number(el("ts-target").value), nextC = Number(el("ts-credits-next").value);
    if(cur < 0 || cur > 10 || tgt < 0 || tgt > 10){ KE.Utils.toast("CGPA values must be between 0 and 10.", "error"); return; }
    if(nextC <= 0){ KE.Utils.toast("Upcoming semester credits must be greater than 0.", "error"); return; }

    // (cur*doneC + req*nextC) / (doneC+nextC) = tgt
    const required = ((tgt * (doneC + nextC)) - (cur * doneC)) / nextC;

    resultBox.innerHTML = `
      <div class="result-panel">
        <div class="result-big"><div class="num">${required.toFixed(2)}</div><div class="lbl">Required SGPA next semester</div></div>
        <div class="result-row"><span class="rlabel">Feasible (0–10 scale)</span><span class="rval" style="color:${required<=10 && required>=0 ? 'var(--success)':'var(--danger)'}">${required > 10 ? "Not achievable in one semester" : required < 0 ? "Already achieved" : "Yes"}</span></div>
      </div>`;
  });
});
