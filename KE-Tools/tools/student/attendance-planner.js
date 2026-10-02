/* ============================================
   KE Tools — Attendance Planner
   ============================================ */
KE.registerTool("attendance-planner", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="form-row">
      <div class="form-group"><label>Total classes held so far</label><input type="number" id="ap-total" min="0" step="1" placeholder="e.g. 100" /></div>
      <div class="form-group"><label>Classes attended</label><input type="number" id="ap-attended" min="0" step="1" placeholder="e.g. 68" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Target attendance %</label><input type="number" id="ap-target" min="1" max="100" step="1" value="75" /></div>
      <div class="form-group"><label>Remaining classes this term (optional)</label><input type="number" id="ap-remaining" min="0" step="1" placeholder="e.g. 40" /></div>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="ap-calc">Plan attendance</button><button class="btn btn-ghost" id="ap-reset">Reset</button></div>
    <div id="ap-result"></div>
  `;
  const el = id => container.querySelector("#"+id);
  const resultBox = container.querySelector("#ap-result");

  container.querySelector("#ap-reset").addEventListener("click", () => {
    ["ap-total","ap-attended","ap-remaining"].forEach(id => el(id).value = "");
    el("ap-target").value = "75";
    resultBox.innerHTML = "";
  });

  container.querySelector("#ap-calc").addEventListener("click", () => {
    const t = el("ap-total").value, a = el("ap-attended").value, tg = el("ap-target").value, rem = el("ap-remaining").value;
    if(!KE.Utils.isValidNumber(t) || !KE.Utils.isValidNumber(a) || Number(t) <= 0){ KE.Utils.toast("Enter valid total and attended classes.", "error"); return; }
    if(Number(a) > Number(t)){ KE.Utils.toast("Classes attended can't exceed total classes.", "error"); return; }
    if(!KE.Utils.isValidNumber(tg) || Number(tg) <= 0 || Number(tg) > 100){ KE.Utils.toast("Enter a valid target percentage.", "error"); return; }
    const T = Number(t), A = Number(a), TG = Number(tg);
    const currentPct = (A / T) * 100;

    let html = `<div class="result-panel">
      <div class="result-row"><span class="rlabel">Current Attendance</span><span class="rval">${currentPct.toFixed(2)}%</span></div>`;

    if(currentPct < TG){
      const need = Math.max(0, Math.ceil((TG * T - 100 * A) / (100 - TG)));
      html += `<div class="result-row"><span class="rlabel">Classes needed to reach ${TG}%</span><span class="rval">${need}</span></div>`;
      if(KE.Utils.isValidNumber(rem)){
        const R = Number(rem);
        if(need > R){
          html += `<div class="result-row"><span class="rlabel">Status</span><span class="rval" style="color:var(--danger)">Not reachable even attending all ${R} remaining classes</span></div>`;
        } else {
          html += `<div class="result-row"><span class="rlabel">Status</span><span class="rval" style="color:var(--success)">Reachable — attend ${need} of the ${R} remaining classes</span></div>`;
        }
      }
    } else {
      const canMiss = Math.max(0, Math.floor((100 * A) / TG - T));
      html += `<div class="result-row"><span class="rlabel">Classes you can miss and stay ≥ ${TG}%</span><span class="rval">${canMiss}</span></div>`;
      if(KE.Utils.isValidNumber(rem)){
        const R = Number(rem);
        const safeMiss = Math.min(canMiss, R);
        html += `<div class="result-row"><span class="rlabel">Of ${R} remaining classes, safe to miss</span><span class="rval">${safeMiss}</span></div>`;
      }
    }
    html += `</div>`;
    resultBox.innerHTML = html;
  });
});
