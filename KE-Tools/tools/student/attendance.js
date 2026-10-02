/* ============================================
   KE Tools — Attendance Calculator
   ============================================ */
KE.registerTool("attendance", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="form-row">
      <div class="form-group"><label>Total classes held</label><input type="number" id="att-total" min="0" step="1" placeholder="e.g. 60" /></div>
      <div class="form-group"><label>Classes attended</label><input type="number" id="att-attended" min="0" step="1" placeholder="e.g. 45" /></div>
      <div class="form-group"><label>Target attendance %</label><input type="number" id="att-target" min="1" max="100" step="1" value="75" /></div>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="att-calc">Calculate</button><button class="btn btn-ghost" id="att-reset">Reset</button></div>
    <div id="att-result"></div>
  `;
  const total = container.querySelector("#att-total");
  const attended = container.querySelector("#att-attended");
  const target = container.querySelector("#att-target");
  const resultBox = container.querySelector("#att-result");

  container.querySelector("#att-reset").addEventListener("click", () => {
    total.value = ""; attended.value = ""; target.value = "75"; resultBox.innerHTML = "";
  });

  container.querySelector("#att-calc").addEventListener("click", () => {
    const t = Number(total.value), a = Number(attended.value), tg = Number(target.value);
    if(!KE.Utils.isValidNumber(total.value) || !KE.Utils.isValidNumber(attended.value) || t <= 0){
      KE.Utils.toast("Enter valid total and attended classes.", "error"); return;
    }
    if(a > t){ KE.Utils.toast("Classes attended can't exceed total classes.", "error"); return; }
    if(!KE.Utils.isValidNumber(target.value) || tg <= 0 || tg > 100){
      KE.Utils.toast("Enter a valid target percentage (1-100).", "error"); return;
    }
    const pct = (a / t) * 100;

    let extraNeeded = 0;
    let canMiss = 0;
    if(pct < tg){
      // (a + x) / (t + x) = tg/100  =>  x = (tg*t - 100*a) / (100 - tg)
      extraNeeded = Math.ceil((tg * t - 100 * a) / (100 - tg));
      if(extraNeeded < 0) extraNeeded = 0;
    } else {
      // (a) / (t + x) = tg/100 => x = 100a/tg - t
      canMiss = Math.floor((100 * a) / tg - t);
      if(canMiss < 0) canMiss = 0;
    }

    resultBox.innerHTML = `
      <div class="result-panel">
        <div class="result-big"><div class="num">${pct.toFixed(2)}%</div><div class="lbl">Current Attendance</div></div>
        <div class="result-row"><span class="rlabel">Status</span><span class="rval" style="color:${pct>=tg?'var(--success)':'var(--danger)'}">${pct>=tg? `Above ${tg}% target` : `Below ${tg}% target`}</span></div>
        ${pct < tg
          ? `<div class="result-row"><span class="rlabel">Classes needed (consecutively) to reach ${tg}%</span><span class="rval">${extraNeeded}</span></div>`
          : `<div class="result-row"><span class="rlabel">Classes you can still miss and stay at/above ${tg}%</span><span class="rval">${canMiss}</span></div>`}
      </div>`;
  });
});
