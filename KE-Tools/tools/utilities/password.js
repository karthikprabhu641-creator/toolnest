/* ============================================
   KE Tools — Password Generator
   ============================================ */
KE.registerTool("password", function(container){
  container.innerHTML = `
    <div class="privacy-badge" style="margin-bottom:16px;">🔒 Processed locally in your browser</div>
    <div class="code-output" id="pw-output" style="font-size:18px; text-align:center; letter-spacing:1px;">Click "Generate" to create a password.</div>
    <div class="btn-row">
      <button class="btn btn-accent" id="pw-gen">Generate</button>
      <button class="btn btn-sm" id="pw-copy">Copy</button>
    </div>
    <div class="strength-meter"><div class="fill" id="pw-strength-fill" style="width:0%;"></div></div>
    <div class="helper-text" id="pw-strength-label"></div>

    <div class="form-row" style="margin-top:20px;">
      <div class="form-group"><label>Length: <span id="pw-length-val">16</span></label><input type="range" id="pw-length" min="6" max="64" value="16" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="pw-upper" checked /> Uppercase (A-Z)</label></div>
      <div class="form-group"><label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="pw-lower" checked /> Lowercase (a-z)</label></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="pw-numbers" checked /> Numbers (0-9)</label></div>
      <div class="form-group"><label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="pw-symbols" checked /> Symbols (!@#$...)</label></div>
    </div>
  `;
  const output = container.querySelector("#pw-output");
  const lengthInput = container.querySelector("#pw-length");
  const lengthVal = container.querySelector("#pw-length-val");
  const fill = container.querySelector("#pw-strength-fill");
  const strengthLabel = container.querySelector("#pw-strength-label");

  lengthInput.addEventListener("input", () => lengthVal.textContent = lengthInput.value);

  const SETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{};:,.<>?/"
  };

  function evalStrength(pw, opts){
    let poolSize = 0;
    if(opts.upper) poolSize += 26;
    if(opts.lower) poolSize += 26;
    if(opts.numbers) poolSize += 10;
    if(opts.symbols) poolSize += SETS.symbols.length;
    const entropy = pw.length * Math.log2(poolSize || 1);
    if(entropy < 40) return { pct:25, label:"Weak", color:"var(--danger)" };
    if(entropy < 60) return { pct:55, label:"Fair", color:"var(--warning)" };
    if(entropy < 80) return { pct:80, label:"Strong", color:"var(--cyan)" };
    return { pct:100, label:"Very strong", color:"var(--success)" };
  }

  container.querySelector("#pw-gen").addEventListener("click", () => {
    const opts = {
      upper: container.querySelector("#pw-upper").checked,
      lower: container.querySelector("#pw-lower").checked,
      numbers: container.querySelector("#pw-numbers").checked,
      symbols: container.querySelector("#pw-symbols").checked,
    };
    const len = Number(lengthInput.value);
    let pool = "";
    Object.keys(opts).forEach(k => { if(opts[k]) pool += SETS[k]; });
    if(!pool){ KE.Utils.toast("Select at least one character type.", "error"); return; }

    const randomValues = crypto.getRandomValues(new Uint32Array(len));
    let pw = Array.from(randomValues, v => pool[v % pool.length]).join("");
    output.textContent = pw;

    const s = evalStrength(pw, opts);
    fill.style.width = s.pct + "%";
    fill.style.background = s.color;
    strengthLabel.textContent = "Strength: " + s.label;
  });

  container.querySelector("#pw-copy").addEventListener("click", () => {
    const t = output.textContent;
    if(!t || t.startsWith('Click')){ KE.Utils.toast("Generate a password first.", "error"); return; }
    KE.Utils.copyToClipboard(t).then(() => KE.Utils.toast("Password copied.", "success"));
  });
});
