/* ============================================
   KE Tools — Time Difference
   ============================================ */
KE.registerTool("time-difference", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="form-row">
      <div class="form-group"><label>Start time</label><input type="time" id="tf-start" step="1" /></div>
      <div class="form-group"><label>End time</label><input type="time" id="tf-end" step="1" /></div>
      <div class="form-group" style="display:flex; align-items:flex-end;">
        <label style="display:flex; align-items:center; gap:8px; margin:0;"><input type="checkbox" id="tf-overnight" /> End time is next day</label>
      </div>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="tf-calc">Calculate difference</button></div>
    <div id="tf-result"></div>
  `;

  container.querySelector("#tf-calc").addEventListener("click", () => {
    const s = container.querySelector("#tf-start").value, e = container.querySelector("#tf-end").value;
    const overnight = container.querySelector("#tf-overnight").checked;
    if(!s || !e){ KE.Utils.toast("Enter both start and end times.", "error"); return; }
    const [sh,sm,ss=0] = s.split(":").map(Number);
    const [eh,em,es=0] = e.split(":").map(Number);
    let startSec = sh*3600+sm*60+ss;
    let endSec = eh*3600+em*60+es + (overnight ? 86400 : 0);
    let diff = endSec - startSec;
    if(diff < 0){ KE.Utils.toast('End time is before start time — check "next day" if it spans midnight.', "error"); return; }
    const h = Math.floor(diff/3600), m = Math.floor((diff%3600)/60), sec = diff%60;
    container.querySelector("#tf-result").innerHTML = `
      <div class="result-panel">
        <div class="result-big"><div class="num">${h}h ${m}m</div><div class="lbl">Time difference</div></div>
        <div class="result-row"><span class="rlabel">Exact</span><span class="rval">${h} hours, ${m} minutes, ${sec} seconds</span></div>
        <div class="result-row"><span class="rlabel">Total minutes</span><span class="rval">${Math.floor(diff/60)}</span></div>
      </div>`;
  });
});
