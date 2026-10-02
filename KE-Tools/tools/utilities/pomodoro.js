/* ============================================
   KE Tools — Pomodoro
   ============================================ */
KE.registerTool("pomodoro", function(container){
  container.innerHTML = `
    <div class="form-row" style="justify-content:center; max-width:340px; margin:0 auto;">
      <div class="form-group"><label>Work (minutes)</label><input type="number" id="pm-work" min="1" max="120" value="25" /></div>
      <div class="form-group"><label>Break (minutes)</label><input type="number" id="pm-break" min="1" max="60" value="5" /></div>
    </div>
    <div class="pomodoro-ring">
      <div class="badge badge-blue" id="pm-phase">Work session</div>
    </div>
    <div class="timer-display" id="pm-display">25:00</div>
    <div class="btn-row" style="justify-content:center;">
      <button class="btn btn-accent" id="pm-start">Start</button>
      <button class="btn btn-ghost" id="pm-reset">Reset</button>
    </div>
    <div class="helper-text" style="text-align:center;">Sessions completed: <span id="pm-count">0</span></div>
  `;
  const display = container.querySelector("#pm-display");
  const phaseBadge = container.querySelector("#pm-phase");
  const startBtn = container.querySelector("#pm-start");
  const workInput = container.querySelector("#pm-work"), breakInput = container.querySelector("#pm-break");
  const countEl = container.querySelector("#pm-count");
  let phase = "work", remaining = 25*60, interval = null, running = false, sessions = 0;

  function fmt(sec){ return `${KE.Utils.pad(Math.floor(sec/60))}:${KE.Utils.pad(sec%60)}`; }

  function setPhase(p){
    phase = p;
    const mins = p === "work" ? Number(workInput.value) : Number(breakInput.value);
    remaining = mins * 60;
    display.textContent = fmt(remaining);
    phaseBadge.textContent = p === "work" ? "Work session" : "Break";
    phaseBadge.className = "badge " + (p === "work" ? "badge-blue" : "badge-success");
  }

  [workInput,breakInput].forEach(i => i.addEventListener("input", () => { if(!running) setPhase(phase); }));

  startBtn.addEventListener("click", () => {
    if(!running){
      running = true; startBtn.textContent = "Pause";
      [workInput,breakInput].forEach(i => i.disabled = true);
      interval = setInterval(() => {
        remaining--;
        display.textContent = fmt(Math.max(0,remaining));
        if(remaining <= 0){
          if(phase === "work"){ sessions++; countEl.textContent = sessions; KE.Utils.toast("Work session done — take a break!", "success", 5000); setPhase("break"); }
          else { KE.Utils.toast("Break's over — back to work!", "success", 5000); setPhase("work"); }
        }
      }, 1000);
    } else {
      running = false; clearInterval(interval); startBtn.textContent = "Resume";
    }
  });

  container.querySelector("#pm-reset").addEventListener("click", () => {
    running = false; clearInterval(interval); startBtn.textContent = "Start";
    [workInput,breakInput].forEach(i => i.disabled = false);
    sessions = 0; countEl.textContent = "0";
    setPhase("work");
  });

  setPhase("work");
});
