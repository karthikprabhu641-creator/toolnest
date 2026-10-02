/* ============================================
   KE Tools — CGPA Calculator
   ============================================ */
KE.registerTool("cgpa", function(container){
  let rows = [mkRow(1), mkRow(2)];
  function mkRow(n){ return { id: KE.Utils.uid(), label:`Semester ${n}`, sgpa:"", credits:"" }; }

  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="table-wrap">
      <table class="data-table" id="cgpa-table">
        <thead><tr><th>Semester</th><th style="width:130px;">SGPA</th><th style="width:130px;">Credits</th><th></th></tr></thead>
        <tbody id="cgpa-body"></tbody>
      </table>
    </div>
    <div class="btn-row">
      <button class="btn" id="cgpa-add">+ Add semester</button>
      <button class="btn btn-accent" id="cgpa-calc">Calculate CGPA</button>
      <button class="btn btn-ghost" id="cgpa-reset">Reset</button>
    </div>
    <div id="cgpa-result"></div>
  `;

  const body = container.querySelector("#cgpa-body");
  const resultBox = container.querySelector("#cgpa-result");

  function renderRows(){
    body.innerHTML = rows.map(r => `
      <tr data-id="${r.id}">
        <td><input type="text" class="r-label" value="${KE.Utils.escapeHtml(r.label)}" /></td>
        <td><input type="number" class="r-sgpa" min="0" max="10" step="0.01" placeholder="0-10" value="${r.sgpa}" /></td>
        <td><input type="number" class="r-credits" min="0" step="1" placeholder="e.g. 22" value="${r.credits}" /></td>
        <td class="actions"><button class="row-remove" title="Remove">✕</button></td>
      </tr>
    `).join("");
    body.querySelectorAll("tr").forEach(tr => {
      const row = rows.find(r => r.id === tr.dataset.id);
      tr.querySelector(".r-label").addEventListener("input", e => row.label = e.target.value);
      tr.querySelector(".r-sgpa").addEventListener("input", e => row.sgpa = e.target.value);
      tr.querySelector(".r-credits").addEventListener("input", e => row.credits = e.target.value);
      tr.querySelector(".row-remove").addEventListener("click", () => {
        if(rows.length <= 1){ KE.Utils.toast("You need at least one semester.", "error"); return; }
        rows = rows.filter(r => r.id !== tr.dataset.id);
        renderRows();
      });
    });
  }

  container.querySelector("#cgpa-add").addEventListener("click", () => { rows.push(mkRow(rows.length+1)); renderRows(); });
  container.querySelector("#cgpa-reset").addEventListener("click", () => { rows = [mkRow(1), mkRow(2)]; resultBox.innerHTML=""; renderRows(); });

  container.querySelector("#cgpa-calc").addEventListener("click", () => {
    let totalCredits = 0, totalPoints = 0;
    const details = [];
    for(const r of rows){
      if(r.sgpa === "" && r.credits === "") continue;
      if(!KE.Utils.isValidNumber(r.sgpa) || Number(r.sgpa) < 0 || Number(r.sgpa) > 10){
        KE.Utils.toast(`Enter a valid SGPA (0-10) for "${r.label}".`, "error"); return;
      }
      if(!KE.Utils.isValidNumber(r.credits) || Number(r.credits) <= 0){
        KE.Utils.toast(`Enter valid credits for "${r.label}".`, "error"); return;
      }
      const c = Number(r.credits), s = Number(r.sgpa);
      totalCredits += c; totalPoints += c*s;
      details.push({ label:r.label, sgpa:s, credits:c });
    }
    if(details.length === 0){ KE.Utils.toast("Add at least one semester.", "error"); return; }
    const cgpa = totalPoints / totalCredits;

    resultBox.innerHTML = `
      <div class="result-panel">
        <div class="result-big"><div class="num">${cgpa.toFixed(2)}</div><div class="lbl">Your CGPA</div></div>
        <div class="result-row"><span class="rlabel">Total Credits</span><span class="rval">${totalCredits}</span></div>
        <div class="result-row"><span class="rlabel">Semesters Counted</span><span class="rval">${details.length}</span></div>
      </div>
      <div class="btn-row">
        <button class="btn btn-sm" id="cgpa-copy">Copy result</button>
        <button class="btn btn-sm" id="cgpa-download">Download result</button>
      </div>`;

    const text = `KE Tools — CGPA Report\n${"=".repeat(28)}\n` +
      details.map(d => `${d.label}: SGPA ${d.sgpa}, ${d.credits} credits`).join("\n") +
      `\n\nTotal Credits: ${totalCredits}\nCGPA: ${cgpa.toFixed(2)}`;

    resultBox.querySelector("#cgpa-copy").addEventListener("click", () => KE.Utils.copyToClipboard(text).then(() => KE.Utils.toast("Result copied.", "success")));
    resultBox.querySelector("#cgpa-download").addEventListener("click", () => KE.Utils.downloadText("cgpa-result.txt", text));
  });

  renderRows();
});
