document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     ELEMENT
     ===================================================== */

  const brand =
    document.querySelector(".brand");

  const navLinks =
    document.querySelectorAll(".nav-link");

  const headerContact =
    document.querySelector(".header-contact");

  const sections =
    document.querySelectorAll(
      "#hem, #tjanster, #aktuellt, #kontakt"
    );


  /* =====================================================
     LOGO → TOPPEN
     ===================================================== */

  if (brand) {

    brand.addEventListener("click", (event) => {

      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    });

  }


  /* =====================================================
     NAVIGATION → MJUK SCROLL
     ===================================================== */

  navLinks.forEach((link) => {

    link.addEventListener("click", (event) => {

      const targetId =
        link.getAttribute("href");

      const target =
        document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    });

  });


  /* =====================================================
     KONTAKT → MJUK SCROLL
     ===================================================== */

  if (headerContact) {

    headerContact.addEventListener(
      "click",
      (event) => {

        const targetId =
          headerContact.getAttribute("href");

        const target =
          document.querySelector(targetId);

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

  }


  /* =====================================================
     AKTIV MENY VID SCROLL
     ===================================================== */

  const setActiveSection = (sectionId) => {

    navLinks.forEach((link) => {

      const isActive =
        link.dataset.section === sectionId;

      link.classList.toggle(
        "active",
        isActive
      );

      if (isActive) {

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


    if (headerContact) {

      headerContact.classList.toggle(
        "active",
        sectionId === "kontakt"
      );

    }

  };


  /* =====================================================
     INTERSECTION OBSERVER
     ===================================================== */

  const observer =
    new IntersectionObserver(
      (entries) => {

        const visibleSections =
          entries
            .filter(
              (entry) => entry.isIntersecting
            )
            .sort(
              (a, b) =>
                b.intersectionRatio -
                a.intersectionRatio
            );

        if (
          visibleSections.length > 0
        ) {

          setActiveSection(
            visibleSections[0].target.id
          );

        }

      },
      {
        root: null,

        rootMargin:
          "-25% 0px -55% 0px",

        threshold: [
          0,
          0.1,
          0.25,
          0.5
        ]
      }
    );


  sections.forEach((section) => {

    observer.observe(section);

  });


  /* =====================================================
     TOPPLÄGE → HEM
     ===================================================== */

  window.addEventListener(
    "scroll",
    () => {

      if (window.scrollY < 120) {

        setActiveSection("hem");

      }

    },
    {
      passive: true
    }
  );


});
