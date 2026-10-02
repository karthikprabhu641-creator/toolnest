/* ============================================
   KE Tools — Age Calculator
   ============================================ */
KE.registerTool("age", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="form-row">
      <div class="form-group"><label>Date of birth</label><input type="date" id="age-dob" max="${new Date().toISOString().slice(0,10)}" /></div>
      <div class="form-group"><label>As of date</label><input type="date" id="age-asof" value="${new Date().toISOString().slice(0,10)}" /></div>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="age-calc">Calculate age</button></div>
    <div id="age-result"></div>
  `;
  const dob = container.querySelector("#age-dob");
  const asOf = container.querySelector("#age-asof");
  const resultBox = container.querySelector("#age-result");

  container.querySelector("#age-calc").addEventListener("click", () => {
    if(!dob.value){ KE.Utils.toast("Choose a date of birth.", "error"); return; }
    const birth = new Date(dob.value);
    const ref = new Date(asOf.value || new Date());
    if(birth > ref){ KE.Utils.toast("Date of birth can't be after the reference date.", "error"); return; }

    let years = ref.getFullYear() - birth.getFullYear();
    let months = ref.getMonth() - birth.getMonth();
    let days = ref.getDate() - birth.getDate();
    if(days < 0){
      months--;
      const prevMonth = new Date(ref.getFullYear(), ref.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if(months < 0){ months += 12; years--; }
    const totalDays = Math.floor((ref - birth) / 86400000);

    resultBox.innerHTML = `
      <div class="result-panel">
        <div class="result-big"><div class="num">${years}</div><div class="lbl">Years</div></div>
        <div class="result-row"><span class="rlabel">Years / Months / Days</span><span class="rval">${years}y ${months}m ${days}d</span></div>
        <div class="result-row"><span class="rlabel">Total days lived</span><span class="rval">${totalDays.toLocaleString()}</span></div>
        <div class="result-row"><span class="rlabel">Total weeks lived</span><span class="rval">${Math.floor(totalDays/7).toLocaleString()}</span></div>
      </div>`;
  });
});
