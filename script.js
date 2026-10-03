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


    /*
      Referenskorten har en fast höjd.
      Grundbredden kommer från CSS och motsvarar den
      storlek korten har idag. Om texten inte får plats
      på höjden ökas bara kortets bredd tills innehållet
      ryms. Höjden ändras aldrig.
    */
    function fitReferenceCards() {

      if (!referenceTrack) {
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

      referenceCards.forEach((card) => {

        /* Börja alltid om från CSS:ens normala bredd. */
        card.style.flexBasis = "";
        card.style.width = "";

        const baseWidth =
          card.getBoundingClientRect().width;

        if (!baseWidth) {
          return;
        }

        /*
          Om texten ryms behövs ingen extra bredd.
          Om den inte ryms söker vi fram den minsta
          bredd som gör att hela innehållet får plats.
        */
        if (card.scrollHeight <= card.clientHeight + 1) {
          return;
        }

        let low = baseWidth;
        let high = baseWidth * 2;

        card.style.flexBasis = `${high}px`;
        card.style.width = `${high}px`;

        while (
          card.scrollHeight > card.clientHeight + 1 &&
          high < 4000
        ) {
          low = high;
          high *= 1.5;

          card.style.flexBasis = `${high}px`;
          card.style.width = `${high}px`;
        }

        if (card.scrollHeight <= card.clientHeight + 1) {

          /* Binärsökning ger så liten extra bredd som möjligt. */
          let left = low;
          let right = high;

          for (let i = 0; i < 12; i++) {

            const middle =
              (left + right) / 2;

            card.style.flexBasis = `${middle}px`;
            card.style.width = `${middle}px`;

            if (
              card.scrollHeight <=
              card.clientHeight + 1
            ) {
              right = middle;
            } else {
              left = middle;
            }
          }

          card.style.flexBasis = `${right}px`;
          card.style.width = `${right}px`;
        }
      });
    }


    function updateReferenceCarousel() {

      if (
        !referenceTrack ||
        !referenceViewport
      ) {
        return;
      }

      fitReferenceCards();

      referenceCards =
        Array.from(
          referenceTrack.querySelectorAll(
            ".reference-card"
          )
        );

      if (!referenceCards.length) {
        return;
      }

      const maxScroll =
        Math.max(
          0,
          referenceTrack.scrollWidth -
          referenceViewport.clientWidth
        );

      const hasOverflow =
        maxScroll > 1;

      if (
        currentReferenceIndex >=
        referenceCards.length
      ) {
        currentReferenceIndex = 0;
      }

      const card =
        referenceCards[currentReferenceIndex];

      let offset =
        card
          ? card.offsetLeft
          : 0;

      offset =
        Math.min(
          Math.max(0, offset),
          maxScroll
        );

      referenceTrack.style.transform =
        `translateX(-${offset}px)`;

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

          if (!referenceCards.length) {
            return;
          }

          currentReferenceIndex =
            currentReferenceIndex <= 0
              ? referenceCards.length - 1
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

          if (!referenceCards.length) {
            return;
          }

          currentReferenceIndex =
            currentReferenceIndex >=
            referenceCards.length - 1
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
