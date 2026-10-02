/* ============================================
   KE Tools — Date Calculator
   ============================================ */
KE.registerTool("date", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="tab-strip">
      <div class="tab-btn active" data-mode="diff">Date difference</div>
      <div class="tab-btn" data-mode="addsub">Add / Subtract days</div>
    </div>
    <div id="date-diff-panel">
      <div class="form-row">
        <div class="form-group"><label>Start date</label><input type="date" id="dd-start" /></div>
        <div class="form-group"><label>End date</label><input type="date" id="dd-end" /></div>
      </div>
      <div class="btn-row"><button class="btn btn-accent" id="dd-calc">Calculate difference</button></div>
      <div id="dd-result"></div>
    </div>
    <div id="date-addsub-panel" class="hidden">
      <div class="form-row">
        <div class="form-group"><label>Start date</label><input type="date" id="as-start" value="${new Date().toISOString().slice(0,10)}" /></div>
        <div class="form-group"><label>Days</label><input type="number" id="as-days" value="30" /></div>
        <div class="form-group"><label>Operation</label>
          <select id="as-op"><option value="add">Add</option><option value="subtract">Subtract</option></select>
        </div>
      </div>
      <div class="btn-row"><button class="btn btn-accent" id="as-calc">Calculate</button></div>
      <div id="as-result"></div>
    </div>
  `;
  container.querySelectorAll(".tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      container.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const mode = tab.dataset.mode;
      container.querySelector("#date-diff-panel").classList.toggle("hidden", mode !== "diff");
      container.querySelector("#date-addsub-panel").classList.toggle("hidden", mode !== "addsub");
    });
  });

  container.querySelector("#dd-calc").addEventListener("click", () => {
    const s = container.querySelector("#dd-start").value, e = container.querySelector("#dd-end").value;
    if(!s || !e){ KE.Utils.toast("Choose both dates.", "error"); return; }
    const start = new Date(s), end = new Date(e);
    const diffMs = Math.abs(end - start);
    const totalDays = Math.round(diffMs / 86400000);
    const years = Math.floor(totalDays/365.25);
    const months = Math.floor((totalDays % 365.25)/30.44);
    const days = Math.floor((totalDays % 365.25) % 30.44);
    container.querySelector("#dd-result").innerHTML = `
      <div class="result-panel">
        <div class="result-big"><div class="num">${totalDays.toLocaleString()}</div><div class="lbl">Total days</div></div>
        <div class="result-row"><span class="rlabel">Approx. Years / Months / Days</span><span class="rval">${years}y ${months}m ${days}d</span></div>
        <div class="result-row"><span class="rlabel">Total weeks</span><span class="rval">${Math.floor(totalDays/7).toLocaleString()}</span></div>
      </div>`;
  });

  container.querySelector("#as-calc").addEventListener("click", () => {
    const s = container.querySelector("#as-start").value;
    const d = Number(container.querySelector("#as-days").value);
    const op = container.querySelector("#as-op").value;
    if(!s || !KE.Utils.isValidNumber(d)){ KE.Utils.toast("Fill in a valid start date and number of days.", "error"); return; }
    const start = new Date(s);
    start.setDate(start.getDate() + (op === "add" ? d : -d));
    container.querySelector("#as-result").innerHTML = `
      <div class="result-panel">
        <div class="result-row"><span class="rlabel">Resulting date</span><span class="rval">${start.toDateString()}</span></div>
      </div>`;
  });
});
