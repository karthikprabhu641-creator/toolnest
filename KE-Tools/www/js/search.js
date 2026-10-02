/* ============================================
   KE Tools — search.js
   Tool registry + global search (Ctrl+K)
   ============================================ */
window.KE = window.KE || {};

KE.Registry = [
  // ---------- Student ----------
  { id:"sgpa", name:"SGPA Calculator", cat:"student", catLabel:"Student", icon:"book", kw:"sgpa grade points semester credits" },
  { id:"cgpa", name:"CGPA Calculator", cat:"student", catLabel:"Student", icon:"book", kw:"cgpa semester weighted average" },
  { id:"attendance", name:"Attendance Calculator", cat:"student", catLabel:"Student", icon:"calendar", kw:"attendance percentage classes" },
  { id:"percentage", name:"Percentage Calculator", cat:"student", catLabel:"Student", icon:"calculator", kw:"percentage marks obtained total" },
  { id:"marks", name:"Marks Calculator", cat:"student", catLabel:"Student", icon:"note", kw:"marks internal external total pass fail" },
  { id:"target-sgpa", name:"Target SGPA Calculator", cat:"student", catLabel:"Student", icon:"target", kw:"target sgpa cgpa required" },
  { id:"attendance-planner", name:"Attendance Planner", cat:"student", catLabel:"Student", icon:"calendar", kw:"attendance planner miss classes required" },

  // ---------- Developer ----------
  { id:"json", name:"JSON Formatter", cat:"developer", catLabel:"Developer", icon:"{ }", kw:"json format minify validate" },
  { id:"base64", name:"Base64 Encoder / Decoder", cat:"developer", catLabel:"Developer", icon:"⎋", kw:"base64 encode decode text" },
  { id:"jwt", name:"JWT Decoder", cat:"developer", catLabel:"Developer", icon:"key", kw:"jwt token decode header payload" },
  { id:"regex", name:"Regex Tester", cat:"developer", catLabel:"Developer", icon:"/.*/", kw:"regex regular expression tester match" },
  { id:"uuid", name:"UUID Generator", cat:"developer", catLabel:"Developer", icon:"id", kw:"uuid guid generator v4" },
  { id:"hash", name:"Hash Generator", cat:"developer", catLabel:"Developer", icon:"#", kw:"hash sha256 sha384 sha512" },
  { id:"url", name:"URL Encoder / Decoder", cat:"developer", catLabel:"Developer", icon:"link", kw:"url encode decode uri" },
  { id:"timestamp", name:"Timestamp Converter", cat:"developer", catLabel:"Developer", icon:"clock", kw:"timestamp unix date time epoch" },
  { id:"html-entities", name:"HTML Entity Encoder / Decoder", cat:"developer", catLabel:"Developer", icon:"&amp;", kw:"html entity encode decode escape" },
  { id:"color", name:"Color Converter", cat:"developer", catLabel:"Developer", icon:"palette", kw:"color hex rgb hsl converter" },
  { id:"json-csv", name:"JSON ↔ CSV", cat:"developer", catLabel:"Developer", icon:"⇄", kw:"json csv convert" },

  // ---------- Image ----------
  { id:"compressor", name:"Image Compressor", cat:"image", catLabel:"Image", icon:"compressor", kw:"image compress quality size" },
  { id:"converter", name:"Image Converter", cat:"image", catLabel:"Image", icon:"rotate", kw:"image convert jpg png webp" },
  { id:"resizer", name:"Image Resizer", cat:"image", catLabel:"Image", icon:"crop", kw:"image resize width height" },
  { id:"cropper", name:"Image Cropper", cat:"image", catLabel:"Image", icon:"scissors", kw:"image crop aspect ratio" },
  { id:"rotate", name:"Image Rotate / Flip", cat:"image", catLabel:"Image", icon:"rotate", kw:"image rotate flip mirror" },
  { id:"base64-image", name:"Image → Base64", cat:"image", catLabel:"Image", icon:"image", kw:"image base64 data url" },

  // ---------- PDF ----------
  { id:"merge", name:"Merge PDF", cat:"pdf", catLabel:"PDF", icon:"paperclip", kw:"pdf merge combine join" },
  { id:"split", name:"Split PDF", cat:"pdf", catLabel:"PDF", icon:"scissors", kw:"pdf split pages range" },
  { id:"extract", name:"Extract Pages", cat:"pdf", catLabel:"PDF", icon:"upload", kw:"pdf extract pages" },
  { id:"delete-pages", name:"Delete Pages", cat:"pdf", catLabel:"PDF", icon:"trash", kw:"pdf delete remove pages" },
  { id:"reorder", name:"Reorder Pages", cat:"pdf", catLabel:"PDF", icon:"shuffle", kw:"pdf reorder pages drag" },
  { id:"rotate-pdf", name:"Rotate Pages", cat:"pdf", catLabel:"PDF", icon:"rotate", kw:"pdf rotate pages" },
  { id:"images-to-pdf", name:"Images → PDF", cat:"pdf", catLabel:"PDF", icon:"printer", kw:"images to pdf convert" },
  { id:"pdf-to-images", name:"PDF → Images", cat:"pdf", catLabel:"PDF", icon:"image", kw:"pdf to images render pages" },

  // ---------- Utilities ----------
  { id:"qr", name:"QR Generator", cat:"utilities", catLabel:"Utilities", icon:"▦", kw:"qr code generator wifi vcard" },
  { id:"barcode", name:"Barcode Generator", cat:"utilities", catLabel:"Utilities", icon:"|||", kw:"barcode generator code128" },
  { id:"password", name:"Password Generator", cat:"utilities", catLabel:"Utilities", icon:"lock", kw:"password generator strength secure" },
  { id:"stopwatch", name:"Stopwatch", cat:"time", catLabel:"Time & Date", icon:"clock", kw:"stopwatch lap timer" },
  { id:"timer", name:"Timer", cat:"time", catLabel:"Time & Date", icon:"timer", kw:"timer countdown" },
  { id:"pomodoro", name:"Pomodoro", cat:"productivity", catLabel:"Productivity", icon:"tomato", kw:"pomodoro focus break work" },
  { id:"units", name:"Unit Converter", cat:"utilities", catLabel:"Utilities", icon:"⇌", kw:"unit converter length weight temperature" },
  { id:"age", name:"Age Calculator", cat:"time", catLabel:"Time & Date", icon:"cake", kw:"age calculator birth date" },
  { id:"date", name:"Date Calculator", cat:"time", catLabel:"Time & Date", icon:"📆", kw:"date calculator difference add subtract" },
  { id:"time-difference", name:"Time Difference", cat:"time", catLabel:"Time & Date", icon:"hourglass", kw:"time difference between" },
  { id:"timezone", name:"Time Zone Converter", cat:"time", catLabel:"Time & Date", icon:"globe", kw:"timezone time zone world cities convert" },
  { id:"digital-clock", name:"Digital Clock", cat:"time", catLabel:"Time & Date", icon:"clock", kw:"digital clock live time" },
  { id:"analog-clock", name:"Analog Clock", cat:"time", catLabel:"Time & Date", icon:"clock", kw:"analog clock live time" },
  { id:"scientific-calculator", name:"Scientific Calculator", cat:"calculators", catLabel:"Calculators", icon:"calculator", kw:"scientific calculator sin cos tan sqrt logarithm" },
  { id:"bmi", name:"BMI Calculator", cat:"calculators", catLabel:"Calculators", icon:"activity", kw:"bmi body mass index weight height" },
  { id:"discount", name:"Discount Calculator", cat:"calculators", catLabel:"Calculators", icon:"percent", kw:"discount sale price percentage" },
  { id:"fuel-price", name:"Fuel Price Calculator", cat:"calculators", catLabel:"Calculators", icon:"fuel", kw:"fuel petrol diesel cost price litre" },
  { id:"mileage", name:"Mileage Calculator", cat:"calculators", catLabel:"Calculators", icon:"car", kw:"mileage km per litre fuel cost" },
  { id:"interest", name:"Interest Calculator", cat:"calculators", catLabel:"Calculators", icon:"percent", kw:"simple compound interest principal rate" },
  { id:"electricity", name:"Electricity Calculator", cat:"calculators", catLabel:"Calculators", icon:"bolt", kw:"electricity bill power watt kwh tariff" },
  { id:"currency", name:"Currency Calculator", cat:"calculators", catLabel:"Calculators", icon:"currency", kw:"currency exchange convert money" },
  { id:"emi", name:"EMI Calculator", cat:"calculators", catLabel:"Calculators", icon:"bank", kw:"emi loan monthly payment interest" },
  { id:"text-binary", name:"Text ↔ Binary", cat:"text", catLabel:"Text & Language", icon:"code", kw:"text binary encoder decoder ascii utf8" },
  { id:"morse", name:"Morse Code", cat:"text", catLabel:"Text & Language", icon:"signal", kw:"morse code encoder decoder dots dashes" },
  { id:"text-encryption", name:"Text Encryption", cat:"text", catLabel:"Text & Language", icon:"lock", kw:"encrypt decrypt aes password secure text" },
  { id:"text-counter", name:"Text & Spelling Counter", cat:"text", catLabel:"Text & Language", icon:"note", kw:"text counter word counter character sentence line" },
  { id:"tts", name:"Text to Speech", cat:"text", catLabel:"Text & Language", icon:"volume", kw:"text to speech tts voice male female child" },
  { id:"quotes", name:"Random Quotes", cat:"productivity", catLabel:"Productivity", icon:"quote", kw:"quotes sad happy crazy love nature motivation wisdom" },
  { id:"typing-test", name:"Typing Test", cat:"productivity", catLabel:"Productivity", icon:"keyboard", kw:"typing speed wpm accuracy test" },
  { id:"invoice", name:"Invoice Generator", cat:"productivity", catLabel:"Productivity", icon:"invoice", kw:"invoice generator bill tax items print" },
  { id:"dice", name:"Dice Roller", cat:"games", catLabel:"Games", icon:"dice", kw:"dice roller random d6 d20" },
  { id:"tic-tac-toe", name:"Tic Tac Toe", cat:"games", catLabel:"Games", icon:"game", kw:"tic tac toe noughts crosses game" },
  { id:"coin-toss", name:"Coin Toss", cat:"games", catLabel:"Games", icon:"coin", kw:"coin flip heads tails random" },
];

