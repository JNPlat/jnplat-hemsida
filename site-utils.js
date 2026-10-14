/* Shared site helpers. Keep labels and HTML escaping in one place. */
(() => {
  const serviceLabels = Object.freeze({
    byggnadsplatslageri: "Byggnadsplåtslageri",
    kopparslageri: "Kopparslageri",
    restaurering: "Restaurering",
    specialprojekt: "Specialprojekt"
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
    serviceLabel: (id) => serviceLabels[id] || "Projekt",
    escapeHTML,
    escapeAttribute: escapeHTML
  });
})();
