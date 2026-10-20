/* Shared site helpers. Keep labels and HTML escaping in one place. */
(() => {
  const services = Object.freeze({
    byggnadsplatslageri: Object.freeze({
      label: "Byggnadsplåtslageri",
      path: "tjanster/byggnadsplatslageri.html"
    }),
    kopparslageri: Object.freeze({
      label: "Kopparslageri",
      path: "tjanster/kopparslageri.html"
    }),
    restaurering: Object.freeze({
      label: "Restaurering",
      path: "tjanster/restaurering.html"
    }),
    specialprojekt: Object.freeze({
      label: "Specialprojekt",
      path: "tjanster/specialprojekt.html"
    })
  });

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  // Projektets bilder i ordning; den första är projektkortets bild.
  // Äldre fält (hero, cardImage, gallery) läses också. Inledande / tas bort
  // eftersom sökvägarna används både från roten och från tjanster/.
  function projectImages(project) {
    const list = Array.isArray(project?.images)
      ? project.images
      : [project?.hero, project?.cardImage, ...(Array.isArray(project?.gallery) ? project.gallery : [])];
    return [...new Set(list
      .map((src) => (typeof src === "string" ? src.trim().replace(/^\/+/, "") : ""))
      .filter(Boolean))];
  }

  window.JNPlSite = Object.freeze({
    projectImages,
    serviceLabel: (id) => services[id]?.label || "Projekt",
    servicePath: (id) => services[id]?.path || "index.html#tjanster",
    serviceIds: Object.freeze(Object.keys(services)),
    escapeHTML,
    escapeAttribute: escapeHTML
  });

  // Mobilmenyn: svep fram den aktiva sidan så att den inte döljs bakom Kontakt.
  document.addEventListener("DOMContentLoaded", () => {
    const active = document.querySelector(".main-nav .nav-link.active");
    const nav = active?.closest(".main-nav");
    if (!nav || nav.scrollWidth <= nav.clientWidth) return;
    const offset = active.getBoundingClientRect().left - nav.getBoundingClientRect().left;
    nav.scrollLeft = Math.max(0, nav.scrollLeft + offset - nav.clientWidth / 3);
  });
})();
