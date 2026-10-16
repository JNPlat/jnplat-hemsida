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

  window.JNPlSite = Object.freeze({
    serviceLabel: (id) => services[id]?.label || "Projekt",
    servicePath: (id) => services[id]?.path || "index.html#tjanster",
    escapeHTML,
    escapeAttribute: escapeHTML
  });
})();
