/* ============================================
   KE Tools — router.js
   Hash-based routing, sidebar, dashboard, about page,
   and the tool-rendering contract.
   ============================================ */
window.KE = window.KE || {};

KE.tools = {}; // id -> render(container) function

KE.registerTool = function(id, renderFn){
  KE.tools[id] = renderFn;
};

KE.Router = (function(){
  const main = () => document.getElementById("main-content");
  let activeCleanup = null;

  function currentRoute(){
    const hash = location.hash.replace(/^#\/?/, "");
    return hash || "dashboard";
  }

  function navigate(route){
    location.hash = "#/" + route;
  }

  function init(){
    buildSidebar();
    window.addEventListener("hashchange", render);
    render();
  }

  function buildSidebar(){
    const sidebar = document.getElementById("sidebar");
    let html = `
      <div class="sidebar-section">
        <div class="nav-item" data-route="dashboard"><span class="ico">${KE.Icons.svg("home")}</span> Dashboard</div>
      </div>`;

    KE.CATEGORY_ORDER.forEach(cat => {
      const items = KE.Registry.filter(t => t.cat === cat.id);
      html += `
        <div class="nav-group open" data-group="${cat.id}">
          <div class="nav-group-toggle">
            <span>${cat.label}</span>
            <span class="chev">›</span>
          </div>
          <div class="nav-group-items">
            ${items.map(t => `<div class="nav-item" data-route="${t.id}"><span class="ico">${KE.Icons.svg(t.icon)}</span> ${KE.Utils.escapeHtml(t.name)}</div>`).join("")}
          </div>
        </div>`;
    });

    html += `
      <div class="sidebar-section" style="margin-top:14px;">
        <div class="nav-item" data-route="about"><span class="ico">ⓘ</span> About ToolNest</div>
      </div>`;

    sidebar.innerHTML = html;

    sidebar.querySelectorAll(".nav-group-toggle").forEach(t => {
      t.addEventListener("click", () => t.closest(".nav-group").classList.toggle("open"));
    });
    sidebar.querySelectorAll("[data-route]").forEach(n => {
      n.addEventListener("click", () => {
        navigate(n.dataset.route);
        closeMobileSidebar();
      });
    });
  }

  function highlightActive(route){
    document.querySelectorAll(".nav-item").forEach(n => {
      n.classList.toggle("active", n.dataset.route === route);
    });
    const tool = KE.getTool(route);
    if(tool){
      const group = document.querySelector(`.nav-group[data-group="${tool.cat}"]`);
      if(group) group.classList.add("open");
    }
    const bn = document.querySelectorAll(".bn-item");
    bn.forEach(n => n.classList.toggle("active", n.dataset.bn === (route === "dashboard" ? "home" : route === "favorites" ? "favorites" : "")));
  }

  function closeMobileSidebar(){
    document.getElementById("sidebar").classList.remove("open");
    const scrim = document.getElementById("sidebar-scrim");
    if(scrim) scrim.classList.remove("show");
  }

  function render(){
    const route = currentRoute();
    highlightActive(route);
    const container = main();
    if(typeof activeCleanup === "function") { try { activeCleanup(); } catch(e) {} }
    activeCleanup = null;
    container.innerHTML = "";
    container.scrollTop = 0;
    window.scrollTo(0,0);

    if(route === "dashboard"){
      renderDashboard(container);
    } else if(route === "about"){
      renderAbout(container);
    } else if(route === "favorites"){
      renderFavoritesPage(container);
    } else if(KE.tools[route]){
      renderToolPage(route, container);
    } else {
      renderNotFound(container, route);
    }
  }

  function toolCard(t){
    const fav = KE.Favorites.isFav(t.id);
    const toolIcon = KE.Utils.el("div", { class:"tool-ico" });
    toolIcon.innerHTML = KE.Icons.svg(t.icon);
    const favBtn = KE.Utils.el("button", {
      class:"fav-star" + (fav ? " active" : ""),
      "aria-label":"Toggle favorite",
      onclick:(e) => {
        e.stopPropagation();
        const nowFav = KE.Favorites.toggle(t.id);
        e.currentTarget.classList.toggle("active", nowFav);
        KE.Utils.toast(nowFav ? `Added ${t.name} to favorites` : `Removed ${t.name} from favorites`, "success", 1800);
        if(currentRoute() === "dashboard" || currentRoute() === "favorites") render();
      }
    });
    favBtn.innerHTML = KE.Icons.svg("star");
    const card = KE.Utils.el("div", { class:"tool-card", onclick:() => navigate(t.id) }, [
      favBtn,
      toolIcon,
      KE.Utils.el("div", { class:"tool-name" }, t.name),
      KE.Utils.el("div", { class:"tool-cat" }, t.catLabel),
    ]);
    return card;
  }

  function renderDashboard(container){
    const user = KE.Auth.currentUser();
    const firstName = user ? user.name.split(" ")[0] : "there";

    const wrap = KE.Utils.el("div");
    wrap.appendChild(KE.Utils.el("div", { class:"page-head" }, [
      KE.Utils.el("h1", {}, `Welcome back, ${KE.Utils.escapeHtml(firstName)}`),
      KE.Utils.el("p", {}, "What do you want to do today?"),
    ]));

    const dashSearchIcon = KE.Utils.el("span", { class:"ico" });
    dashSearchIcon.innerHTML = KE.Icons.svg("search");
    const searchBar = KE.Utils.el("div", { class:"dash-search", onclick: () => KE.Search.open() }, [
      dashSearchIcon,
      KE.Utils.el("span", {}, "Search tools..."),
      KE.Utils.el("kbd", {}, "Ctrl K"),
    ]);
    wrap.appendChild(searchBar);

    // Quick access: favorites first, else defaults
    const favIds = KE.Favorites.list();
    const quickIds = favIds.length ? favIds.slice(0,8) : ["sgpa","json","compressor","qr"];
    const quickTools = quickIds.map(id => KE.getTool(id)).filter(Boolean);
    wrap.appendChild(KE.Utils.el("div", { class:"section-title" }, favIds.length ? "Favorite Tools" : "Quick Access"));
    const quickGrid = KE.Utils.el("div", { class:"tool-grid" });
    quickTools.forEach(t => quickGrid.appendChild(toolCard(t)));
    wrap.appendChild(quickGrid);

    // Recently used
    const recentIds = KE.Recent.list();
    wrap.appendChild(KE.Utils.el("div", { class:"section-title" }, "Recently Used"));
    if(recentIds.length === 0){
      wrap.appendChild(KE.Utils.el("div", { class:"empty-state" }, "No recent tools yet — open any tool and it will show up here."));
    } else {
      const recentGrid = KE.Utils.el("div", { class:"tool-grid" });
      recentIds.map(id => KE.getTool(id)).filter(Boolean).forEach(t => recentGrid.appendChild(toolCard(t)));
      wrap.appendChild(recentGrid);
    }

    // Browse all, by category
    KE.CATEGORY_ORDER.forEach(cat => {
      const items = KE.Registry.filter(t => t.cat === cat.id);
      wrap.appendChild(KE.Utils.el("div", { class:"section-title" }, [
        cat.label, KE.Utils.el("span", { class:"count" }, `${items.length} tools`)
      ]));
      const grid = KE.Utils.el("div", { class:"tool-grid" });
      items.forEach(t => grid.appendChild(toolCard(t)));
      wrap.appendChild(grid);
    });

    container.appendChild(wrap);
  }

  function renderFavoritesPage(container){
    const wrap = KE.Utils.el("div");
    wrap.appendChild(KE.Utils.el("div", { class:"page-head" }, [
      KE.Utils.el("h1", {}, "Favorite Tools"),
      KE.Utils.el("p", {}, "Tools you've starred for quick access."),
    ]));
    const favIds = KE.Favorites.list();
    if(favIds.length === 0){
      wrap.appendChild(KE.Utils.el("div", { class:"empty-state" }, "You haven't favorited any tools yet. Tap the ☆ on any tool card to add it here."));
    } else {
      const grid = KE.Utils.el("div", { class:"tool-grid" });
      favIds.map(id => KE.getTool(id)).filter(Boolean).forEach(t => grid.appendChild(toolCard(t)));
      wrap.appendChild(grid);
    }
    container.appendChild(wrap);
  }

  function renderToolPage(id, container){
    const t = KE.getTool(id);
    KE.Recent.push(id);

    const header = KE.Utils.el("div", { class:"tool-header" }, [
      KE.Utils.el("div", {}, [
        KE.Utils.el("h2", {}, [KE.Utils.el("span", {class:"tool-title-icon"}), ` ${t.name}`]),
        KE.Utils.el("p", {}, toolDescription(id)),
      ]),
    ]);

    header.querySelector(".tool-title-icon").innerHTML = KE.Icons.svg(t.icon);

    const favBtn = KE.Utils.el("button", {
      class:"icon-btn", "aria-label":"Toggle favorite", style:"font-size:17px;",
      onclick:() => {
        const nowFav = KE.Favorites.toggle(id);
        favBtn.innerHTML = KE.Icons.svg("star");
        favBtn.style.color = nowFav ? "var(--gold)" : "";
        KE.Utils.toast(nowFav ? "Added to favorites" : "Removed from favorites", "success", 1800);
      }
    });
    if(KE.Favorites.isFav(id)) favBtn.style.color = "var(--gold)";
    favBtn.innerHTML = KE.Icons.svg("star");
    header.appendChild(favBtn);

    const card = KE.Utils.el("div", { class:"card" });
    card.appendChild(header);
    const body = KE.Utils.el("div", { id:"tool-body" });
    card.appendChild(body);

    container.appendChild(card);

    try{
      KE.tools[id](body);
      activeCleanup = typeof body._cleanup === "function" ? body._cleanup : null;
    }catch(e){
      console.error(e);
      body.innerHTML = `<div class="code-output error-text">This tool hit an unexpected error: ${KE.Utils.escapeHtml(e.message)}. Try reloading the page.</div>`;
    }
  }

  function toolDescription(id){
    const map = {
      sgpa:"Add your subjects, credits and grades to calculate your semester GPA.",
      cgpa:"Combine SGPA and credits across semesters into a weighted CGPA.",
      attendance:"Check your attendance percentage and how many classes you can safely miss.",
      percentage:"Calculate percentage from obtained and total marks.",
      marks:"Work out total marks, percentage and pass/fail status from internal and external scores.",
      "target-sgpa":"Find the SGPA you need this semester to hit your target CGPA.",
      "attendance-planner":"Plan how many classes you need to attend to reach a target attendance percentage.",
      json:"Format, minify and validate JSON — entirely in your browser.",
      base64:"Encode or decode Base64 text.",
      jwt:"Decode a JWT's header and payload. This does not verify the signature.",
      regex:"Test a regular expression against a string and see matches, groups and positions.",
      uuid:"Generate one or many random UUID v4 values.",
      hash:"Generate SHA-256 / SHA-384 / SHA-512 hashes from text or a file, using the Web Crypto API.",
      url:"Encode or decode a URL / URI component.",
      timestamp:"Convert between Unix timestamps and human-readable dates.",
      "html-entities":"Encode or decode HTML entities like &lt; &gt; &amp;.",
      color:"Convert colors between HEX, RGB and HSL with a live preview.",
      "json-csv":"Convert JSON arrays to CSV and back again.",
      compressor:"Compress images in your browser by adjusting quality — no upload required.",
      converter:"Convert images between JPG, PNG and WEBP.",
      resizer:"Resize an image by width/height, with optional locked aspect ratio.",
      cropper:"Crop an image freely or to a fixed aspect ratio.",
      rotate:"Rotate or flip an image.",
      "base64-image":"Convert an image into a Base64 data URL.",
      merge:"Combine multiple PDFs into a single file, in the order you choose.",
      split:"Split a PDF by page range or into individual pages.",
      extract:"Extract specific pages from a PDF into a new file.",
      "delete-pages":"Remove selected pages from a PDF.",
      reorder:"Drag and drop to reorder the pages of a PDF.",
      "rotate-pdf":"Rotate selected pages of a PDF by 90°, 180° or 270°.",
      "images-to-pdf":"Combine multiple images into a single PDF.",
      "pdf-to-images":"Render each page of a PDF as a downloadable image.",
      qr:"Generate a QR code for a URL, text, Wi-Fi, email, phone, SMS, vCard or location.",
      barcode:"Generate a barcode from text or numbers.",
      password:"Generate a strong, random password with a strength indicator.",
      stopwatch:"A simple stopwatch with lap tracking.",
      timer:"A countdown timer with hours, minutes and seconds.",
      pomodoro:"A customizable Pomodoro focus timer.",
      units:"Convert between units of length, weight, temperature, area, volume, speed, time and data.",
      age:"Calculate exact age in years, months and days from a date of birth.",
      date:"Calculate the difference between two dates, or add/subtract days from a date.",
      "time-difference":"Calculate the difference between two times.",
      timezone:"Convert a date and time between common world time zones using your browser's Intl time-zone data.",
      "digital-clock":"A live digital clock and local date display.",
      "analog-clock":"A smooth live analog clock rendered locally on canvas.",
      "scientific-calculator":"Evaluate common scientific expressions with trigonometry, logarithms, roots, powers and factorials.",
      bmi:"Calculate body mass index from height and weight.",
      discount:"Calculate discount amount and final sale price.",
      "fuel-price":"Calculate fuel cost from litres and price per litre.",
      mileage:"Calculate vehicle mileage, fuel cost and cost per kilometre.",
      interest:"Compare simple and compound interest and total amount.",
      electricity:"Estimate energy consumption and electricity cost from appliance usage.",
      currency:"Convert currencies using editable offline reference rates.",
      emi:"Calculate monthly loan EMI, total payment and total interest.",
      "text-binary":"Convert UTF-8 text to binary and binary groups back to text.",
      morse:"Encode text into Morse code or decode Morse code into text.",
      "text-encryption":"Encrypt and decrypt text locally with password-based AES-GCM.",
      "text-counter":"Count words, letters, characters, lines and sentences in text.",
      tts:"Speak text with installed browser voices and male-style, female-style or child-style profiles.",
      quotes:"Get random quotes from sad, happy, crazy, love, nature, motivation and wisdom categories.",
      "typing-test":"Measure typing speed in WPM and accuracy with timed tests.",
      invoice:"Create a simple invoice with items, tax and printable output.",
      dice:"Roll up to 12 dice with selectable side counts.",
      "tic-tac-toe":"Play a local two-player Tic Tac Toe game.",
      "coin-toss":"Flip a virtual coin and track heads and tails.",
    };
    return map[id] || "";
  }

  function renderAbout(container){
    container.appendChild(KE.Utils.el("div", { class:"page-head" }, [
      KE.Utils.el("h1", {}, "About ToolNest"),
    ]));
    const card = KE.Utils.el("div", { class:"card" });
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
        <div class="ke-mark" style="--size:52px;"><img src="assets/toolnest-logo.png" alt="" /></div>
        <div>
          <div style="font-size:18px;font-weight:800;">ToolNest</div>
          <div style="color:var(--text-3);font-size:13px;">Your everyday digital toolbox.</div>
        </div>
      </div>
      <p style="color:var(--text-2);font-size:14px;line-height:1.7;max-width:64ch;">
        ToolNest is an all-in-one utility platform designed to bring everyday digital tools into one simple, fast, and beautifully organized space.
      </p>
      <p style="color:var(--text-2);font-size:14px;line-height:1.7;max-width:64ch;margin-top:14px;">
        From student utilities and developer tools to image, productivity, and everyday utilities, ToolNest helps you get things done without jumping between multiple websites or applications.
      </p>
      <p style="color:var(--text-2);font-size:14px;line-height:1.7;max-width:64ch;margin-top:14px;">
        Built around a modern liquid-glass interface, ToolNest combines simplicity, speed, and a polished visual experience while keeping every tool easy to access.
      </p>
      <p style="color:var(--cyan);font-size:15px;font-weight:700;margin-top:22px;">One place. Many tools. Zero clutter.</p>`;
    container.appendChild(card);
  }

  function renderNotFound(container, route){
    container.appendChild(KE.Utils.el("div", { class:"empty-state" }, `"${KE.Utils.escapeHtml(route)}" isn't a page in ToolNest. Use the search (Ctrl+K) to find a tool.`));
  }

  return { init, navigate, currentRoute, render };
})();
