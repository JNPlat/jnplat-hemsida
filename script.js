document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const brand = document.querySelector(".brand");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = [
    document.querySelector("#hem"),
    document.querySelector("#tjanster"),
    document.querySelector("#aktuellt"),
    document.querySelector("#om"),
    document.querySelector("#kontakt")
  ].filter(Boolean);

  function updateHeaderHeight() {
    if (!header) return;
    document.documentElement.style.setProperty(
      "--header-height",
      `${header.getBoundingClientRect().height}px`
    );
  }

  function updateActiveSection() {
    if (!sections.length) return;
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const scrollPosition = window.scrollY + headerHeight + 30;
    let activeSection = sections[0];

    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      if (sectionTop <= scrollPosition) activeSection = section;
    });

    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 5) {
      const contact = document.querySelector("#kontakt");
      if (contact) activeSection = contact;
    }

    navLinks.forEach(link => {
      const active = link.dataset.section === activeSection.id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  if (brand) {
    brand.addEventListener("click", event => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", event => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    });
  });

  /* REFERENCES: cards have natural, different widths. */
  const referenceTrack = document.querySelector(".references-track");
  const referencePrev = document.querySelector(".reference-prev");
  const referenceNext = document.querySelector(".reference-next");
  let referenceCards = [];
  let currentReferenceIndex = 0;

  function getReferenceMetrics() {
    if (!referenceTrack || !referenceTrack.parentElement) {
      return { cards: [], offsets: [], totalWidth: 0, viewportWidth: 0 };
    }

    const cards = Array.from(referenceTrack.querySelectorAll(".reference-card"));
    const gap = parseFloat(getComputedStyle(referenceTrack).gap) || 0;
    const viewportWidth = referenceTrack.parentElement.getBoundingClientRect().width;
    const offsets = [];
    let offset = 0;

    cards.forEach((card, index) => {
      offsets[index] = offset;
      offset += card.getBoundingClientRect().width;
      if (index < cards.length - 1) offset += gap;
    });

    return { cards, offsets, totalWidth: offset, viewportWidth };
  }

  function updateReferenceCarousel() {
    if (!referenceTrack) return;
    const metrics = getReferenceMetrics();
    referenceCards = metrics.cards;
    if (!referenceCards.length) return;

    const maxOffset = Math.max(0, metrics.totalWidth - metrics.viewportWidth);
    currentReferenceIndex = Math.min(currentReferenceIndex, referenceCards.length - 1);
    const requestedOffset = metrics.offsets[currentReferenceIndex] || 0;
    const offset = Math.min(requestedOffset, maxOffset);
    referenceTrack.style.transform = `translateX(-${offset}px)`;

    const hasOverflow = metrics.totalWidth > metrics.viewportWidth + 1;
    [referencePrev, referenceNext].forEach(button => {
      if (!button) return;
      button.style.visibility = hasOverflow ? "visible" : "hidden";
      button.style.opacity = hasOverflow ? "1" : "0";
      button.style.pointerEvents = hasOverflow ? "auto" : "none";
    });
  }

  if (referencePrev) {
    referencePrev.addEventListener("click", () => {
      if (referenceCards.length < 2) return;
      currentReferenceIndex = currentReferenceIndex <= 0
        ? referenceCards.length - 1
        : currentReferenceIndex - 1;
      updateReferenceCarousel();
    });
  }

  if (referenceNext) {
    referenceNext.addEventListener("click", () => {
      if (referenceCards.length < 2) return;
      currentReferenceIndex = currentReferenceIndex >= referenceCards.length - 1
        ? 0
        : currentReferenceIndex + 1;
      updateReferenceCarousel();
    });
  }

  updateHeaderHeight();
  updateActiveSection();
  updateReferenceCarousel();

  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateActiveSection();
      scrollTicking = false;
    });
  }, { passive: true });

  window.addEventListener("resize", () => {
    updateHeaderHeight();
    updateActiveSection();
    updateReferenceCarousel();
  });

  window.addEventListener("load", () => {
    updateHeaderHeight();
    updateActiveSection();
    updateReferenceCarousel();
  });
});
