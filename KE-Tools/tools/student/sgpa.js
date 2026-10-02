/* ============================================
   KE Tools — SGPA Calculator
   ============================================ */
KE.registerTool("sgpa", function(container){
  const GRADES = { "O":10, "A+":9, "A":8, "B+":7, "B":6, "C":5, "P":4, "F":0, "Custom":null };
  let rows = [ mkRow(), mkRow() ];

  function mkRow(){
    return { id: KE.Utils.uid(), name:"", credits:"", grade:"O", custom:"" };
  }

  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="table-wrap">
      <table class="data-table" id="sgpa-table">
        <thead><tr><th>Subject</th><th style="width:110px;">Credits</th><th style="width:140px;">Grade</th><th style="width:110px;">Custom pts</th><th></th></tr></thead>
        <tbody id="sgpa-body"></tbody>
      </table>
    </div>
    <div class="btn-row">
      <button class="btn" id="sgpa-add">+ Add subject</button>
      <button class="btn btn-accent" id="sgpa-calc">Calculate SGPA</button>
      <button class="btn btn-ghost" id="sgpa-reset">Reset</button>
    </div>
    <div id="sgpa-result"></div>
  `;

  const body = container.querySelector("#sgpa-body");
  const resultBox = container.querySelector("#sgpa-result");

  function renderRows(){
    body.innerHTML = rows.map((r,i) => `
      <tr data-id="${r.id}">
        <td><input type="text" class="r-name" placeholder="Subject ${i+1}" value="${KE.Utils.escapeHtml(r.name)}" /></td>
        <td><input type="number" class="r-credits" min="0" step="1" placeholder="e.g. 4" value="${r.credits}" /></td>
        <td>
          <select class="r-grade">
            ${Object.keys(GRADES).map(g => `<option value="${g}" ${r.grade===g?"selected":""}>${g}${GRADES[g]!==null? " ("+GRADES[g]+")":""}</option>`).join("")}
          </select>
        </td>
        <td><input type="number" class="r-custom" min="0" max="10" step="0.1" placeholder="0-10" value="${r.custom}" ${r.grade!=="Custom"?"disabled":""} /></td>
        <td class="actions"><button class="row-remove" title="Remove">✕</button></td>
      </tr>
    `).join("");

    body.querySelectorAll("tr").forEach(tr => {
      const id = tr.dataset.id;
      const row = rows.find(r => r.id === id);
      tr.querySelector(".r-name").addEventListener("input", e => row.name = e.target.value);
      tr.querySelector(".r-credits").addEventListener("input", e => row.credits = e.target.value);
      tr.querySelector(".r-custom").addEventListener("input", e => row.custom = e.target.value);
      tr.querySelector(".r-grade").addEventListener("change", e => {
        row.grade = e.target.value;
        tr.querySelector(".r-custom").disabled = row.grade !== "Custom";
      });
      tr.querySelector(".row-remove").addEventListener("click", () => {
        if(rows.length <= 1){ KE.Utils.toast("You need at least one subject.", "error"); return; }
        rows = rows.filter(r => r.id !== id);
        renderRows();
      });
    });
  }

  container.querySelector("#sgpa-add").addEventListener("click", () => { rows.push(mkRow()); renderRows(); });
  container.querySelector("#sgpa-reset").addEventListener("click", () => { rows = [mkRow(), mkRow()]; resultBox.innerHTML=""; renderRows(); });

  container.querySelector("#sgpa-calc").addEventListener("click", () => {
    let totalCredits = 0, totalPoints = 0;
    const details = [];
    for(const r of rows){
      if(!r.name.trim() && r.credits === "") continue;
      if(!KE.Utils.isValidNumber(r.credits) || Number(r.credits) <= 0){
        KE.Utils.toast(`Enter valid credits for "${r.name || 'a subject'}".`, "error");
        return;
      }
      let gp = r.grade === "Custom" ? Number(r.custom) : GRADES[r.grade];
      if(r.grade === "Custom" && (!KE.Utils.isValidNumber(r.custom) || gp < 0 || gp > 10)){
        KE.Utils.toast(`Enter a valid custom grade point (0-10) for "${r.name || 'a subject'}".`, "error");
        return;
      }
      const credits = Number(r.credits);
      totalCredits += credits;
      totalPoints += credits * gp;
      details.push({ name: r.name || "Subject", credits, grade: r.grade, gp });
    }
    if(details.length === 0){
      KE.Utils.toast("Add at least one subject with credits.", "error");
      return;
    }
    const sgpa = totalPoints / totalCredits;

    resultBox.innerHTML = `
      <div class="result-panel">
        <div class="result-big"><div class="num">${sgpa.toFixed(2)}</div><div class="lbl">Your SGPA</div></div>
        <div class="result-row"><span class="rlabel">Total Credits</span><span class="rval">${totalCredits}</span></div>
        <div class="result-row"><span class="rlabel">Total Grade Points</span><span class="rval">${totalPoints.toFixed(2)}</span></div>
      </div>
      <div class="btn-row">
        <button class="btn btn-sm" id="sgpa-copy">Copy result</button>
        <button class="btn btn-sm" id="sgpa-download">Download result</button>
      </div>
    `;

    const textReport = `KE Tools — SGPA Report\n${"=".repeat(28)}\n` +
      details.map(d => `${d.name}: ${d.credits} cr, grade ${d.grade} (${d.gp} pts)`).join("\n") +
      `\n\nTotal Credits: ${totalCredits}\nTotal Grade Points: ${totalPoints.toFixed(2)}\nSGPA: ${sgpa.toFixed(2)}`;

    resultBox.querySelector("#sgpa-copy").addEventListener("click", () => {
      KE.Utils.copyToClipboard(textReport).then(() => KE.Utils.toast("Result copied.", "success"));
    });
    resultBox.querySelector("#sgpa-download").addEventListener("click", () => {
      KE.Utils.downloadText("sgpa-result.txt", textReport);
    });
  });

  renderRows();
});
