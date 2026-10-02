/* ============================================
   KE Tools — Stopwatch
   ============================================ */
KE.registerTool("stopwatch", function(container){
  container.innerHTML = `
    <div class="stopwatch-display" id="sw-display">00:00.00</div>
    <div class="btn-row" style="justify-content:center;">
      <button class="btn btn-accent" id="sw-start">Start</button>
      <button class="btn" id="sw-lap" disabled>Lap</button>
      <button class="btn btn-ghost" id="sw-reset">Reset</button>
    </div>
    <div class="table-wrap" style="margin-top:20px;">
      <table class="data-table"><thead><tr><th>Lap</th><th>Split</th><th>Total</th></tr></thead><tbody id="sw-laps"></tbody></table>
    </div>
  `;
  let running = false, startTime = 0, elapsed = 0, raf = null, laps = [], lastLapTime = 0;
  const display = container.querySelector("#sw-display");
  const startBtn = container.querySelector("#sw-start");
  const lapBtn = container.querySelector("#sw-lap");
  const lapsBody = container.querySelector("#sw-laps");

  function fmt(ms){
    const m = Math.floor(ms/60000);
    const s = Math.floor((ms%60000)/1000);
    const cs = Math.floor((ms%1000)/10);
    return `${KE.Utils.pad(m)}:${KE.Utils.pad(s)}.${KE.Utils.pad(cs)}`;
  }

  function tick(){
    if(!running) return;
    display.textContent = fmt(elapsed + (performance.now() - startTime));
    raf = requestAnimationFrame(tick);
  }

  startBtn.addEventListener("click", () => {
    if(!running){
      running = true; startTime = performance.now();
      startBtn.textContent = "Pause"; lapBtn.disabled = false;
      tick();
    } else {
      running = false; elapsed += performance.now() - startTime;
      startBtn.textContent = "Resume";
      cancelAnimationFrame(raf);
    }
  });

  lapBtn.addEventListener("click", () => {
    const total = elapsed + (running ? performance.now() - startTime : 0);
    const split = total - lastLapTime;
    lastLapTime = total;
    laps.unshift({ n: laps.length + 1, split, total });
    lapsBody.innerHTML = laps.map(l => `<tr><td>Lap ${l.n}</td><td>${fmt(l.split)}</td><td>${fmt(l.total)}</td></tr>`).join("");
  });

  container.querySelector("#sw-reset").addEventListener("click", () => {
    running = false; elapsed = 0; lastLapTime = 0; laps = [];
    cancelAnimationFrame(raf);
    display.textContent = "00:00.00";
    startBtn.textContent = "Start"; lapBtn.disabled = true;
    lapsBody.innerHTML = "";
  });
});
