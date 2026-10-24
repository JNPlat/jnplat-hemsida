/* J. Norberg Plåtslageri – mobilmenyn (stående skärm)
   Lägger till en ringknapp och en menyknapp i headern och bygger en
   helskärmsmeny där tjänsterna ligger som undermeny under Tjänster.
   Läses in på alla sidor: <script src="menu.js" data-base="">
   (data-base="../" på sidor i undermappar). Stil i header.css. */
(function () {
  const base = document.currentScript?.dataset.base || "";

  // ---------- Tema: Kopparbrun (ljust) och Ärggrön (mörkt) ----------
  // Kopparbrun är nylagd koppar, Ärggrön samma koppar om hundra år.
  // Valet sparas i webbläsaren. Ett litet skript i varje sidas <head> sätter
  // temat innan sidan ritas, så att den inte blinkar till i fel färg.
  // Båda knapparna visar kopparen just nu: "Nylagt" (Kopparbrun) eller "Hundra år" (Ärggrön).
  // Mobil: ruta med "Nylagt" på en rad eller "Hundra/år" på två.
  // Vid byte sprider sig den nya färgen från knappen; vid Ärggrön visas ett kort meddelande.
  const THEMES = {
    kopparbrun: { label: "Kopparbrun", color: "#f3eee6", logo: "logo/J-NORBERG.svg", menuLogo: "logo/J-NORBERG-vit.webp" },
    argron: { label: "Ärggrön", color: "#3f4139", logo: "logo/J-NORBERG-mork.svg", menuLogo: "logo/J-NORBERG-vit.webp" }
  };
  const currentTheme = () => (document.documentElement.dataset.theme === "argron" ? "argron" : "kopparbrun");

  function applyTheme(name) {
    const theme = THEMES[name] ? name : "kopparbrun";
    if (theme === "argron") document.documentElement.dataset.theme = "argron";
    else delete document.documentElement.dataset.theme;
    try { localStorage.setItem("jnplat-tema", theme); } catch (error) { /* privat läge */ }
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEMES[theme].color);
    document.querySelectorAll(".brand img").forEach((img) => { img.src = base + THEMES[theme].logo; });
    document.querySelectorAll(".site-menu-brand img").forEach((img) => { img.src = base + THEMES[theme].menuLogo; });
    const other = theme === "argron" ? "kopparbrun" : "argron";
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      button.dataset.target = other;
      button.setAttribute("aria-label", other === "argron"
        ? `Se kopparen om hundra år (${THEMES.argron.label}, mörkt utseende)`
        : `Tillbaka till nylagd koppar (${THEMES.kopparbrun.label}, ljust utseende)`);
      const years = button.querySelector(".theme-toggle-years");
      const unit = button.querySelector(".theme-toggle-unit");
      if (years) years.textContent = theme === "argron" ? "Hundra" : "Nylagt";
      if (unit) unit.textContent = theme === "argron" ? "år" : "";
      const label = button.querySelector(".theme-toggle-label");
      if (label) label.textContent = theme === "argron" ? "Hundra år" : "Nylagt";
    });
  }

  // Meddelandet som glider fram efter bytet till Ärggrön (inget vid Kopparbrun)
  function showThemeToast(theme) {
    let toast = document.querySelector(".theme-toast");
    if (theme !== "argron") {
      toast?.classList.remove("is-visible");
      return;
    }
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "theme-toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = "Efter hundra år har kopparen fått sin patina.";
    toast.classList.remove("is-visible");
    void toast.offsetWidth;
    toast.classList.add("is-visible");
    clearTimeout(showThemeToast.timer);
    showThemeToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  // Den nya färgen sprider sig i en cirkel från knappen, som ärg över plåt
  function switchTheme(name, button) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce || !button) {
      applyTheme(name);
      showThemeToast(name);
      return;
    }
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const root = document.documentElement;
    root.style.setProperty("--theme-x", `${x}px`);
    root.style.setProperty("--theme-y", `${y}px`);
    root.style.setProperty("--theme-r", `${radius}px`);
    root.classList.add("theme-transition");
    let applied = false;
    const transition = document.startViewTransition(() => { applied = true; applyTheme(name); });
    transition.finished.finally(() => root.classList.remove("theme-transition"));
    transition.ready.then(() => showThemeToast(name)).catch(() => {});
    // Skydd: startar inte effekten (t.ex. om webbläsaren inte ritar) byts temat ändå
    setTimeout(() => {
      if (applied) return;
      transition.skipTransition?.();
      applyTheme(name);
      showThemeToast(name);
      root.classList.remove("theme-transition");
    }, 600);
  }

  const header = document.querySelector(".site-header .nav-wrap");
  if (!header) return;

  const onHomePage = document.body.classList.contains("home-page");
  const currentService = document.body.dataset.service || "";
  const home = onHomePage ? "" : `${base}index.html`;
  /* cms:kontakt */
  const phone = { href: "tel:0722848557", label: "072-284 85 57" };
  const mail = "info@jnplat.se";
  /* /cms:kontakt */

  const sections = [
    ["#hem", "Hem"],
    ["#loftet", "Mitt löfte"],
    ["#tjanster", "Tjänster"],
    ["#sa-jobbar-jag", "Så jobbar jag"],
    ["#om", "Om J. Norberg"],
    ["#aktuellt", "Aktuellt"]
  ];
  const services = [
    ["byggnadsplatslageri", "Byggnadsplåtslageri"],
    ["kopparslageri", "Kopparslageri"],
    ["restaurering", "Restaurering"],
    ["specialprojekt", "Specialprojekt"]
  ];

  const serviceLinks = services.map(([id, label]) => {
    const current = id === currentService ? ' aria-current="page"' : "";
    return `<li><a href="${base}tjanster/${id}.html"${current}>${label}</a></li>`;
  }).join("");

  const items = sections.map(([hash, label]) => {
    const sub = hash === "#tjanster" ? `<ul class="site-menu-sub">${serviceLinks}</ul>` : "";
    return `<li><a href="${home}${hash}">${label}</a>${sub}</li>`;
  }).join("");

  // Projektsidan: tillbaka till tjänsten överst i menyn
  const back = document.getElementById("back-to-service");
  const backItem = back ? `<a class="site-menu-back" href="${back.getAttribute("href")}">← Tillbaka</a>` : "";

  // Dator: textknapp. Mobil: ruta med kopparens ålder.
  const themeButton = `<button class="theme-toggle" type="button"><span class="theme-toggle-label" aria-hidden="true">Nylagt</span></button>`;
  const themeBox = `<button class="theme-toggle theme-toggle--header" type="button"><span class="theme-toggle-years" aria-hidden="true">Nylagt</span><span class="theme-toggle-unit" aria-hidden="true"></span></button>`;
  const nav = header.querySelector(".main-nav");
  const navContact = nav?.querySelector(".header-contact");
  if (navContact) navContact.insertAdjacentHTML("beforebegin", themeButton);
  else nav?.insertAdjacentHTML("beforeend", themeButton);

  header.insertAdjacentHTML("beforeend", `
    <div class="header-actions">
      ${themeBox}
      <a class="header-call" href="${phone.href}" aria-label="Ring ${phone.label}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>
      </a>
      <button class="header-menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu" aria-label="Öppna menyn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>`);

  document.body.insertAdjacentHTML("beforeend", `
    <div class="site-menu" id="site-menu" role="dialog" aria-modal="true" aria-label="Meny" hidden>
      <div class="site-menu-top">
        <a class="site-menu-brand" href="${home}#hem" aria-label="J. Norberg Plåtslageri AB – startsida">
          <img src="${base}logo/J-NORBERG-vit.webp" alt="" width="2000" height="816">
        </a>
        <button class="site-menu-close" type="button" aria-label="Stäng menyn">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      ${backItem}
      <nav aria-label="Huvudmeny"><ul class="site-menu-list">${items}</ul></nav>
      <div class="site-menu-contact">
        <a class="btn" href="${phone.href}">Ring ${phone.label}</a>
        <a class="btn btn--ghost" href="mailto:${mail}" aria-label="Mejla ${mail}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3zM3 6l9 7 9-7"/></svg>
        </a>
      </div>
    </div>`);

  const menu = document.getElementById("site-menu");
  const toggle = header.querySelector(".header-menu-toggle");
  const close = menu.querySelector(".site-menu-close");

  function openMenu() {
    // project.js sätter tillbaka-länken först när projektet har laddats
    const menuBack = menu.querySelector(".site-menu-back");
    if (back && menuBack) menuBack.href = back.href;
    menu.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("site-menu-open");
    close.focus();
  }

  function closeMenu({ restoreFocus = true } = {}) {
    if (menu.hidden) return;
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("site-menu-open");
    if (restoreFocus) toggle.focus();
  }

  applyTheme(currentTheme());
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".theme-toggle");
    if (!button) return;
    switchTheme(button.dataset.target, button);
  });

  toggle.addEventListener("click", openMenu);
  close.addEventListener("click", () => closeMenu());
  // En länk stänger menyn. Pekar den på en sektion på samma sida scrollar
  // vi dit efter att sidan låsts upp (annars hinner webbläsaren inte scrolla).
  menu.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    closeMenu({ restoreFocus: false });
    const url = new URL(link.href, location.href);
    const target = url.pathname === location.pathname && url.hash ? document.querySelector(url.hash) : null;
    if (!target) return;
    event.preventDefault();
    history.pushState(null, "", url.hash);
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  // Vrids telefonen till liggande försvinner menyknappen: stäng menyn
  window.matchMedia("(orientation: landscape)").addEventListener("change", (event) => {
    if (event.matches) closeMenu({ restoreFocus: false });
  });

  /* ---------- Snabbare byte mellan sidorna ----------
     Edge och Chrome bygger nästa sida färdigt i bakgrunden när man håller
     muspekaren över (eller börjar trycka på) en länk. Alla webbläsare får
     dessutom de andra sidorna och deras toppbilder hämtade i förväg när
     sidan har laddat klart. */
  if (HTMLScriptElement.supports?.("speculationrules")) {
    const rules = document.createElement("script");
    rules.type = "speculationrules";
    rules.textContent = JSON.stringify({
      prerender: [{ where: { href_matches: "/*" }, eagerness: "moderate" }]
    });
    document.head.appendChild(rules);
  }

  const warmPages = onHomePage
    ? services.map(([id]) => `${base}tjanster/${id}.html`)
    : [`${base}index.html`];
  const warmUp = () => {
    warmPages.forEach((page) => {
      fetch(page).then((response) => response.ok ? response.text() : "").then((html) => {
        if (!html) return;
        const doc = new DOMParser().parseFromString(html, "text/html");
        doc.querySelectorAll('link[rel="stylesheet"][href$=".css"]').forEach((link) => {
          fetch(new URL(link.getAttribute("href"), new URL(page, location.href)).href).catch(() => {});
        });
        const hero = doc.querySelector(".service-image-hero img, .hero-image img");
        if (hero) new Image().src = new URL(hero.getAttribute("src"), new URL(page, location.href)).href;
      }).catch(() => {});
    });
  };
  const whenIdle = window.requestIdleCallback || ((callback) => setTimeout(callback, 1200));
  if (document.readyState === "complete") whenIdle(warmUp);
  else window.addEventListener("load", () => whenIdle(warmUp), { once: true });
})();
