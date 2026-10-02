/* ============================================
   KE Tools — auth.js
   Frontend-only login/signup (per spec, this is the
   ONLY simulated part of the app — no real backend).
   ============================================ */
window.KE = window.KE || {};

KE.Auth = (function(){
  const USERS_KEY = "users";
  const SESSION_KEY = "session";

  function getUsers(){ return KE.Storage.get(USERS_KEY, {}); }
  function saveUsers(u){ KE.Storage.set(USERS_KEY, u); }

  function currentUser(){
    return KE.Storage.get(SESSION_KEY, null);
  }

  function isLoggedIn(){ return !!currentUser(); }

  function signup(name, email, password){
    email = email.trim().toLowerCase();
    const users = getUsers();
    if(users[email]) return { ok:false, error:"An account with this email already exists." };
    if(!name.trim()) return { ok:false, error:"Please enter your name." };
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok:false, error:"Please enter a valid email." };
    if(password.length < 6) return { ok:false, error:"Password must be at least 6 characters." };
    users[email] = { name:name.trim(), email, password };
    saveUsers(users);
    KE.Storage.set(SESSION_KEY, { name:name.trim(), email });
    return { ok:true };
  }

  function login(email, password){
    email = email.trim().toLowerCase();
    const users = getUsers();
    const u = users[email];
    if(!u || u.password !== password){
      return { ok:false, error:"Incorrect email or password." };
    }
    KE.Storage.set(SESSION_KEY, { name:u.name, email:u.email });
    return { ok:true };
  }

  function logout(){
    KE.Storage.remove(SESSION_KEY);
  }

  return { signup, login, logout, currentUser, isLoggedIn };
})();
