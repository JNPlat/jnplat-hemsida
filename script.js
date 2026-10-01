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


    /*
       Kontakta oss har ingen .nav-link,
       därför hanteras den separat.
    */

    if (headerContact) {

      headerContact.classList.toggle(
        "active",
        sectionId === "kontakt"
      );

    }

  }


  /* =====================================================
     BESTÄM VILKEN SEKTION SOM ÄR AKTIV
     ===================================================== */

  function updateActiveSection() {

    const headerHeight = 82;

    /*
       Punkten ungefär 1/3 ner på skärmen.
       Den sektion som passerat den punkten
       räknas som aktiv.
    */

    const activationPoint =
      headerHeight +
      (window.innerHeight * 0.30);


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


    /*
       Om vi är längst ner:
       Kontakt ska alltid vara aktiv.
    */

    const bottomReached =
      window.innerHeight +
      window.scrollY >=
      document.documentElement.scrollHeight - 5;


    if (bottomReached) {

      const contactSection =
        document.querySelector("#kontakt");

      if (contactSection) {

        activeSection =
          contactSection;

      }

    }


    if (activeSection) {

      setActiveSection(
        activeSection.id
      );

    }

  }


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
     NAVIGATION
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
     KONTAKTA OSS
     ===================================================== */

  if (headerContact) {

    headerContact.addEventListener(
      "click",
      (event) => {

        const target =
          document.querySelector("#kontakt");

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
     RESIZE
     ===================================================== */

  window.addEventListener(
    "resize",
    updateActiveSection
  );


  /* =====================================================
     START
     ===================================================== */

  updateActiveSection();

});
