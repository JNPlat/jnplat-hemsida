document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const brand = document.querySelector(".brand");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sections = ["hem", "tjanster", "sa-jobbar-jag", "om", "aktuellt", "kontakt"]
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

    const isMobile = window.matchMedia("(orientation: portrait)").matches;
    if (isMobile) {
      referenceCards = [...referenceTrack.querySelectorAll(".reference-card")];
      referenceCards.forEach((card) => {
        card.style.flexBasis = "";
        card.style.width = "";
      });
      // On mobile use native horizontal scrolling so the user can swipe naturally.
      // Do not translate the track: that created the blank/white area and blocked swiping.
      referenceTrack.style.transform = "none";
      referenceTrack.style.transition = "none";
      referenceViewport.scrollLeft = Math.min(
        referenceViewport.scrollLeft,
        Math.max(0, referenceViewport.scrollWidth - referenceViewport.clientWidth)
      );
      setReferenceArrowState(referencePrev, false);
      setReferenceArrowState(referenceNext, false);
      return;
    } else {
      referenceTrack.style.transition = "transform 0.4s ease";
      fitReferenceCards();
    }

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
    let offset = Math.max(0, (card?.offsetLeft ?? 0) - (referenceCards[0]?.offsetLeft ?? 0));

    // When several cards are already visible at the far right, their
    // offset is clamped to the same maxScroll position. Treat that
    // position as the end of the carousel so the next click wraps
    // directly back to the first card instead of doing several
    // apparently inactive clicks.
    if (hasOverflow && offset >= maxScroll - 1) {
      currentReferenceIndex = referenceCards.length - 1;
      offset = maxScroll;
    } else {
      offset = Math.min(offset, maxScroll);
    }

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
    updateActiveSection();
    updateReferenceCarousel();
  }

  updateLayout();

  // Cross-page hash navigation: wait until the destination page has completed
  // layout, then align the target once without competing smooth-scroll calls.
  if (window.location.hash) {
    let hashTarget = null;
    try { hashTarget = document.querySelector(window.location.hash); } catch (_) {}
    if (hashTarget) {
      const alignHashTarget = () => {
        const top = hashTarget.getBoundingClientRect().top + window.scrollY - getHeaderHeight();
        window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
      };
      const alignAfterLayout = () => {
        requestAnimationFrame(() => requestAnimationFrame(alignHashTarget));
        window.setTimeout(alignHashTarget, 180);
        window.setTimeout(alignHashTarget, 500);
      };
      if (document.readyState === "complete") alignAfterLayout();
      else window.addEventListener("load", alignAfterLayout, { once: true });
    }
  }

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
