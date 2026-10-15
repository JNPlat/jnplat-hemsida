(async function () {
  const { serviceLabel, escapeHTML, escapeAttribute } = window.JNPlSite;
  const serviceId = document.body.dataset.service;
  const list = document.querySelector('[data-project-list]');
  if (!list || !serviceId) return;

  const galleryModal = createGalleryModal();
  let activeProject = null;
  let activeImages = [];
  let imageIndex = 0;
  let previousFocus = null;
  let touchStartX = 0;

  try {
    const response = await fetch('../data/projects.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Kunde inte läsa projektlistan');
    const projects = await response.json();
    // Visa endast publicerade projekt som tillhör just den aktuella tjänsten.
    const visibleProjects = projects.filter(project => project.published !== false && project.service === serviceId);

    if (!visibleProjects.length) {
      list.innerHTML = '<p class="empty-projects">Nya projekt och referenser publiceras här löpande.</p>';
      return;
    }

    list.innerHTML = visibleProjects.map((project, index) => {
      const image = project.cardImage || project.hero || (project.gallery && project.gallery[0]);
      const imageMarkup = image
        ? `<img src="../${escapeAttribute(image)}" alt="${escapeAttribute(project.title)}" loading="lazy">`
        : '';
      return `<button class="project-card" type="button" data-project-index="${index}" aria-label="Öppna bildgalleri för ${escapeAttribute(project.title)}">` +
        `<div class="project-card-image">${imageMarkup}<span class="project-card-title">${escapeHTML(project.title)}</span><span class="project-card-open">Visa bilder ↗</span></div>` +
        `<span class="project-card-info"></span></button>`;
    }).join('');

    list.querySelectorAll('[data-project-index]').forEach(button => {
      button.addEventListener('click', () => openProjectGallery(visibleProjects[Number(button.dataset.projectIndex)], button));
    });

    const previous = document.querySelector('.project-carousel-prev');
    const next = document.querySelector('.project-carousel-next');
    const scrollByCard = direction => {
      const card = list.querySelector('.project-card');
      if (!card) return;
      const gap = parseFloat(getComputedStyle(list).columnGap || getComputedStyle(list).gap) || 14;
      const step = card.getBoundingClientRect().width + gap;
      const maxScroll = Math.max(0, list.scrollWidth - list.clientWidth);
      const atStart = list.scrollLeft <= 2;
      const atEnd = list.scrollLeft >= maxScroll - 2;
      // Wrap seamlessly: the last visible position continues to the first, and vice versa.
      if (direction > 0 && atEnd) {
        list.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (direction < 0 && atStart) {
        list.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        list.scrollBy({ left: direction * step, behavior: 'smooth' });
      }
    };
    previous?.addEventListener('click', () => scrollByCard(-1));
    next?.addEventListener('click', () => scrollByCard(1));
  } catch (error) {
    list.innerHTML = '<p class="empty-projects">Projektlistan kunde inte laddas just nu.</p>';
  }

  function createGalleryModal() {
    const modal = document.createElement('div');
    modal.className = 'project-gallery-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Projektgalleri');
    modal.innerHTML = `<div class="project-gallery-backdrop" data-gallery-close></div><div class="project-gallery-dialog"><div class="project-gallery-top"><div><p class="eyebrow" data-gallery-service></p><h2 data-gallery-title></h2></div><button class="project-gallery-close" type="button" aria-label="Stäng galleri">×</button></div><div class="project-gallery-stage"><button class="project-gallery-arrow project-gallery-prev" type="button" aria-label="Föregående bild">‹</button><img class="project-gallery-main-image" alt=""><button class="project-gallery-arrow project-gallery-next" type="button" aria-label="Nästa bild">›</button></div><div class="project-gallery-bottom"><p class="project-gallery-description"></p><span class="project-gallery-count" aria-live="polite"></span></div><div class="project-gallery-thumbnails" aria-label="Alla projektbilder"></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('.project-gallery-close').addEventListener('click', closeGallery);
    modal.querySelector('[data-gallery-close]').addEventListener('click', closeGallery);
    modal.querySelector('.project-gallery-main-image').addEventListener('click', openDesktopImageZoom);
    modal.querySelector('.project-gallery-prev').addEventListener('click', () => showImage(imageIndex - 1));
    modal.querySelector('.project-gallery-next').addEventListener('click', () => showImage(imageIndex + 1));
    modal.querySelector('.project-gallery-thumbnails').addEventListener('click', event => {
      const thumb = event.target.closest('[data-thumb-index]');
      if (thumb) showImage(Number(thumb.dataset.thumbIndex));
    });
    modal.querySelector('.project-gallery-stage').addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
    modal.querySelector('.project-gallery-stage').addEventListener('touchend', event => {
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 45) showImage(imageIndex + (delta < 0 ? 1 : -1));
    }, { passive: true });
    return modal;
  }

  function openProjectGallery(project, trigger) {
    activeProject = project;
    previousFocus = trigger || document.activeElement;
    const hero = project.hero || project.cardImage || '';
    activeImages = [...new Set([...(hero ? [hero] : []), ...((project.gallery || []).filter(Boolean))])];
    if (!activeImages.length) return;
    imageIndex = 0;
    galleryModal.querySelector('[data-gallery-service]').textContent = serviceLabel(project.service);
    galleryModal.querySelector('[data-gallery-title]').textContent = project.title;
    galleryModal.querySelector('.project-gallery-description').textContent = project.description || '';
    galleryModal.querySelector('.project-gallery-thumbnails').innerHTML = activeImages.map((src, i) => `<button type="button" data-thumb-index="${i}" aria-label="Visa bild ${i + 1}"><img src="../${escapeAttribute(src)}" alt="" loading="lazy"></button>`).join('');
    galleryModal.hidden = false;
    document.body.classList.add('project-gallery-open');
    showImage(0);
    galleryModal.querySelector('.project-gallery-close').focus();
  }

  function showImage(index) {
    if (!activeImages.length) return;
    imageIndex = (index + activeImages.length) % activeImages.length;
    const img = galleryModal.querySelector('.project-gallery-main-image');
    img.src = `../${activeImages[imageIndex]}`;
    img.alt = `${activeProject?.title || 'Projekt'} – bild ${imageIndex + 1}`;
    const zoom = galleryModal.querySelector('.project-image-zoom');
    if (zoom && !zoom.hidden) {
      const zoomImage = zoom.querySelector('.project-image-zoom-img');
      zoomImage.src = `../${activeImages[imageIndex]}`;
      zoomImage.alt = img.alt;
    }
    galleryModal.querySelector('.project-gallery-count').textContent = `${imageIndex + 1} / ${activeImages.length}`;
    const thumbnails = galleryModal.querySelector('.project-gallery-thumbnails');
    const thumbButtons = galleryModal.querySelectorAll('[data-thumb-index]');
    thumbButtons.forEach((button, i) => {
      const isActive = i === imageIndex;
      button.classList.toggle('active', isActive);
      if (isActive) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });

    // Keep the selected thumbnail visible as the user advances through the gallery,
    // especially on mobile where only a few thumbnails fit across the screen.
    const activeThumb = thumbnails?.querySelector('[data-thumb-index="' + imageIndex + '"]');
    if (thumbnails && activeThumb) {
      const thumbLeft = activeThumb.offsetLeft - thumbnails.offsetLeft;
      const thumbRight = thumbLeft + activeThumb.offsetWidth;
      const visibleLeft = thumbnails.scrollLeft;
      const visibleRight = visibleLeft + thumbnails.clientWidth;
      if (thumbLeft < visibleLeft) {
        thumbnails.scrollTo({ left: Math.max(0, thumbLeft - 8), behavior: 'smooth' });
      } else if (thumbRight > visibleRight) {
        thumbnails.scrollTo({ left: thumbRight - thumbnails.clientWidth + 8, behavior: 'smooth' });
      }
    }
    galleryModal.querySelector('.project-gallery-prev').hidden = activeImages.length < 2;
    galleryModal.querySelector('.project-gallery-next').hidden = activeImages.length < 2;
  }

  function openDesktopImageZoom() {
    // Enlarged image view is desktop-only; touch devices retain their native pinch zoom.
    if (window.matchMedia('(max-width: 600px), (hover: none)').matches) return;
    let zoom = galleryModal.querySelector('.project-image-zoom');
    if (!zoom) {
      zoom = document.createElement('div');
      zoom.className = 'project-image-zoom';
      zoom.hidden = true;
      zoom.innerHTML = '<button class="project-image-zoom-close" type="button" aria-label="Stäng förstorad bild">×</button><button class="project-image-zoom-prev" type="button" aria-label="Föregående bild">‹</button><img class="project-image-zoom-img" alt=""><button class="project-image-zoom-next" type="button" aria-label="Nästa bild">›</button>';
      galleryModal.appendChild(zoom);
      zoom.querySelector('.project-image-zoom-close').addEventListener('click', closeDesktopImageZoom);
      zoom.querySelector('.project-image-zoom-prev').addEventListener('click', event => { event.stopPropagation(); showImage(imageIndex - 1); });
      zoom.querySelector('.project-image-zoom-next').addEventListener('click', event => { event.stopPropagation(); showImage(imageIndex + 1); });
      zoom.addEventListener('click', event => {
        if (event.target === zoom) closeDesktopImageZoom();
      });
    }
    const zoomImage = zoom.querySelector('.project-image-zoom-img');
    zoomImage.src = `../${activeImages[imageIndex]}`;
    zoomImage.alt = `${activeProject?.title || 'Projekt'} – bild ${imageIndex + 1}`;
    zoom.hidden = false;
    zoom.querySelector('.project-image-zoom-close').focus();
  }

  function closeDesktopImageZoom() {
    const zoom = galleryModal.querySelector('.project-image-zoom');
    if (zoom) zoom.hidden = true;
    galleryModal.querySelector('.project-gallery-main-image')?.focus();
  }

  function closeGallery() {
    const zoom = galleryModal.querySelector('.project-image-zoom');
    if (zoom && !zoom.hidden) {
      zoom.hidden = true;
      return;
    }
    galleryModal.hidden = true;
    document.body.classList.remove('project-gallery-open');
    if (previousFocus && previousFocus.focus) previousFocus.focus();
  }
  document.addEventListener('keydown', event => {
    if (galleryModal.hidden) return;
    const zoom = galleryModal.querySelector('.project-image-zoom');
    if (zoom && !zoom.hidden) {
      if (event.key === 'Escape') closeDesktopImageZoom();
      if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(imageIndex - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); showImage(imageIndex + 1); }
      return;
    }
    if (event.key === 'Escape') closeGallery();
    if (event.key === 'ArrowLeft') showImage(imageIndex - 1);
    if (event.key === 'ArrowRight') showImage(imageIndex + 1);
  });


})();
