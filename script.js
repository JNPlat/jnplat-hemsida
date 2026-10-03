document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const brand = document.querySelector(".brand");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sections = ["hem", "tjanster", "aktuellt", "om", "kontakt"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const contactSection = document.getElementById("kontakt");

  const referenceTrack = document.querySelector(".references-track");
  const referenceViewport = document.querySelector(".references-viewport");
  const referencePrev = document.querySelector(".reference-prev");
  const referenceNext = document.querySelector(".reference-next");

  let referenceCards = [];
  let currentReferenceIndex = 0;
  let scrollTicking = false;

  function getHeaderHeight() {
    return header ? header.getBoundingClientRect().height : 0;
  }

  function updateHeaderHeight() {
    document.documentElement.style.setProperty(
      "--header-height",
      `${getHeaderHeight()}px`
    );
  }

  function updateActiveSection() {
    if (!sections.length) return;

    const scrollPosition = window.scrollY + getHeaderHeight() + 30;
    let activeSection = sections[0];

    for (const section of sections) {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      if (sectionTop <= scrollPosition) activeSection = section;
    }

    const atPageBottom =
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 5;

    if (atPageBottom && contactSection) activeSection = contactSection;

    navLinks.forEach((link) => {
      const active = link.dataset.section === activeSection.id;
      link.classList.toggle("active", active);

      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function scrollToSection(target) {
    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      getHeaderHeight();

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth"
    });
  }

  brand?.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const target = targetId ? document.querySelector(targetId) : null;
      if (!target) return;

      event.preventDefault();
      navLinks.forEach((navLink) => {
        navLink.classList.remove("active");
        navLink.removeAttribute("aria-current");
      });
      scrollToSection(target);
    });
  });

  function fitReferenceCards() {
    if (!referenceTrack) return;

    referenceCards = [
      ...referenceTrack.querySelectorAll(".reference-card")
    ];

    referenceCards.forEach((card) => {
      card.style.flexBasis = "";
      card.style.width = "";

      const baseWidth = card.getBoundingClientRect().width;
      if (!baseWidth || card.scrollHeight <= card.clientHeight + 1) return;

      let low = baseWidth;
      let high = baseWidth * 2;

      card.style.flexBasis = `${high}px`;
      card.style.width = `${high}px`;

      while (card.scrollHeight > card.clientHeight + 1 && high < 4000) {
        low = high;
        high *= 1.5;
        card.style.flexBasis = `${high}px`;
        card.style.width = `${high}px`;
      }

      if (card.scrollHeight <= card.clientHeight + 1) {
        for (let i = 0; i < 12; i++) {
          const middle = (low + high) / 2;
          card.style.flexBasis = `${middle}px`;
          card.style.width = `${middle}px`;

          if (card.scrollHeight <= card.clientHeight + 1) {
            high = middle;
          } else {
            low = middle;
          }
        }

        card.style.flexBasis = `${high}px`;
        card.style.width = `${high}px`;
      }
    });
  }

  function setReferenceArrowState(button, visible) {
    if (!button) return;
    button.style.visibility = visible ? "visible" : "hidden";
    button.style.opacity = visible ? "1" : "0";
    button.style.pointerEvents = visible ? "auto" : "none";
  }

  function updateReferenceCarousel() {
    if (!referenceTrack || !referenceViewport) return;

    fitReferenceCards();

    if (!referenceCards.length) return;

    currentReferenceIndex = Math.min(
      currentReferenceIndex,
      referenceCards.length - 1
    );

    const maxScroll = Math.max(
      0,
      referenceTrack.scrollWidth - referenceViewport.clientWidth
    );

    const hasOverflow = maxScroll > 1;
    const card = referenceCards[currentReferenceIndex];
    const offset = Math.min(
      Math.max(0, card?.offsetLeft ?? 0),
      maxScroll
    );

    referenceTrack.style.transform = `translateX(-${offset}px)`;
    setReferenceArrowState(referencePrev, hasOverflow);
    setReferenceArrowState(referenceNext, hasOverflow);
  }

  referencePrev?.addEventListener("click", () => {
    if (!referenceCards.length) return;

    currentReferenceIndex =
      currentReferenceIndex <= 0
        ? referenceCards.length - 1
        : currentReferenceIndex - 1;

    updateReferenceCarousel();
  });

  referenceNext?.addEventListener("click", () => {
    if (!referenceCards.length) return;

    currentReferenceIndex =
      currentReferenceIndex >= referenceCards.length - 1
        ? 0
        : currentReferenceIndex + 1;

    updateReferenceCarousel();
  });

  function updateLayout() {
    updateHeaderHeight();
    updateActiveSection();
    updateReferenceCarousel();
  }

  updateLayout();

  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) return;

      scrollTicking = true;
      window.requestAnimationFrame(() => {
        updateActiveSection();
        scrollTicking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", updateLayout);
  window.addEventListener("load", updateLayout);
});
