document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     HEADER HEIGHT
  ========================== */

  const header = document.querySelector(".site-header");

  function updateHeaderHeight() {
    if (!header) return;

    document.documentElement.style.setProperty(
      "--header-height",
      `${header.offsetHeight}px`
    );
  }

  updateHeaderHeight();

  window.addEventListener("resize", updateHeaderHeight);


  /* =========================
     SMOOTH SCROLL
  ========================== */

  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach(link => {

    link.addEventListener("click", event => {

      const targetId = link.getAttribute("href");

      if (!targetId || !targetId.startsWith("#")) {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      const headerHeight = header
        ? header.offsetHeight
        : 0;

      const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });

    });

  });


  /* =========================
     ACTIVE NAVIGATION
  ========================== */

  const sections = [
    document.querySelector("#hem"),
    document.querySelector("#tjanster"),
    document.querySelector("#aktuellt"),
    document.querySelector("#om"),
    document.querySelector("#kontakt")
  ].filter(Boolean);


  function updateActiveNavigation() {

    const headerHeight = header
      ? header.offsetHeight
      : 0;

    const scrollPosition =
      window.scrollY + headerHeight + 120;

    let currentSection = "hem";

    sections.forEach(section => {

      if (scrollPosition >= section.offsetTop) {
        currentSection = section.id;
      }

    });

    navLinks.forEach(link => {

      const sectionName =
        link.dataset.section;

      link.classList.toggle(
        "active",
        sectionName === currentSection
      );

    });

  }


  window.addEventListener(
    "scroll",
    updateActiveNavigation,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    updateActiveNavigation
  );

  updateActiveNavigation();


  /* =========================
     REFERENCES CAROUSEL
  ========================== */

  const track =
    document.querySelector(".references-track");

  const prevButton =
    document.querySelector(".carousel-arrow.prev");

  const nextButton =
    document.querySelector(".carousel-arrow.next");

  if (track && prevButton && nextButton) {

    let currentPosition = 0;

    function getStep() {

      const card =
        track.querySelector(".reference-card");

      if (!card) {
        return 0;
      }

      const styles =
        window.getComputedStyle(track);

      const gap =
        parseFloat(styles.columnGap || styles.gap || 0);

      return card.offsetWidth + gap;
    }


    function getMaxPosition() {

      return Math.max(
        0,
        track.scrollWidth - track.clientWidth
      );

    }


    function updateButtons() {

      const maxPosition =
        getMaxPosition();

      prevButton.disabled =
        currentPosition <= 1;

      nextButton.disabled =
        currentPosition >= maxPosition - 1;

      prevButton.style.opacity =
        prevButton.disabled ? "0.35" : "1";

      nextButton.style.opacity =
        nextButton.disabled ? "0.35" : "1";

    }


    function moveCarousel(direction) {

      const step =
        getStep();

      if (!step) {
        return;
      }

      const maxPosition =
        getMaxPosition();

      currentPosition +=
        direction * step;

      currentPosition =
        Math.max(
          0,
          Math.min(
            currentPosition,
            maxPosition
          )
        );

      track.scrollTo({
        left: currentPosition,
        behavior: "smooth"
      });

      updateButtons();

    }


    prevButton.addEventListener(
      "click",
      () => moveCarousel(-1)
    );

    nextButton.addEventListener(
      "click",
      () => moveCarousel(1)
    );


    track.addEventListener(
      "scroll",
      () => {

        currentPosition =
          track.scrollLeft;

        updateButtons();

      },
      { passive: true }
    );


    window.addEventListener(
      "resize",
      () => {

        currentPosition =
          Math.min(
            track.scrollLeft,
            getMaxPosition()
          );

        updateButtons();

      }
    );


    updateButtons();

  }

});
