document.addEventListener(
  "DOMContentLoaded",
  () => {


    /* =====================================================
       ELEMENT
       ===================================================== */

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
       
       Vi använder sidans faktiska scrollposition
       istället för IntersectionObserver.

       Det gör att en klickad menyflik inte kan ligga kvar
       som aktiv när man sedan scrollar vidare.
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


        /*
          getBoundingClientRect().top + scrollY
          ger sektionens verkliga position i dokumentet.
        */

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


      /*
        Om man är längst ner på sidan ska Kontakt
        vara aktiv.
      */

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


            /*
              Ta bort aktiv markering direkt.
              Scrollfunktionen tar sedan över och markerar
              rätt sektion när den faktiskt når den.
            */

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

      if (
        window.innerWidth <= 800
      ) {

        return 2;

      }


      if (
        window.innerWidth <= 1150
      ) {

        return 4;

      }


      return 5;

    }


    function updateReferenceCarousel() {

      if (!referenceTrack) {
        return;
      }


      referenceCards =
        Array.from(
          referenceTrack.querySelectorAll(
            ".reference-card"
          )
        );


      if (
        !referenceCards.length
      ) {

        return;

      }


      const visible =
        getVisibleReferenceCount();


      const maxIndex =
        Math.max(
          0,
          referenceCards.length -
          visible
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
        (
          cardWidth +
          gap
        );


      referenceTrack.style.transform =
        `translateX(-${offset}px)`;


      const hasOverflow =
        referenceCards.length >
        visible;


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

          const visible =
            getVisibleReferenceCount();


          const maxIndex =
            Math.max(
              0,
              referenceCards.length -
              visible
            );


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

          const visible =
            getVisibleReferenceCount();


          const maxIndex =
            Math.max(
              0,
              referenceCards.length -
              visible
            );


          if (!maxIndex) {
            return;
          }


          currentReferenceIndex =
            currentReferenceIndex >=
            maxIndex
              ? 0
              : currentReferenceIndex + 1;


          updateReferenceCarousel();

        }
      );

    }


    /* =====================================================
       INIT
       ===================================================== */

    updateHeaderHeight();

    updateActiveSection();

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

        updateReferenceCarousel();

      }
    );

  }
);
