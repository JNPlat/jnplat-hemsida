document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* =====================================================
       ELEMENT
       ===================================================== */

    const header =
      document.querySelector(".site-header");


    const brand =
      document.querySelector(".brand");


    const navLinks =
      document.querySelectorAll(".nav-link");


    const sections =
      [
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

      if (!sections.length) {
        return;
      }


      const headerHeight =
        header
          ? header.getBoundingClientRect().height
          : 0;


      const activationPoint =
        headerHeight +
        (
          window.innerHeight * 0.30
        );


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

          activeSection =
            contactSection;

        }

      }


      if (activeSection) {

        const navSection =
          activeSection.dataset.navSection ||
          activeSection.id;


        setActiveSection(
          navSection
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


          if (!target) {
            return;
          }


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


    let referencePages = [];

    let currentReferencePage = 0;


    function buildReferencePages() {

      if (!referenceTrack) {
        return;
      }


      const cards =
        Array.from(
          referenceTrack.querySelectorAll(
            ".reference-card"
          )
        );


      referenceTrack.innerHTML = "";

      referencePages = [];


      /*
        Fem referenser per sida.

        1–5 referenser:
        inga pilar.

        6–10 referenser:
        två sidor + pilar.

        11–15:
        tre sidor + pilar.

        osv.
      */

      for (
        let i = 0;
        i < cards.length;
        i += 5
      ) {

        const page =
          document.createElement(
            "div"
          );


        page.className =
          "references-page";


        cards
          .slice(i, i + 5)
          .forEach((card) => {

            page.appendChild(card);

          });


        referenceTrack.appendChild(
          page
        );


        referencePages.push(
          page
        );

      }


      currentReferencePage = 0;


      updateReferenceCarousel();

    }


    function updateReferenceCarousel() {

      if (!referencePages.length) {

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


        return;

      }


      referencePages.forEach(
        (page, index) => {

          page.classList.toggle(
            "active",
            index === currentReferencePage
          );

        }
      );


      const hasMultiplePages =
        referencePages.length > 1;


      if (referencePrev) {

        referencePrev.classList.toggle(
          "visible",
          hasMultiplePages
        );

      }


      if (referenceNext) {

        referenceNext.classList.toggle(
          "visible",
          hasMultiplePages
        );

      }

    }


    if (referencePrev) {

      referencePrev.addEventListener(
        "click",
        () => {

          if (!referencePages.length) {
            return;
          }


          currentReferencePage =
            (
              currentReferencePage -
              1 +
              referencePages.length
            ) %
            referencePages.length;


          updateReferenceCarousel();

        }
      );

    }


    if (referenceNext) {

      referenceNext.addEventListener(
        "click",
        () => {

          if (!referencePages.length) {
            return;
          }


          currentReferencePage =
            (
              currentReferencePage +
              1
            ) %
            referencePages.length;


          updateReferenceCarousel();

        }
      );

    }


    buildReferencePages();


    /* =====================================================
       START
       ===================================================== */

    updateHeaderHeight();

    updateActiveSection();


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

      }
    );

  }
);
