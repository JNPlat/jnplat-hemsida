document.addEventListener(
  "DOMContentLoaded",
  () => {


    /* =====================================================
       ELEMENT
       ===================================================== */

    const brand =
      document.querySelector(
        ".brand"
      );


    const navLinks =
      document.querySelectorAll(
        ".nav-link"
      );


    const headerContact =
      document.querySelector(
        ".header-contact"
      );


    const sections = [

      document.querySelector(
        "#hem"
      ),

      document.querySelector(
        "#tjanster"
      ),

      document.querySelector(
        "#aktuellt"
      ),

      document.querySelector(
        "#kontakt"
      )

    ].filter(Boolean);



    /* =====================================================
       AKTIV SEKTION
       ===================================================== */

    function setActiveSection(
      sectionId
    ) {


      /* NAVIGATION */

      navLinks.forEach(
        (link) => {

          const active =
            link.dataset.section ===
            sectionId;


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


      /* KONTAKTA OSS */

      if (headerContact) {

        headerContact.classList.toggle(
          "active",
          sectionId === "kontakt"
        );

      }

    }



    /* =====================================================
       BESTÄM AKTIV SEKTION
       ===================================================== */

    function updateActiveSection() {


      const headerHeight =
        82;


      /*
         Aktiv punkt på sidan.
         När en sektion passerar denna punkt
         blir den aktiv i headern.
      */

      const activationPoint =
        headerHeight +
        (
          window.innerHeight *
          0.30
        );


      let activeSection =
        sections[0];


      sections.forEach(
        (section) => {

          const rect =
            section.getBoundingClientRect();


          if (
            rect.top <=
            activationPoint
          ) {

            activeSection =
              section;

          }

        }
      );


      /*
         När man faktiskt når botten
         ska Kontakt alltid vara aktiv.
      */

      const atBottom =
        window.innerHeight +
        window.scrollY >=
        document.documentElement
          .scrollHeight - 5;


      if (atBottom) {

        const contactSection =
          document.querySelector(
            "#kontakt"
          );


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
       LOGO → TOPPEN
       ===================================================== */

    if (brand) {

      brand.addEventListener(
        "click",
        (event) => {

          event.preventDefault();


          window.scrollTo({

            top: 0,

            behavior:
              "smooth"

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


            target.scrollIntoView({

              behavior:
                "smooth",

              block:
                "start"

            });

          }
        );

      }
    );



    /* =====================================================
       KONTAKTA OSS
       ===================================================== */

    if (headerContact) {

      headerContact.addEventListener(
        "click",
        (event) => {


          const target =
            document.querySelector(
              "#kontakt"
            );


          if (!target) {

            return;

          }


          event.preventDefault();


          target.scrollIntoView({

            behavior:
              "smooth",

            block:
              "start"

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

  }
);
