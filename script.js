document.addEventListener(
  "DOMContentLoaded",
  () => {

    const header =
      document.querySelector(
        ".site-header"
      );

    const brand =
      document.querySelector(
        ".brand"
      );

    const navLinks =
      document.querySelectorAll(
        ".nav-link"
      );


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

      if (!header) {
        return;
      }

      const height =
        header.getBoundingClientRect().height;

      document.documentElement.style.setProperty(
        "--header-height",
        `${height}px`
      );

    }


    /* =====================================================
       AKTIV SEKTION
       ===================================================== */

    function updateActiveSection() {

      if (!sections.length) {
        return;
      }


      const headerHeight =
        header
          ? header.getBoundingClientRect().height
          : 0;


      const scrollPosition =
        window.scrollY +
        headerHeight +
        30;


      let activeSection =
        sections[0];


      for (
        let i = 0;
        i < sections.length;
        i++
      ) {

        const section =
          sections[i];


        const sectionTop =
          section.getBoundingClientRect().top +
          window.scrollY;


        if (
          sectionTop <= scrollPosition
        ) {

          activeSection =
            section;

        }

      }


      const documentHeight =
        document.documentElement.scrollHeight;

      const viewportBottom =
        window.scrollY +
        window.innerHeight;


      if (
        viewportBottom >=
        documentHeight - 5
      ) {

        const contact =
          document.querySelector(
            "#kontakt"
          );

        if (contact) {
          activeSection =
            contact;
        }

      }


      navLinks.forEach(
        (link) => {

          const active =
            link.dataset.section ===
            activeSection.id;


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

        }
      );

    }


    /* =====================================================
       LOGO
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

    navLinks.forEach(
      (link) => {

        link.addEventListener(
          "click",
          (event) => {

            const targetId =
              link.getAttribute(
                "href"
              );

            const target =
              document.querySelector(
                targetId
              );


            if (!target) {
              return;
            }


            event.preventDefault();


            navLinks.forEach(
              (navLink) => {

                navLink.classList.remove(
                  "active"
                );

                navLink.removeAttribute(
                  "aria-current"
                );

              }
            );


            const headerHeight =
              header
                ? header.getBoundingClientRect().height
                : 0;


            const targetTop =
              target.getBoundingClientRect().top +
              window.scrollY -
              headerHeight;


            window.scrollTo({
              top:
                Math.max(
                  0,
                  targetTop
                ),
              behavior:
                "smooth"
            });

          }
        );

      }
    );


    /* =====================================================
       REFERENSCAROUSEL

       Korten har inte längre en gemensam bredd.

       JavaScript räknar därför på varje korts faktiska
       bredd och flyttar karusellen ett faktiskt kort
       i taget.
       ===================================================== */

    const referenceTrack =
      document.querySelector(
        ".references-track"
      );

    const referenceViewport =
      document.querySelector(
        ".references-viewport"
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


    function getReferenceMaxIndex() {

      if (
        !referenceTrack ||
        !referenceViewport
      ) {

        return 0;

      }


      referenceCards =
        Array.from(
          referenceTrack.querySelectorAll(
            ".reference-card"
          )
        );


      if (!referenceCards.length) {
        return 0;
      }


      const viewportWidth =
        referenceViewport.clientWidth;


      const maxScroll =
        Math.max(
          0,
          referenceTrack.scrollWidth -
          viewportWidth
        );


      let maxIndex = 0;


      referenceCards.forEach(
        (card, index) => {

          if (
            card.offsetLeft <=
            maxScroll + 1
          ) {

            maxIndex =
              index;

          }

        }
      );


      return maxIndex;

    }


    function updateReferenceCarousel() {

      if (
        !referenceTrack ||
        !referenceViewport
      ) {

        return;

      }


      referenceCards =
        Array.from(
          referenceTrack.querySelectorAll(
            ".reference-card"
          )
        );


      if (!referenceCards.length) {
        return;
      }


      const maxIndex =
        getReferenceMaxIndex();


      currentReferenceIndex =
        Math.min(
          currentReferenceIndex,
          maxIndex
        );


      const targetCard =
        referenceCards[
          currentReferenceIndex
        ];


      const offset =
        targetCard
          ? targetCard.offsetLeft
          : 0;


      referenceTrack.style.transform =
        `translateX(-${offset}px)`;


      const hasOverflow =
        referenceTrack.scrollWidth >
        referenceViewport.clientWidth +
        1;


      if (referencePrev) {

        referencePrev.style.visibility =
          hasOverflow
            ? "visible"
            : "hidden";

        referencePrev.style.opacity =
          hasOverflow
            ? "1"
            : "0";

        referencePrev.style.pointerEvents =
          hasOverflow
            ? "auto"
            : "none";

      }


      if (referenceNext) {

        referenceNext.style.visibility =
          hasOverflow
            ? "visible"
            : "hidden";

        referenceNext.style.opacity =
          hasOverflow
            ? "1"
            : "0";

        referenceNext.style.pointerEvents =
          hasOverflow
            ? "auto"
            : "none";

      }

    }


    /* =====================================================
       REFERENS – VÄNSTER
       ===================================================== */

    if (referencePrev) {

      referencePrev.addEventListener(
        "click",
        () => {

          const maxIndex =
            getReferenceMaxIndex();


          if (!maxIndex) {
            return;
          }


          currentReferenceIndex =
            currentReferenceIndex <= 0
              ? maxIndex
              : currentReferenceIndex - 1;


          updateReferenceCarousel();

        }
      );

    }


    /* =====================================================
       REFERENS – HÖGER
       ===================================================== */

    if (referenceNext) {

      referenceNext.addEventListener(
        "click",
        () => {

          const maxIndex =
            getReferenceMaxIndex();


          if (!maxIndex) {
            return;
          }


          currentReferenceIndex =
            currentReferenceIndex >= maxIndex
              ? 0
              : currentReferenceIndex + 1;


          updateReferenceCarousel();

        }
      );

    }


    /* =====================================================
       TJÄNSTEBILDER

       CSS avgör när Tjänster har gått över till en
       kolumn. Bildkällan följer sedan den faktiska
       layouten.
       ===================================================== */

    const servicesGrid =
      document.querySelector(
        ".services-grid"
      );


    function updateServiceImages() {

      if (!servicesGrid) {
        return;
      }


      const columns =
        getComputedStyle(
          servicesGrid
        )
          .gridTemplateColumns
          .trim()
          .split(/\s+/)
          .filter(Boolean);


      const mobileLayout =
        columns.length === 1;


      const servicePictures =
        servicesGrid.querySelectorAll(
          ".service-card picture"
        );


      servicePictures.forEach(
        (picture) => {

          const source =
            picture.querySelector(
              "source"
            );


          if (!source) {
            return;
          }


          source.media =
            mobileLayout
              ? "all"
              : "not all";

        }
      );

    }


    /* =====================================================
       INIT
       ===================================================== */

    updateHeaderHeight();

    updateActiveSection();

    updateServiceImages();

    updateReferenceCarousel();


    /* =====================================================
       SCROLL
       ===================================================== */

    let scrollTicking = false;


    window.addEventListener(
      "scroll",
      () => {

        if (scrollTicking) {
          return;
        }


        scrollTicking = true;


        window.requestAnimationFrame(
          () => {

            updateActiveSection();

            scrollTicking = false;

          }
        );

      },
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

        updateServiceImages();

        updateReferenceCarousel();

      }
    );


    /* =====================================================
       LOAD
       ===================================================== */

    window.addEventListener(
      "load",
      () => {

        updateHeaderHeight();

        updateActiveSection();

        updateServiceImages();

        updateReferenceCarousel();

      }
    );

  }
);
