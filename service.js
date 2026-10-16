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
  let projectZoomScale = 1;
  let projectZoomX = 0;
  let projectZoomY = 0;
  let projectZoomDragging = false;
  let projectZoomDragStartX = 0;
  let projectZoomDragStartY = 0;
  let projectZoomDragOriginX = 0;
  let projectZoomDragOriginY = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartCount = 0;
  let touchMoved = false;

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
        `<span class="project-card-info"><span class="project-card-info-title">${escapeHTML(project.title)}</span><span class="project-card-info-description">${escapeHTML(project.description || '')}</span><span class="project-card-info-link">Visa projektbilder ↗</span></span></button>`;
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

    const updateProjectCarouselArrows = () => {
      const hasOverflow = list.scrollWidth > list.clientWidth + 2;
      const container = list.closest('.service-projects');
      container?.classList.toggle('has-project-overflow', hasOverflow);
      [previous, next].forEach(button => {
        if (!button) return;
        button.hidden = !hasOverflow;
        button.setAttribute('aria-hidden', String(!hasOverflow));
        button.tabIndex = hasOverflow ? 0 : -1;
      });
    };
    updateProjectCarouselArrows();
    window.addEventListener('resize', updateProjectCarouselArrows);
    list.addEventListener('scroll', updateProjectCarouselArrows, { passive: true });
    window.addEventListener('load', updateProjectCarouselArrows);
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
    const stage = modal.querySelector('.project-gallery-stage');
    stage.addEventListener('touchstart', event => {
      touchStartCount = event.touches.length;
      touchMoved = false;
      if (touchStartCount !== 1) return; // Never interpret a pinch as gallery navigation.
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchmove', event => {
      if (touchStartCount !== 1 || event.touches.length !== 1) {
        touchMoved = true;
        return;
      }
      const dx = Math.abs(event.touches[0].clientX - touchStartX);
      const dy = Math.abs(event.touches[0].clientY - touchStartY);
      if (dx > 10 || dy > 10) touchMoved = true;
    }, { passive: true });
    stage.addEventListener('touchend', event => {
      if (touchStartCount !== 1 || event.changedTouches.length !== 1 || !touchMoved) {
        touchStartCount = 0;
        touchMoved = false;
        return;
      }
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.35) {
        showImage(imageIndex + (dx < 0 ? 1 : -1));
      }
      touchStartCount = 0;
      touchMoved = false;
    }, { passive: true });
    stage.addEventListener('touchcancel', () => {
      touchStartCount = 0;
      touchMoved = false;
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
    if (isDesktopImageViewer()) {
      galleryModal.querySelector('.project-gallery-dialog').classList.add('project-gallery-dialog-under-viewer');
      openDesktopImageZoom();
    } else {
      galleryModal.querySelector('.project-gallery-dialog').classList.remove('project-gallery-dialog-under-viewer');
      galleryModal.querySelector('.project-gallery-close').focus();
    }
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
      resetProjectImageTransform(zoomImage);
      const zoomCount = zoom.querySelector('.project-image-zoom-count');
      if (zoomCount) zoomCount.textContent = `${imageIndex + 1} / ${activeImages.length}`;
      const zoomThumbs = zoom.querySelector('.project-image-zoom-thumbnails');
      zoomThumbs?.querySelectorAll('[data-zoom-thumb-index]').forEach((button, i) => {
        button.classList.toggle('active', i === imageIndex);
        if (i === imageIndex) button.setAttribute('aria-current', 'true'); else button.removeAttribute('aria-current');
      });
      const activeZoomThumb = zoomThumbs?.querySelector(`[data-zoom-thumb-index="${imageIndex}"]`);
      activeZoomThumb?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      const prev = zoom.querySelector('.project-image-zoom-prev');
      const next = zoom.querySelector('.project-image-zoom-next');
      if (prev) prev.hidden = activeImages.length < 2;
      if (next) next.hidden = activeImages.length < 2;
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

  function isDesktopImageViewer() {
    return !window.matchMedia('(max-width: 600px), (hover: none)').matches;
  }

  function openDesktopImageZoom() {
    // Desktop opens directly into the enlarged viewer; touch devices keep the mobile gallery.
    if (!isDesktopImageViewer()) return;
    let zoom = galleryModal.querySelector('.project-image-zoom');
    if (!zoom) {
      zoom = document.createElement('div');
      zoom.className = 'project-image-zoom';
      zoom.hidden = true;
      zoom.innerHTML = '<button class="project-image-zoom-close" type="button" aria-label="Stäng bildvisning">×</button><button class="project-image-zoom-prev" type="button" aria-label="Föregående bild">‹</button><img class="project-image-zoom-img" alt=""><button class="project-image-zoom-next" type="button" aria-label="Nästa bild">›</button><div class="project-image-zoom-bottom"><div class="project-image-zoom-thumbnails" aria-label="Välj projektbild"></div><span class="project-image-zoom-count" aria-live="polite"></span></div>';
      galleryModal.appendChild(zoom);
      zoom.querySelector('.project-image-zoom-close').addEventListener('click', closeGallery);
      const zoomImage = zoom.querySelector('.project-image-zoom-img');
      let projectZoomWasDragged = false;
      zoomImage.addEventListener('click', event => {
        if (projectZoomWasDragged) {
          projectZoomWasDragged = false;
          event.preventDefault();
          return;
        }
        if (projectZoomScale > 1) {
          resetProjectImageTransform(zoomImage);
        } else {
          projectZoomScale = 2;
          projectZoomX = 0;
          projectZoomY = 0;
          applyProjectImageTransform(zoomImage);
        }
      });
      zoomImage.addEventListener('wheel', event => {
        if (!event.ctrlKey) return;
        event.preventDefault();
        projectZoomScale = Math.max(1, Math.min(5, projectZoomScale * (event.deltaY < 0 ? 1.15 : 1 / 1.15)));
        if (projectZoomScale === 1) { projectZoomX = 0; projectZoomY = 0; }
        applyProjectImageTransform(zoomImage);
      }, { passive: false });
      zoomImage.addEventListener('pointerdown', event => {
        if (projectZoomScale <= 1 || event.button !== 0) return;
        projectZoomDragging = true;
        projectZoomDragStartX = event.clientX;
        projectZoomDragStartY = event.clientY;
        projectZoomDragOriginX = projectZoomX;
        projectZoomDragOriginY = projectZoomY;
        zoomImage.classList.add('is-dragging');
        zoomImage.setPointerCapture(event.pointerId);
        event.preventDefault();
      });
      zoomImage.addEventListener('pointermove', event => {
        if (!projectZoomDragging) return;
        if (Math.abs(event.clientX - projectZoomDragStartX) > 3 || Math.abs(event.clientY - projectZoomDragStartY) > 3) {
          projectZoomWasDragged = true;
        }
        projectZoomX = projectZoomDragOriginX + event.clientX - projectZoomDragStartX;
        projectZoomY = projectZoomDragOriginY + event.clientY - projectZoomDragStartY;
        applyProjectImageTransform(zoomImage);
      });
      const stopProjectImageDrag = () => { projectZoomDragging = false; zoomImage.classList.remove('is-dragging'); };
      zoomImage.addEventListener('pointerup', stopProjectImageDrag);
      zoomImage.addEventListener('pointercancel', stopProjectImageDrag);
      zoom.querySelector('.project-image-zoom-prev').addEventListener('click', event => { event.stopPropagation(); showImage(imageIndex - 1); });
      zoom.querySelector('.project-image-zoom-next').addEventListener('click', event => { event.stopPropagation(); showImage(imageIndex + 1); });
      zoom.querySelector('.project-image-zoom-thumbnails').addEventListener('click', event => {
        const thumb = event.target.closest('[data-zoom-thumb-index]');
        if (thumb) showImage(Number(thumb.dataset.zoomThumbIndex));
      });
      zoom.addEventListener('click', event => {
        if (event.target === zoom) closeDesktopImageZoom();
      });
    }
    const zoomThumbs = zoom.querySelector('.project-image-zoom-thumbnails');
    if (zoomThumbs.dataset.projectTitle !== (activeProject?.title || '')) {
      zoomThumbs.dataset.projectTitle = activeProject?.title || '';
      zoomThumbs.innerHTML = activeImages.map((src, i) => `<button type="button" data-zoom-thumb-index="${i}" aria-label="Visa bild ${i + 1}"><img src="../${escapeAttribute(src)}" alt="" loading="lazy"></button>`).join('');
    }
    const zoomImage = zoom.querySelector('.project-image-zoom-img');
    zoomImage.src = `../${activeImages[imageIndex]}`;
    zoomImage.alt = `${activeProject?.title || 'Projekt'} – bild ${imageIndex + 1}`;
    resetProjectImageTransform(zoomImage);
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
    if (zoom) zoom.hidden = true;
    galleryModal.hidden = true;
    galleryModal.querySelector('.project-gallery-dialog')?.classList.remove('project-gallery-dialog-under-viewer');
    document.body.classList.remove('project-gallery-open');
    if (previousFocus && previousFocus.focus) previousFocus.focus();
  }
  document.addEventListener('keydown', event => {
    if (galleryModal.hidden) return;
    const zoom = galleryModal.querySelector('.project-image-zoom');
    if (zoom && !zoom.hidden) {
      if (event.key === 'Escape') closeGallery();
      if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(imageIndex - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); showImage(imageIndex + 1); }
      return;
    }
    if (event.key === 'Escape') closeGallery();
    if (event.key === 'ArrowLeft') showImage(imageIndex - 1);
    if (event.key === 'ArrowRight') showImage(imageIndex + 1);
  });


  // Zoom and pan are intentionally limited to the enlarged project-gallery image.
  function applyProjectImageTransform(img) {
    img.style.transform = `translate(${projectZoomX}px, ${projectZoomY}px) scale(${projectZoomScale})`;
    img.style.cursor = projectZoomScale > 1 ? (projectZoomDragging ? 'grabbing' : 'grab') : 'zoom-in';
  }
  function resetProjectImageTransform(img) {
    projectZoomScale = 1;
    projectZoomX = 0;
    projectZoomY = 0;
    projectZoomDragging = false;
    img.style.transform = 'translate(0px, 0px) scale(1)';
    img.style.cursor = 'zoom-in';
    img.classList.remove('is-dragging');
  }

})();
