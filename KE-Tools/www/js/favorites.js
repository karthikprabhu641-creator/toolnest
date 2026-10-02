/* ============================================
   KE Tools — favorites.js
   ============================================ */
window.KE = window.KE || {};

KE.Favorites = (function(){
  const KEY = "favorites";

  function list(){ return KE.Storage.get(KEY, []); }

  function isFav(toolId){ return list().includes(toolId); }

  function toggle(toolId){
    let favs = list();
    if(favs.includes(toolId)){
      favs = favs.filter(id => id !== toolId);
    } else {
      favs.push(toolId);
    }
    KE.Storage.set(KEY, favs);
    return favs.includes(toolId);
  }

  return { list, isFav, toggle };
})();
