/* ============================================
   KE Tools — Timestamp Converter
   ============================================ */
KE.registerTool("timestamp", function(container){
  const now = Math.floor(Date.now()/1000);
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="card" style="background:var(--bg-2);padding:16px;margin-bottom:20px;">
      <div class="result-row"><span class="rlabel">Current Unix timestamp</span><span class="rval" id="ts-now">${now}</span></div>
    </div>
    <div class="section-title">Unix timestamp → Date</div>
    <div class="form-row">
      <div class="form-group"><label>Unix timestamp (seconds)</label><input type="number" id="ts-input" placeholder="e.g. 1735689600" /></div>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="ts-to-date">Convert</button></div>
    <div class="result-panel" id="ts-date-result" style="margin-top:14px;">—</div>

    <div class="section-title">Date → Unix timestamp</div>
    <div class="form-row">
      <div class="form-group"><label>Date</label><input type="date" id="date-input" /></div>
      <div class="form-group"><label>Time</label><input type="time" id="time-input" step="1" value="00:00:00" /></div>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="date-to-ts">Convert</button></div>
    <div class="result-panel" id="date-ts-result" style="margin-top:14px;">—</div>
  `;

  container.querySelector("#ts-to-date").addEventListener("click", () => {
    const v = container.querySelector("#ts-input").value;
    if(!KE.Utils.isValidNumber(v)){ KE.Utils.toast("Enter a valid Unix timestamp.", "error"); return; }
    const ms = Number(v) * (String(Math.trunc(Number(v))).length > 10 ? 1 : 1000);
    const d = new Date(ms);
    if(isNaN(d.getTime())){ KE.Utils.toast("That timestamp is out of range.", "error"); return; }
    container.querySelector("#ts-date-result").innerHTML = `
      <div class="result-row"><span class="rlabel">Local time</span><span class="rval">${d.toLocaleString()}</span></div>
      <div class="result-row"><span class="rlabel">UTC / ISO 8601</span><span class="rval">${d.toISOString()}</span></div>`;
  });

  container.querySelector("#date-to-ts").addEventListener("click", () => {
    const dateV = container.querySelector("#date-input").value;
    const timeV = container.querySelector("#time-input").value || "00:00:00";
    if(!dateV){ KE.Utils.toast("Choose a date.", "error"); return; }
    const d = new Date(`${dateV}T${timeV}`);
    if(isNaN(d.getTime())){ KE.Utils.toast("Invalid date/time.", "error"); return; }
    const unix = Math.floor(d.getTime()/1000);
    container.querySelector("#date-ts-result").innerHTML = `
      <div class="result-row"><span class="rlabel">Unix timestamp (seconds)</span><span class="rval">${unix}</span></div>
      <div class="result-row"><span class="rlabel">Unix timestamp (ms)</span><span class="rval">${d.getTime()}</span></div>`;
  });
});
