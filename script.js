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

  const sections = [
    document.querySelector("#hem"),
    document.querySelector("#tjanster"),
    document.querySelector("#aktuellt"),
    document.querySelector("#kontakt")
  ].filter(Boolean);


  /* =====================================================
     AKTIV MENY
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
     BESTÄM VILKEN SEKTION MAN ÄR I
     ===================================================== */

  const updateActiveSection = () => {

    const headerHeight = 82;

    /*
      Den här linjen bestämmer var på skärmen
      vi anser att nästa sektion har blivit aktiv.
    */

    const activationPoint =
      window.scrollY +
      headerHeight +
      120;


    let activeSection = sections[0];


    sections.forEach((section) => {

      const sectionTop =
        section.offsetTop;

      if (
        activationPoint >= sectionTop
      ) {

        activeSection = section;

      }

    });


    if (activeSection) {

      setActiveSection(
        activeSection.id
      );

    }

  };


  /* =====================================================
     LOGGA → TOPPEN
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
     NAVIGATION → MJUK SCROLL
     ===================================================== */

  navLinks.forEach((link) => {

    link.addEventListener(
      "click",
      (event) => {

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

      }
    );

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
     STARTLÄGE
     ===================================================== */

  updateActiveSection();

});
