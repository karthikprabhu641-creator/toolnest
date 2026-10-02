/* ============================================
   KE Tools — storage.js
   Small localStorage wrapper used by every module.
   ============================================ */
window.KE = window.KE || {};

KE.Storage = (function(){
  const PREFIX = "ketools:";

  function get(key, fallback){
    try{
      const raw = localStorage.getItem(PREFIX + key);
      if(raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    }catch(e){
      return fallback;
    }
  }

  function set(key, value){
    try{
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    }catch(e){
      console.error("KE.Storage.set failed", e);
      return false;
    }
  }

  function remove(key){
    try{ localStorage.removeItem(PREFIX + key); }catch(e){}
  }

  function has(key){
    return localStorage.getItem(PREFIX + key) !== null;
  }

  return { get, set, remove, has };
})();
