/* ============================================
   KE Tools — theme.js
   Dark / Light / System theme handling
   ============================================ */
window.KE = window.KE || {};

KE.Theme = (function(){
  const KEY = "theme"; // "dark" | "light" | "system"

  function apply(pref){
    let effective = pref;
    if(pref === "system"){
      effective = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    document.documentElement.setAttribute("data-theme", effective);
  }

  function get(){
    return KE.Storage.get(KEY, "dark");
  }

  function set(pref){
    KE.Storage.set(KEY, pref);
    apply(pref);
  }

  function cycle(){
    const order = ["dark","light","system"];
    const next = order[(order.indexOf(get()) + 1) % order.length];
    set(next);
    return next;
  }

  function init(){
    apply(get());
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
      if(get() === "system") apply("system");
    });
  }

  return { init, get, set, cycle, apply };
})();
