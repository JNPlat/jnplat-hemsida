(async function () {
  const { serviceLabel, escapeHTML, escapeAttribute, projectImages } = window.JNPlSite;
  const serviceIds = window.JNPlSite.serviceIds;
  let serviceId = document.body.dataset.service;
  if (!document.querySelector('[data-project-list]') || !serviceId) return;

  // Tjänstesidans innehåll som det ser ut i HTML-filen, innan något lagts till.
  // Används när man byter tillbaka till den här tjänsten.
  const initialPage = snapshotPage(document);

  const galleryModal = createGalleryModal();
  let activeProject = null;
  let activeImages = [];
  let imageIndex = 0;
  let previousFocus = null;
  let projectZoomScale = 1;
  // Mjuk scroll bara när besökaren inte valt minskad rörelse
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = () => reducedMotion() ? 'auto' : 'smooth';
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

  // Projektlistan hämtas en gång och delas av alla tjänster
  let projects = null;
  try {
    const response = await fetch('../data/projects.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Kunde inte läsa projektlistan');
    projects = await response.json();
  } catch (error) {
    projects = null;
  }

  /* ---------- Alla tjänster på en sida ----------
     Byte mellan tjänster (svep, pilar, prickar, flikar och menyn) byter bara
     innehållet på plats. Adressen uppdateras så att bakåtknappen och länkar
     fungerar, och varje tjänst finns kvar som egen HTML-fil. De andra
     tjänsterna och deras bilder laddas i bakgrunden direkt. */
  const pages = new Map([[serviceId, Promise.resolve(initialPage)]]);
  let switching = false;

  function snapshotPage(doc) {
    return {
      title: doc.title,
      description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      showcase: doc.querySelector('.service-showcase')?.outerHTML || ''
    };
  }

  function loadPage(id) {
    if (!pages.has(id)) {
      const request = fetch(`${id}.html`)
        .then(response => {
          if (!response.ok) throw new Error('Kunde inte läsa tjänstesidan');
          return response.text();
        })
        .then(html => snapshotPage(new DOMParser().parseFromString(html, 'text/html')))
        .catch(error => {
          pages.delete(id);
          throw error;
        });
      pages.set(id, request);
    }
    return pages.get(id);
  }

  function preloadImage(src) {
    if (src) new Image().src = new URL(src, location.href).href;
  }

  function preloadOtherServices() {
    serviceIds.filter(id => id !== serviceId).forEach(id => {
      loadPage(id).then(page => {
        const template = document.createElement('template');
        template.innerHTML = page.showcase;
        template.content.querySelectorAll('img').forEach(img => preloadImage(img.getAttribute('src')));
      }).catch(() => {});
      (projects || [])
        .filter(project => project.published !== false && project.service === id)
        .forEach(project => { const first = projectImages(project)[0]; if (first) preloadImage(`../${first}`); });
    });
  }

  async function goToService(id, { push = true } = {}) {
    if (id === serviceId || switching || !serviceIds.includes(id)) return;
    switching = true;
    let page;
    try {
      page = await loadPage(id);
    } catch (error) {
      window.location.href = `${id}.html`;
      return;
    }

    // Åt vilket håll ligger den nya tjänsten (kortaste vägen runt)?
    const count = serviceIds.length;
    const steps = (serviceIds.indexOf(id) - serviceIds.indexOf(serviceId) + count) % count;
    const fromRight = steps <= count / 2;

    const template = document.createElement('template');
    template.innerHTML = page.showcase;
    const fresh = template.content.firstElementChild;
    const old = document.querySelector('.service-showcase');
    if (!reducedMotion()) fresh.classList.add('service-enter', fromRight ? 'service-enter-right' : 'service-enter-left');
    old.replaceWith(fresh);

    serviceId = id;
    document.body.dataset.service = id;
    document.title = page.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', page.description);
    document.querySelectorAll('.main-nav [data-service-link]').forEach(link => {
      const active = link.dataset.serviceLink === id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.querySelectorAll('.site-menu-sub a').forEach(link => {
      if (link.pathname.endsWith(`/${id}.html`)) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (push) history.pushState({ service: id }, '', `${id}.html`);
    window.scrollTo({ top: 0, behavior: 'instant' });

    enhanceShowcase();
    // Läs av layouten med startläget innan det tas bort, så att övergången
    // spelas upp (fungerar även i en flik som ligger i bakgrunden)
    void fresh.offsetWidth;
    fresh.classList.remove('service-enter', 'service-enter-right', 'service-enter-left');
    switching = false;
  }

  // Länkar till en annan tjänst byter innehållet i stället för att ladda om
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank') return;
    const url = new URL(link.href, location.href);
    const match = url.origin === location.origin && url.pathname.match(/\/tjanster\/([a-z]+)\.html$/);
    if (!match || !serviceIds.includes(match[1])) return;
    event.preventDefault();
    goToService(match[1]);
  });

  history.replaceState({ service: serviceId }, '');
  window.addEventListener('popstate', () => {
    const match = location.pathname.match(/\/tjanster\/([a-z]+)\.html$/);
    if (match && serviceIds.includes(match[1])) goToService(match[1], { push: false });
  });

  // Svep åt vänster eller höger på sidan för att gå till nästa eller föregående tjänst.
  // Svep i projektkarusellen, menyn och bildvisningen räknas inte.
  let swipeStart = null;
  document.addEventListener('touchstart', event => {
    const ignored = event.target.closest('.project-carousel, .project-gallery-modal, .project-image-zoom, .main-nav, .site-menu');
    swipeStart = event.touches.length === 1 && !ignored
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
      : null;
  }, { passive: true });
  document.addEventListener('touchend', event => {
    if (!swipeStart || document.body.classList.contains('project-gallery-open')) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - swipeStart.x;
    const dy = touch.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const index = serviceIds.indexOf(serviceId);
    if (index < 0) return;
    const step = dx < 0 ? 1 : -1;
    goToService(serviceIds[(index + step + serviceIds.length) % serviceIds.length]);
  }, { passive: true });

  // Sidan ska rymmas på en skärm. Får inte allt plats döljs överrubrik
  // och ingress (.is-compact), men bara på de sidor där det behövs.
  // Ryms det inte ens då får sidan växa (.is-tall) i stället för att
  // kontaktraden hamnar ovanpå sidfoten.
  function fitShowcase() {
    const showcase = document.querySelector('.service-showcase');
    const copy = showcase?.querySelector('.service-copy');
    if (!showcase || !copy) return;
    // Kontaktraden ska sluta ovanför den extra bakgrunden längst ned
    const overflows = () => {
      const contentBottom = showcase.getBoundingClientRect().bottom - parseFloat(getComputedStyle(showcase).paddingBottom);
      const last = showcase.lastElementChild.getBoundingClientRect().bottom;
      return last > contentBottom + 1 || copy.scrollHeight > copy.clientHeight + 1;
    };
    showcase.classList.remove('is-compact', 'is-tall');
    showcase.classList.toggle('is-compact', overflows());
    showcase.classList.toggle('is-tall', overflows());
  }

  function updateProjectCarouselArrows() {
    const list = document.querySelector('[data-project-list]');
    if (!list) return;
    const hasOverflow = list.scrollWidth > list.clientWidth + 2;
    list.closest('.service-projects')?.classList.toggle('has-project-overflow', hasOverflow);
    document.querySelectorAll('.project-carousel-prev, .project-carousel-next').forEach(button => {
      button.hidden = !hasOverflow;
      button.setAttribute('aria-hidden', String(!hasOverflow));
      button.tabIndex = hasOverflow ? 0 : -1;
    });
  }

  function renderProjects(list) {
    if (!projects) {
      list.innerHTML = '<p class="empty-projects">Projektlistan kunde inte laddas just nu.</p>';
      return;
    }
    // Visa endast publicerade projekt som tillhör just den aktuella tjänsten.
    const visibleProjects = projects.filter(project => project.published !== false && project.service === serviceId);
    if (!visibleProjects.length) {
      list.innerHTML = '<p class="empty-projects">Nya projekt och referenser publiceras här löpande.</p>';
      return;
    }

    list.innerHTML = visibleProjects.map((project, index) => {
      const image = projectImages(project)[0];
      const imageMarkup = image
        ? `<img src="../${escapeAttribute(image)}" alt="${escapeAttribute(project.title)}" loading="lazy">`
        : '';
      const description = project.description || project.longDescription || '';
      return `<button class="project-card" type="button" data-project-index="${index}" aria-label="Öppna bildgalleri för ${escapeAttribute(project.title)}">` +
        `<div class="project-card-image">${imageMarkup}<span class="project-card-title">${escapeHTML(project.title)}<span class="project-card-cta">Se projektet</span></span></div>` +
        `<span class="project-card-info"><h3 class="project-card-description-title">${escapeHTML(project.title)}</h3><span class="project-card-description"><span class="project-card-description-text">${escapeHTML(description)}</span></span><span class="project-card-more">Se projektet <span aria-hidden="true">→</span></span></span></button>`;
    }).join('');

    list.querySelectorAll('[data-project-index]').forEach(button => {
      button.addEventListener('click', () => openProjectGallery(visibleProjects[Number(button.dataset.projectIndex)], button));
    });

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
        list.scrollTo({ left: 0, behavior: scrollBehavior() });
      } else if (direction < 0 && atStart) {
        list.scrollTo({ left: maxScroll, behavior: scrollBehavior() });
      } else {
        list.scrollBy({ left: direction * step, behavior: scrollBehavior() });
      }
    };
    const showcase = list.closest('.service-showcase');
    showcase.querySelector('.project-carousel-prev')?.addEventListener('click', () => scrollByCard(-1));
    showcase.querySelector('.project-carousel-next')?.addEventListener('click', () => scrollByCard(1));
    list.addEventListener('scroll', updateProjectCarouselArrows, { passive: true });
  }

  // Lägger till svephint, pilar och prickar, projekt och anpassar höjden
  // för den tjänst som visas just nu
  function enhanceShowcase() {
    const showcase = document.querySelector('.service-showcase');
    showcase.querySelector('.service-copy')?.insertAdjacentHTML('beforeend',
      '<p class="service-swipe-hint"><span aria-hidden="true">←</span> Svep för nästa tjänst <span aria-hidden="true">→</span></p>');

    // Pilar och prickar på toppbilden (visas på stående skärm) visar att man
    // kan svepa mellan tjänsterna – och går att trycka på.
    const serviceHero = showcase.querySelector('.service-image-hero');
    const serviceIndex = serviceIds.indexOf(serviceId);
    if (serviceHero && serviceIndex >= 0) {
      const neighbour = step => serviceIds[(serviceIndex + step + serviceIds.length) % serviceIds.length];
      const arrow = (step, cls, label, path) =>
        `<a class="service-hero-arrow ${cls}" href="${neighbour(step)}.html" aria-label="${label}: ${escapeAttribute(serviceLabel(neighbour(step)))}">` +
        `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg></a>`;
      const dots = serviceIds.map(id =>
        `<a href="${id}.html" aria-label="${escapeAttribute(serviceLabel(id))}"${id === serviceId ? ' aria-current="page"' : ''}></a>`).join('');
      serviceHero.insertAdjacentHTML('beforeend',
        arrow(-1, 'service-hero-prev', 'Föregående tjänst', 'M15 5l-7 7 7 7') +
        arrow(1, 'service-hero-next', 'Nästa tjänst', 'M9 5l7 7-7 7') +
        `<nav class="service-hero-dots" aria-label="Tjänster">${dots}</nav>`);
    }

    const list = showcase.querySelector('[data-project-list]');
    if (list) renderProjects(list);
    updateProjectCarouselArrows();
    fitShowcase();
  }

  enhanceShowcase();
  window.addEventListener('resize', () => {
    updateProjectCarouselArrows();
    fitShowcase();
  });
  window.addEventListener('load', () => {
    updateProjectCarouselArrows();
    fitShowcase();
  });
  document.fonts?.ready.then(fitShowcase);
  preloadOtherServices();

  function createGalleryModal() {
    const modal = document.createElement('div');
    modal.className = 'project-gallery-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Projektgalleri');
    modal.innerHTML = `<div class="project-gallery-backdrop" data-gallery-close></div><div class="project-gallery-dialog"><div class="project-gallery-top"><div><p class="eyebrow" data-gallery-service></p><h2 data-gallery-title></h2></div><button class="project-gallery-close" type="button" aria-label="Stäng galleri">×</button></div><div class="project-gallery-stage"><button class="project-gallery-arrow project-gallery-prev" type="button" aria-label="Föregående bild">‹</button><img class="project-gallery-main-image" alt=""><button class="project-gallery-arrow project-gallery-next" type="button" aria-label="Nästa bild">›</button></div><div class="project-gallery-bottom"><div class="project-gallery-text"><p class="project-gallery-description"></p><button class="project-gallery-more" type="button" aria-expanded="false" hidden>Visa mer</button></div><span class="project-gallery-count" aria-live="polite"></span></div><div class="project-gallery-thumbnails" aria-label="Alla projektbilder"></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('.project-gallery-close').addEventListener('click', closeGallery);
    modal.querySelector('.project-gallery-more').addEventListener('click', event => {
      const expanded = modal.querySelector('.project-gallery-text').classList.toggle('is-expanded');
      event.currentTarget.textContent = expanded ? 'Visa mindre' : 'Visa mer';
      event.currentTarget.setAttribute('aria-expanded', String(expanded));
    });
    modal.querySelector('[data-gallery-close]').addEventListener('click', closeGallery);
    // Dator: klick på bilden öppnar bildzoomen. Pekskärm: tryck på vänster
    // eller höger halva av bilden för föregående eller nästa bild.
    modal.querySelector('.project-gallery-stage').addEventListener('click', event => {
      if (event.target.closest('.project-gallery-arrow')) return;
      if (isDesktopImageViewer()) {
        if (event.target.closest('.project-gallery-main-image')) openDesktopImageZoom();
        return;
      }
      if (activeImages.length < 2) return;
      const rect = event.currentTarget.getBoundingClientRect();
      showImage(imageIndex + (event.clientX < rect.left + rect.width / 2 ? -1 : 1));
    });
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
    activeImages = projectImages(project);
    if (!activeImages.length) return;
    imageIndex = 0;
    galleryModal.querySelector('[data-gallery-service]').textContent = serviceLabel(project.service);
    galleryModal.querySelector('[data-gallery-title]').textContent = project.title;
    galleryModal.querySelector('.project-gallery-description').textContent = project.description || '';
    galleryModal.querySelector('.project-gallery-thumbnails').innerHTML = activeImages.map((src, i) => `<button type="button" data-thumb-index="${i}" aria-label="Visa bild ${i + 1}"><img src="../${escapeAttribute(src)}" alt="" loading="lazy"></button>`).join('');
    galleryModal.hidden = false;
    document.body.classList.add('project-gallery-open');
    showImage(0);
    collapseGalleryText();
    // Dator och mobil öppnar samma uppslag; på datorn förstorar ett klick på bilden.
    galleryModal.querySelector('.project-gallery-dialog').classList.remove('project-gallery-dialog-under-viewer');
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
      resetProjectImageTransform(zoomImage);
      const zoomCount = zoom.querySelector('.project-image-zoom-count');
      if (zoomCount) zoomCount.textContent = `${imageIndex + 1} / ${activeImages.length}`;
      const zoomThumbs = zoom.querySelector('.project-image-zoom-thumbnails');
      zoomThumbs?.querySelectorAll('[data-zoom-thumb-index]').forEach((button, i) => {
        button.classList.toggle('active', i === imageIndex);
        if (i === imageIndex) button.setAttribute('aria-current', 'true'); else button.removeAttribute('aria-current');
      });
      const activeZoomThumb = zoomThumbs?.querySelector(`[data-zoom-thumb-index="${imageIndex}"]`);
      activeZoomThumb?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: scrollBehavior() });
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
        thumbnails.scrollTo({ left: Math.max(0, thumbLeft - 8), behavior: scrollBehavior() });
      } else if (thumbRight > visibleRight) {
        thumbnails.scrollTo({ left: thumbRight - thumbnails.clientWidth + 8, behavior: scrollBehavior() });
      }
    }
    galleryModal.querySelector('.project-gallery-prev').hidden = activeImages.length < 2;
    galleryModal.querySelector('.project-gallery-next').hidden = activeImages.length < 2;
  }

  // Projekttexten visar två rader; Visa mer finns bara när texten är längre än så
  function collapseGalleryText() {
    const text = galleryModal.querySelector('.project-gallery-text');
    const description = galleryModal.querySelector('.project-gallery-description');
    const more = galleryModal.querySelector('.project-gallery-more');
    text.classList.remove('is-expanded');
    more.textContent = 'Visa mer';
    more.setAttribute('aria-expanded', 'false');
    description.hidden = !description.textContent;
    more.hidden = description.scrollHeight <= description.clientHeight + 1;
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
      zoom.querySelector('.project-image-zoom-close').addEventListener('click', closeDesktopImageZoom);
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
    const focusScope = zoom && !zoom.hidden
      ? zoom
      : galleryModal.querySelector('.project-gallery-dialog');
    if (event.key === 'Tab' && focusScope) {
      const focusable = [...focusScope.querySelectorAll(
        'button:not([disabled]):not([hidden]), [href], input:not([disabled]):not([hidden]), select:not([disabled]):not([hidden]), textarea:not([disabled]):not([hidden]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      )].filter(element => element.getClientRects().length > 0);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const focusIsOutside = !focusScope.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || focusIsOutside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || focusIsOutside)) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
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
