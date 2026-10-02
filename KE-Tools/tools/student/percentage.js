/* ============================================
   KE Tools — Percentage Calculator
   ============================================ */
KE.registerTool("percentage", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="form-row">
      <div class="form-group"><label>Obtained marks</label><input type="number" id="pc-obtained" step="any" placeholder="e.g. 425" /></div>
      <div class="form-group"><label>Total marks</label><input type="number" id="pc-total" step="any" placeholder="e.g. 500" /></div>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="pc-calc">Calculate</button><button class="btn btn-ghost" id="pc-reset">Reset</button></div>
    <div id="pc-result"></div>
  `;
  const obtained = container.querySelector("#pc-obtained");
  const total = container.querySelector("#pc-total");
  const resultBox = container.querySelector("#pc-result");

  container.querySelector("#pc-reset").addEventListener("click", () => { obtained.value=""; total.value=""; resultBox.innerHTML=""; });

  container.querySelector("#pc-calc").addEventListener("click", () => {
    if(!KE.Utils.isValidNumber(obtained.value) || !KE.Utils.isValidNumber(total.value) || Number(total.value) <= 0){
      KE.Utils.toast("Enter valid obtained and total marks.", "error"); return;
    }
    const o = Number(obtained.value), t = Number(total.value);
    if(o > t){ KE.Utils.toast("Obtained marks can't exceed total marks.", "error"); return; }
    const pct = (o / t) * 100;
    resultBox.innerHTML = `
      <div class="result-panel">
        <div class="result-big"><div class="num">${pct.toFixed(2)}%</div><div class="lbl">Percentage</div></div>
        <div class="result-row"><span class="rlabel">Obtained / Total</span><span class="rval">${o} / ${t}</span></div>
      </div>`;
  });
});
