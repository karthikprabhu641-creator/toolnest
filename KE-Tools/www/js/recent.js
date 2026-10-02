/* ============================================
   KE Tools — recent.js
   ============================================ */
window.KE = window.KE || {};

KE.Recent = (function(){
  const KEY = "recent";
  const MAX = 8;

  function list(){ return KE.Storage.get(KEY, []); }

  function push(toolId){
    let items = list().filter(id => id !== toolId);
    items.unshift(toolId);
    items = items.slice(0, MAX);
    KE.Storage.set(KEY, items);
  }

  return { list, push };
})();
