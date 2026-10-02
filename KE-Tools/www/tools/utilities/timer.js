/* ============================================
   KE Tools — Timer
   ============================================ */
KE.registerTool("timer", function(container){
  container.innerHTML = `
    <div class="form-row" style="justify-content:center; max-width:340px; margin:0 auto;">
      <div class="form-group"><label>Hours</label><input type="number" id="tm-h" min="0" max="23" value="0" /></div>
      <div class="form-group"><label>Minutes</label><input type="number" id="tm-m" min="0" max="59" value="5" /></div>
      <div class="form-group"><label>Seconds</label><input type="number" id="tm-s" min="0" max="59" value="0" /></div>
    </div>
    <div class="timer-display" id="tm-display">05:00</div>
    <div class="btn-row" style="justify-content:center;">
      <button class="btn btn-accent" id="tm-start">Start</button>
      <button class="btn btn-ghost" id="tm-reset">Reset</button>
    </div>
  `;
  const display = container.querySelector("#tm-display");
  const startBtn = container.querySelector("#tm-start");
  const hInput = container.querySelector("#tm-h"), mInput = container.querySelector("#tm-m"), sInput = container.querySelector("#tm-s");
  let remaining = 300, interval = null, running = false;

  function fmt(sec){
    const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60;
    return h > 0 ? `${KE.Utils.pad(h)}:${KE.Utils.pad(m)}:${KE.Utils.pad(s)}` : `${KE.Utils.pad(m)}:${KE.Utils.pad(s)}`;
  }

  function syncFromInputs(){
    remaining = KE.Utils.clamp(Number(hInput.value)||0,0,23)*3600 + KE.Utils.clamp(Number(mInput.value)||0,0,59)*60 + KE.Utils.clamp(Number(sInput.value)||0,0,59);
    display.textContent = fmt(remaining);
  }
  [hInput,mInput,sInput].forEach(i => i.addEventListener("input", () => { if(!running) syncFromInputs(); }));

  startBtn.addEventListener("click", () => {
    if(!running){
      if(remaining <= 0) syncFromInputs();
      if(remaining <= 0){ KE.Utils.toast("Set a duration greater than 0.", "error"); return; }
      running = true; startBtn.textContent = "Pause";
      [hInput,mInput,sInput].forEach(i => i.disabled = true);
      interval = setInterval(() => {
        remaining--;
        display.textContent = fmt(Math.max(0,remaining));
        if(remaining <= 0){
          clearInterval(interval); running = false;
          startBtn.textContent = "Start";
          [hInput,mInput,sInput].forEach(i => i.disabled = false);
          KE.Utils.toast("Timer finished!", "success", 5000);
        }
      }, 1000);
    } else {
      running = false; clearInterval(interval); startBtn.textContent = "Resume";
    }
  });

  container.querySelector("#tm-reset").addEventListener("click", () => {
    running = false; clearInterval(interval); startBtn.textContent = "Start";
    [hInput,mInput,sInput].forEach(i => i.disabled = false);
    syncFromInputs();
  });

  syncFromInputs();
});