KE.CATEGORY_ORDER = [
  { id:"student", label:"Student" },
  { id:"developer", label:"Developer" },
  { id:"image", label:"Image" },
  { id:"pdf", label:"PDF" },
  { id:"calculators", label:"Calculators" },
  { id:"time", label:"Time & Date" },
  { id:"text", label:"Text & Language" },
  { id:"productivity", label:"Productivity" },
  { id:"games", label:"Games" },
  { id:"utilities", label:"Utilities" },
];

KE.getTool = function(id){ return KE.Registry.find(t => t.id === id); };

KE.Search = (function(){
  let modal, input, results, selectedIndex = 0, currentMatches = [];

  function score(tool, q){
    q = q.toLowerCase();
    const name = tool.name.toLowerCase();
    if(name === q) return 100;
    if(name.startsWith(q)) return 80;
    if(name.includes(q)) return 60;
    if(tool.kw.includes(q)) return 40;
    if(tool.catLabel.toLowerCase().includes(q)) return 20;
    return 0;
  }

  function filter(q){
    if(!q || !q.trim()) return KE.Registry.slice(0, 8);
    return KE.Registry
      .map(t => ({ t, s: score(t, q.trim()) }))
      .filter(x => x.s > 0)
      .sort((a,b) => b.s - a.s)
      .map(x => x.t);
  }

  function renderResults(q){
    currentMatches = filter(q);
    selectedIndex = 0;
    if(currentMatches.length === 0){
      results.innerHTML = `<div class="search-empty">No tools found for "${KE.Utils.escapeHtml(q)}"</div>`;
      return;
    }
    results.innerHTML = currentMatches.map((t, i) => `
      <div class="search-result-item${i===0?' selected':''}" data-id="${t.id}">
        <div class="ico">${KE.Icons.svg(t.icon)}</div>
        <div style="flex:1">
          <div>${KE.Utils.escapeHtml(t.name)}</div>
          <div class="meta">${t.catLabel}</div>
        </div>
      </div>`).join("");
    results.querySelectorAll(".search-result-item").forEach(node => {
      node.addEventListener("click", () => {
        close();
        KE.Router.navigate(node.dataset.id);
      });
    });
  }

  function open(){
    if(!modal) build();
    modal.classList.remove("hidden");
    input.value = "";
    input.focus();
    renderResults("");
  }

  function close(){
    if(modal) modal.classList.add("hidden");
  }

  function build(){
    modal = document.createElement("div");
    modal.className = "modal-overlay hidden";
    modal.id = "search-overlay";
    modal.innerHTML = `
      <div class="search-modal">
        <input type="text" placeholder="Search tools... (JSON, PDF, SGPA, QR, Password...)" aria-label="Search tools" />
        <div class="search-results"></div>
      </div>`;
    document.body.appendChild(modal);
    input = modal.querySelector("input");
    results = modal.querySelector(".search-results");

    modal.addEventListener("click", (e) => { if(e.target === modal) close(); });
    input.addEventListener("input", KE.Utils.debounce(() => renderResults(input.value), 80));
    input.addEventListener("keydown", (e) => {
      if(e.key === "Escape"){ close(); }
      else if(e.key === "ArrowDown"){ e.preventDefault(); move(1); }
      else if(e.key === "ArrowUp"){ e.preventDefault(); move(-1); }
      else if(e.key === "Enter"){
        e.preventDefault();
        const t = currentMatches[selectedIndex];
        if(t){ close(); KE.Router.navigate(t.id); }
      }
    });
  }

  function move(dir){
    if(currentMatches.length === 0) return;
    selectedIndex = KE.Utils.clamp(selectedIndex + dir, 0, currentMatches.length - 1);
    results.querySelectorAll(".search-result-item").forEach((n, i) => {
      n.classList.toggle("selected", i === selectedIndex);
    });
    const sel = results.children[selectedIndex];
    if(sel) sel.scrollIntoView({ block:"nearest" });
  }

  function init(){
    document.addEventListener("keydown", (e) => {
      if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"){
        e.preventDefault();
        open();
      }
    });
  }

  return { init, open, close, filter };
})();
