/* ============================================
   KE Tools — app.js
   Bootstraps the app: loading screen, auth gate,
   shell wiring (theme, search, sidebar, profile).
   ============================================ */
(function(){

  document.addEventListener("DOMContentLoaded", () => {
    KE.Theme.init();
    boot();
  });

  function boot(){
    if(KE.Auth.isLoggedIn()){
      showApp();
    } else {
      showAuth();
    }
  }

  function showAuth(){
    const screen = document.getElementById("auth-screen");
    screen.classList.remove("hidden");
    wireAuthForm();
  }

  function wireAuthForm(){
    const tabs = document.querySelectorAll(".auth-tab");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const mode = tab.dataset.tab;
        loginForm.classList.toggle("hidden", mode !== "login");
        signupForm.classList.toggle("hidden", mode !== "signup");
      });
    });
    document.querySelectorAll("[data-switch]").forEach(link => {
      link.addEventListener("click", () => {
        document.querySelector(`.auth-tab[data-tab="${link.dataset.switch}"]`).click();
      });
    });

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      const errBox = document.getElementById("login-error");
      const result = KE.Auth.login(email, password);
      if(result.ok){
        errBox.classList.remove("show");
        document.getElementById("auth-screen").classList.add("hidden");
        showApp();
      } else {
        errBox.textContent = result.error;
        errBox.classList.add("show");
      }
    });

    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("signup-name").value;
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;
      const confirm = document.getElementById("signup-confirm").value;
      const errBox = document.getElementById("signup-error");
      if(password !== confirm){
        errBox.textContent = "Passwords do not match.";
        errBox.classList.add("show");
        return;
      }
      const result = KE.Auth.signup(name, email, password);
      if(result.ok){
        errBox.classList.remove("show");
        document.getElementById("auth-screen").classList.add("hidden");
        showApp();
      } else {
        errBox.textContent = result.error;
        errBox.classList.add("show");
      }
    });
  }

  function showApp(){
    document.getElementById("auth-screen").classList.add("hidden");
    const shell = document.getElementById("app-shell");
    shell.classList.remove("hidden");
    document.querySelectorAll(".search-ico").forEach(el => el.innerHTML = KE.Icons.svg("search"));
    const menuIcon = document.querySelector(".menu-ico"); if(menuIcon) menuIcon.innerHTML = KE.Icons.svg("menu");
    const homeIcon = document.querySelector(".home-ico"); if(homeIcon) homeIcon.innerHTML = KE.Icons.svg("home");
    const favIcon = document.querySelector(".favorites-ico"); if(favIcon) favIcon.innerHTML = KE.Icons.svg("star");
    const authIcon = document.querySelector(".auth-note-icon"); if(authIcon) authIcon.innerHTML = KE.Icons.svg("lock");
    wireShell();
    KE.Search.init();
    KE.Router.init();
  }

  function wireShell(){
    const user = KE.Auth.currentUser();

    // Theme toggle
    const themeBtn = document.getElementById("theme-toggle");
    updateThemeIcon(themeBtn);
    themeBtn.addEventListener("click", () => {
      KE.Theme.cycle();
      updateThemeIcon(themeBtn);
    });

    // Mobile menu
    const menuBtn = document.getElementById("menu-btn");
    const sidebar = document.getElementById("sidebar");
    const scrim = document.getElementById("sidebar-scrim");
    menuBtn.addEventListener("click", () => {
      sidebar.classList.add("open");
      scrim.classList.add("show");
    });
    scrim.addEventListener("click", () => {
      sidebar.classList.remove("open");
      scrim.classList.remove("show");
    });

    // Profile menu
    const avatarBtn = document.getElementById("avatar-btn");
    avatarBtn.textContent = (user && user.name ? user.name.trim()[0] : "K").toUpperCase();
    avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleProfileMenu(user);
    });
    document.addEventListener("click", () => closeProfileMenu());

    // Bottom nav (mobile)
    document.querySelectorAll(".bn-item").forEach(item => {
      item.addEventListener("click", () => {
        const bn = item.dataset.bn;
        if(bn === "home") KE.Router.navigate("dashboard");
        else if(bn === "search") KE.Search.open();
        else if(bn === "favorites") KE.Router.navigate("favorites");
        else if(bn === "more") KE.Router.navigate("about");
      });
    });
  }

  function updateThemeIcon(btn){
    const pref = KE.Theme.get();
    btn.querySelector(".theme-ico").innerHTML = KE.Icons.svg(pref === "dark" ? "moon" : pref === "light" ? "sun" : "monitor");
    btn.title = "Theme: " + pref;
  }

  let profileMenuEl = null;
  function toggleProfileMenu(user){
    if(profileMenuEl){ closeProfileMenu(); return; }
    profileMenuEl = KE.Utils.el("div", { class:"profile-menu" }, [
      KE.Utils.el("div", { class:"pm-name" }, user ? user.name : "Guest"),
      KE.Utils.el("div", { class:"pm-email" }, user ? user.email : ""),
      KE.Utils.el("div", { class:"pm-item", onclick:() => KE.Router.navigate("about") }, "About ToolNest"),
      KE.Utils.el("div", { class:"pm-item", onclick:() => { KE.Auth.logout(); location.reload(); } }, "Log out"),
    ]);
    document.body.appendChild(profileMenuEl);
  }
  function closeProfileMenu(){
    if(profileMenuEl){ profileMenuEl.remove(); profileMenuEl = null; }
  }

  const iconObserver = new MutationObserver(() => {
    if(window.KE && KE.Icons) KE.Icons.replaceEmojiText(document.body);
  });
  iconObserver.observe(document.body, {childList:true, subtree:true});

})();
