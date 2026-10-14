(async function () {
  const { serviceLabel, escapeHTML, escapeAttribute } = window.JNPlSite;
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');
  const content = document.getElementById('project-content');
  const backLink = document.getElementById('back-to-service');
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImage = lightbox.querySelector('img');
  const caption = lightbox.querySelector('.lightbox-caption');
  let gallery = [];
  let currentImage = 0;
  let previousFocus = null;

  const servicePages = {
    byggnadsplatslageri: 'tjanster/byggnadsplatslageri.html',
    kopparslageri: 'tjanster/kopparslageri.html',
    restaurering: 'tjanster/restaurering.html',
    specialprojekt: 'tjanster/specialprojekt.html'
  };

  try {
    const response = await fetch('data/projects.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Kunde inte läsa projektlistan');
    const projects = await response.json();
    const project = projects.find(item => item.id === projectId && item.published !== false);
    if (!project) return;

    const serviceUrl = servicePages[project.service] || 'index.html#tjanster';
    backLink.href = serviceUrl;
    document.querySelectorAll('[data-service-link]').forEach(link => {
      const active = link.dataset.serviceLink === project.service;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.title = `${project.title} | J. Norberg Plåtslageri AB`;

    const hero = project.hero || (project.gallery && project.gallery[0]) || '';
    gallery = (project.gallery || []).filter(Boolean);
    if (hero && !gallery.includes(hero)) gallery.unshift(hero);
    const heroMarkup = hero ? `<img src="${escapeAttribute(hero)}" alt="${escapeAttribute(project.title)}" fetchpriority="high">` : '';
    const galleryMarkup = gallery.map((src, index) => `<button class="gallery-image" type="button" data-image-index="${index}" aria-label="Visa bild ${index + 1} i full storlek"><img src="${escapeAttribute(src)}" alt="${escapeAttribute(project.title)} – bild ${index + 1}" loading="lazy"></button>`).join('');

    content.innerHTML = `<section class="detail-hero project-hero">${heroMarkup}<div class="detail-hero-shade"></div><div class="detail-hero-title"><p class="eyebrow">${escapeHTML(serviceLabel(project.service))}</p><h1>${escapeHTML(project.title)}</h1></div></section><section class="project-description content-width">${project.description ? `<p class="intro-lead">${escapeHTML(project.description)}</p>` : ''}${project.longDescription ? `<div class="project-long-description">${escapeHTML(project.longDescription).replace(/\n/g, '<br>')}</div>` : ''}</section>${gallery.length ? `<section class="project-gallery-section content-width"><div class="section-heading"><p class="eyebrow">BILDER FRÅN PROJEKTET</p><h2>Detaljer och utförande</h2></div><div class="project-gallery">${galleryMarkup}</div></section>` : ''}`;
    content.querySelectorAll('[data-image-index]').forEach(button => button.addEventListener('click', () => openLightbox(Number(button.dataset.imageIndex), button)));
  } catch (error) {
    // The HTML fallback remains visible if the project data cannot be loaded.
  }



  function openLightbox(index, focusTarget) {
    if (!gallery.length) return;
    currentImage = index;
    previousFocus = focusTarget || document.activeElement;
    showImage();
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    lightbox.querySelector('.lightbox-close').focus();
  }
  function showImage() {
    const src = gallery[currentImage];
    lightboxImage.src = src;
    lightboxImage.alt = `Projektbild ${currentImage + 1}`;
    caption.textContent = `${currentImage + 1} / ${gallery.length}`;
    lightbox.querySelector('.lightbox-prev').hidden = gallery.length < 2;
    lightbox.querySelector('.lightbox-next').hidden = gallery.length < 2;
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
    if (previousFocus && previousFocus.focus) previousFocus.focus();
  }
  function moveImage(direction) {
    currentImage = (currentImage + direction + gallery.length) % gallery.length;
    showImage();
  }
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => moveImage(-1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => moveImage(1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveImage(-1);
    if (event.key === 'ArrowRight') moveImage(1);
  });
})();
