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


  /* =====================================================
     HEADER HEIGHT
     ===================================================== */

  function updateHeaderHeight() {

    if (!header) return;

    const height = header.getBoundingClientRect().height;

    document.documentElement.style.setProperty(
      "--header-height",
      `${height}px`
    );

  }


  /* =====================================================
     AKTIV SEKTION
     ===================================================== */

  function setActiveSection(sectionId) {

    navLinks.forEach((link) => {

      const active =
        link.dataset.section === sectionId;

      link.classList.toggle(
        "active",
        active
      );

      if (active) {

        link.setAttribute(
          "aria-current",
          "page"
        );

      } else {

        link.removeAttribute(
          "aria-current"
        );

      }

    });

  }


  /* =====================================================
     BESTÄM AKTIV SEKTION
     ===================================================== */

  function updateActiveSection() {

    if (!sections.length) return;

    const headerHeight =
      header
        ? header.getBoundingClientRect().height
        : 0;

    const activationPoint =
      headerHeight +
      window.innerHeight * 0.30;

    let activeSection =
      sections[0];

    sections.forEach((section) => {

      const rect =
        section.getBoundingClientRect();

      if (
        rect.top <= activationPoint
      ) {

        activeSection =
          section;

      }

    });


    const atBottom =
      window.innerHeight +
      window.scrollY >=
      document.documentElement.scrollHeight - 5;


    if (atBottom) {

      const contactSection =
        document.querySelector("#kontakt");

      if (contactSection) {
        activeSection = contactSection;
      }

    }


    if (activeSection) {

      setActiveSection(
        activeSection.dataset.navSection ||
        activeSection.id
      );

    }

  }


  /* =====================================================
     LOGO → TOPPEN
     ===================================================== */

  if (brand) {

    brand.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      }
    );

  }


  /* =====================================================
     NAVIGATION
     ===================================================== */

  navLinks.forEach((link) => {

    link.addEventListener(
      "click",
      (event) => {

        const targetId =
          link.getAttribute("href");

        const target =
          document.querySelector(
            targetId
          );

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }
    );

  });


  /* =====================================================
     REFERENSER
     
     Horisontell carousel som automatiskt anpassar
     antal synliga referenser efter skärmens bredd.
     ===================================================== */

  const referenceTrack =
    document.querySelector(
      ".references-track"
    );

  const referencePrev =
    document.querySelector(
      ".reference-prev"
    );

  const referenceNext =
    document.querySelector(
      ".reference-next"
    );


  let referenceCards = [];

  let currentReferenceIndex = 0;


  function getVisibleReferenceCount() {

    if (window.innerWidth <= 800) {
      return 2;
    }

    if (window.innerWidth <= 1100) {
      return 4;
    }

    return 5;

  }


  function updateReferenceCarousel() {

    if (!referenceTrack) return;


    referenceCards =
      Array.from(
        referenceTrack.querySelectorAll(
          ".reference-card"
        )
      );


    const empty =
      referenceTrack.querySelector(
        ".reference-empty"
      );


    /*
      Om det ännu inte finns några riktiga
      referenser visas endast den tomma
      informationsrutan.
    */

    if (!referenceCards.length) {

      if (empty) {
        empty.style.display = "flex";
      }

      if (referencePrev) {
        referencePrev.classList.remove(
          "visible"
        );
      }

      if (referenceNext) {
        referenceNext.classList.remove(
          "visible"
        );
      }

      referenceTrack.style.transform =
        "translateX(0)";

      currentReferenceIndex = 0;

      return;

    }


    if (empty) {
      empty.style.display = "none";
    }


    const visible =
      getVisibleReferenceCount();


    const maxIndex =
      Math.max(
        0,
        referenceCards.length - visible
      );


    currentReferenceIndex =
      Math.min(
        currentReferenceIndex,
        maxIndex
      );


    const cardWidth =
      referenceCards[0]
        .getBoundingClientRect()
        .width;


    const gap =
      parseFloat(
        getComputedStyle(
          referenceTrack
        ).gap
      ) || 0;


    const offset =
      currentReferenceIndex *
      (cardWidth + gap);


    referenceTrack.style.transform =
      `translateX(-${offset}px)`;


    const hasOverflow =
      referenceCards.length > visible;


    if (referencePrev) {

      referencePrev.classList.toggle(
        "visible",
        hasOverflow
      );

    }


    if (referenceNext) {

      referenceNext.classList.toggle(
        "visible",
        hasOverflow
      );

    }

  }


  /* =====================================================
     REFERENSER – VÄNSTER PIL
     ===================================================== */

  if (referencePrev) {

    referencePrev.addEventListener(
      "click",
      () => {

        const visible =
          getVisibleReferenceCount();

        const maxIndex =
          Math.max(
            0,
            referenceCards.length - visible
          );


        if (!maxIndex) return;


        currentReferenceIndex =
          currentReferenceIndex <= 0
            ? maxIndex
            : currentReferenceIndex - 1;


        updateReferenceCarousel();

      }
    );

  }


  /* =====================================================
     REFERENSER – HÖGER PIL
     ===================================================== */

  if (referenceNext) {

    referenceNext.addEventListener(
      "click",
      () => {

        const visible =
          getVisibleReferenceCount();

        const maxIndex =
          Math.max(
            0,
            referenceCards.length - visible
          );


        if (!maxIndex) return;


        currentReferenceIndex =
          currentReferenceIndex >= maxIndex
            ? 0
            : currentReferenceIndex + 1;


        updateReferenceCarousel();

      }
    );

  }


  /* =====================================================
     START
     ===================================================== */

  updateHeaderHeight();

  updateActiveSection();

  updateReferenceCarousel();


  /* =====================================================
     SCROLL
     ===================================================== */

  window.addEventListener(
    "scroll",
    updateActiveSection,
    {
      passive: true
    }
  );


  /* =====================================================
     RESIZE
     ===================================================== */

  window.addEventListener(
    "resize",
    () => {

      updateHeaderHeight();

      updateActiveSection();

      updateReferenceCarousel();

    }
  );

});
