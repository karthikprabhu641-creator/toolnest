/* ============================================
   KE Tools — JWT Decoder
   ============================================ */
KE.registerTool("jwt", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="helper-text" style="margin-bottom:14px;">⚠️ Decoding a JWT does not verify its signature.</div>
    <div class="form-group">
      <label>JWT</label>
      <textarea id="jwt-input" placeholder="Paste a JWT (header.payload.signature)..." style="min-height:110px;"></textarea>
    </div>
    <div class="btn-row"><button class="btn btn-accent" id="jwt-decode">Decode</button><button class="btn btn-ghost" id="jwt-clear">Clear</button></div>
    <div id="jwt-result"></div>
  `;
  const input = container.querySelector("#jwt-input");
  const resultBox = container.querySelector("#jwt-result");

  function base64UrlDecode(str){
    str = str.replace(/-/g,"+").replace(/_/g,"/");
    while(str.length % 4) str += "=";
    return decodeURIComponent(escape(atob(str)));
  }

  container.querySelector("#jwt-clear").addEventListener("click", () => { input.value=""; resultBox.innerHTML=""; });

  container.querySelector("#jwt-decode").addEventListener("click", () => {
    const token = input.value.trim();
    if(!token){ KE.Utils.toast("Paste a JWT first.", "error"); return; }
    const parts = token.split(".");
    if(parts.length !== 3){
      resultBox.innerHTML = `<div class="code-output error-text">This doesn't look like a valid JWT (expected 3 parts separated by dots).</div>`;
      return;
    }
    let header, payload;
    try{ header = JSON.parse(base64UrlDecode(parts[0])); }
    catch(e){ resultBox.innerHTML = `<div class="code-output error-text">Could not decode the header. It may be malformed.</div>`; return; }
    try{ payload = JSON.parse(base64UrlDecode(parts[1])); }
    catch(e){ resultBox.innerHTML = `<div class="code-output error-text">Could not decode the payload. It may be malformed.</div>`; return; }

    const fmtDate = (ts) => ts ? new Date(ts * 1000).toLocaleString() : "—";

    resultBox.innerHTML = `
      <div class="result-panel">
        <div class="result-row"><span class="rlabel">Issued At (iat)</span><span class="rval">${fmtDate(payload.iat)}</span></div>
        <div class="result-row"><span class="rlabel">Expiration (exp)</span><span class="rval">${fmtDate(payload.exp)}</span></div>
      </div>
      <div class="form-group" style="margin-top:16px;"><label>Header</label><div class="code-output">${KE.Utils.escapeHtml(JSON.stringify(header, null, 2))}</div></div>
      <div class="form-group" style="margin-top:14px;"><label>Payload</label><div class="code-output">${KE.Utils.escapeHtml(JSON.stringify(payload, null, 2))}</div></div>
    `;
  });
});
