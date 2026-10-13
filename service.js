(async function () {
  const serviceId = document.body.dataset.service;
  const list = document.querySelector('[data-project-list]');
  if (!list || !serviceId) return;

  try {
    const response = await fetch('../data/projects.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Kunde inte läsa projektlistan');
    const projects = await response.json();
    const visibleProjects = projects.filter(project => project.published !== false && project.service === serviceId);

    if (!visibleProjects.length) {
      list.innerHTML = '<p class="empty-projects">Nya projekt och referenser publiceras här löpande.</p>';
      return;
    }

    list.innerHTML = visibleProjects.map(project => {
      const image = project.cardImage || project.hero || (project.gallery && project.gallery[0]);
      const imageMarkup = image
        ? `<img src="../${escapeAttribute(image)}" alt="${escapeAttribute(project.title)}" loading="lazy">`
        : '';
      return `<a class="project-card" href="../projekt.html?id=${encodeURIComponent(project.id)}">` +
        `<div class="project-card-image">${imageMarkup}</div>` +
        `<div class="project-card-info"><h3>${escapeHTML(project.title)}</h3><p>${escapeHTML(project.description || '')}</p><span class="text-link">Se projektet <span>→</span></span></div></a>`;
    }).join('');
  } catch (error) {
    list.innerHTML = '<p class="empty-projects">Projektlistan kunde inte laddas just nu.</p>';
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }
  function escapeAttribute(value) { return escapeHTML(value); }
})();
