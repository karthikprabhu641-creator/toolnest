/* ============================================
   KE Tools — Marks Calculator
   ============================================ */
KE.registerTool("marks", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="form-row">
      <div class="form-group"><label>Subject</label><input type="text" id="mk-subject" placeholder="e.g. Mathematics" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Internal marks obtained</label><input type="number" id="mk-int" step="any" placeholder="e.g. 18" /></div>
      <div class="form-group"><label>Internal max marks</label><input type="number" id="mk-int-max" step="any" placeholder="e.g. 20" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>External marks obtained</label><input type="number" id="mk-ext" step="any" placeholder="e.g. 62" /></div>
      <div class="form-group"><label>External max marks</label><input type="number" id="mk-ext-max" step="any" placeholder="e.g. 80" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Passing percentage</label><input type="number" id="mk-pass" step="1" min="0" max="100" value="40" /></div>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="mk-calc">Calculate</button><button class="btn btn-ghost" id="mk-reset">Reset</button></div>
    <div id="mk-result"></div>
  `;
  const ids = ["mk-subject","mk-int","mk-int-max","mk-ext","mk-ext-max","mk-pass"];
  const el = id => container.querySelector("#"+id);
  const resultBox = container.querySelector("#mk-result");

  container.querySelector("#mk-reset").addEventListener("click", () => {
    ids.forEach(id => { if(id!=="mk-pass") el(id).value=""; });
    el("mk-pass").value = "40";
    resultBox.innerHTML = "";
  });

  container.querySelector("#mk-calc").addEventListener("click", () => {
    const intM = el("mk-int").value, intMax = el("mk-int-max").value;
    const extM = el("mk-ext").value, extMax = el("mk-ext-max").value;
    const passPct = el("mk-pass").value;
    for(const [v,label] of [[intM,"internal marks"],[intMax,"internal max marks"],[extM,"external marks"],[extMax,"external max marks"],[passPct,"passing percentage"]]){
      if(!KE.Utils.isValidNumber(v)){ KE.Utils.toast(`Enter valid ${label}.`, "error"); return; }
    }
    const iM = Number(intM), iMax = Number(intMax), eM = Number(extM), eMax = Number(extMax), pp = Number(passPct);
    if(iM > iMax || eM > eMax){ KE.Utils.toast("Obtained marks can't exceed max marks.", "error"); return; }
    const total = iM + eM, totalMax = iMax + eMax;
    const pct = (total / totalMax) * 100;
    const passed = pct >= pp;
    const required = Math.max(0, Math.ceil((pp/100) * totalMax) - total);

    resultBox.innerHTML = `
      <div class="result-panel">
        <div class="result-big"><div class="num">${total} / ${totalMax}</div><div class="lbl">${el("mk-subject").value || "Total"} — ${pct.toFixed(2)}%</div></div>
        <div class="result-row"><span class="rlabel">Result</span><span class="rval" style="color:${passed?'var(--success)':'var(--danger)'}">${passed ? "Pass" : "Fail"}</span></div>
        ${!passed ? `<div class="result-row"><span class="rlabel">Marks needed to pass</span><span class="rval">${required}</span></div>` : ``}
      </div>`;
  });
});
