document.addEventListener("DOMContentLoaded", () => {

  /* =========================================
     HEADER
  ========================================= */

  const header =
    document.querySelector(".site-header");

  let headerCompact = false;

  if (header) {

    const updateHeader = () => {

      const scrollY = window.scrollY;

      if (scrollY > 80 && !headerCompact) {

        headerCompact = true;

        header.classList.add(
          "header-compact"
        );

      }

      if (scrollY <= 20 && headerCompact) {

        headerCompact = false;

        header.classList.remove(
          "header-compact"
        );

      }

    };


    window.addEventListener(
      "scroll",
      updateHeader,
      {
        passive: true
      }
    );


    updateHeader();

  }


  /* =========================================
     DROPDOWN-MENY
  ========================================= */

  const menuButton =
    document.querySelector(".menu-toggle");

  const nav =
    document.querySelector(".nav");


  if (menuButton && nav) {

    menuButton.addEventListener(
      "click",
      () => {

        const isOpen =
          nav.classList.toggle("open");


        menuButton.setAttribute(
          "aria-expanded",
          String(isOpen)
        );


        menuButton.setAttribute(
          "aria-label",
          isOpen
            ? "Stäng meny"
            : "Öppna meny"
        );

      }
    );


    nav
      .querySelectorAll("a")
      .forEach((link) => {

        link.addEventListener(
          "click",
          () => {

            nav.classList.remove(
              "open"
            );


            menuButton.setAttribute(
              "aria-expanded",
              "false"
            );

            menuButton.setAttribute(
              "aria-label",
              "Öppna meny"
            );

          }
        );

      });

  }


  /* =========================================
     REFERENS-MODAL
  ========================================= */

  const modal =
    document.querySelector(
      ".project-modal"
    );

  const modalTitle =
    document.querySelector(
      "#modal-title"
    );

  const modalLocation =
    document.querySelector(
      "#modal-location"
    );

  const modalDescription =
    document.querySelector(
      "#modal-description"
    );

  const modalClose =
    document.querySelector(
      ".modal-close"
    );

  const modalBackdrop =
    document.querySelector(
      ".modal-backdrop"
    );

  const projects =
    document.querySelectorAll(
      ".project"
    );


  if (
    modal &&
    modalTitle &&
    modalLocation &&
    modalDescription
  ) {


    projects.forEach(
      (project) => {

        project.addEventListener(
          "click",
          () => {

            modalTitle.textContent =
              project.dataset.title || "";

            modalLocation.textContent =
              project.dataset.location || "";

            modalDescription.textContent =
              project.dataset.description || "";


            modal.classList.add(
              "open"
            );


            modal.setAttribute(
              "aria-hidden",
              "false"
            );


            document.body.classList.add(
              "modal-open"
            );

          }
        );

      }
    );


    const closeModal = () => {

      modal.classList.remove(
        "open"
      );


      modal.setAttribute(
        "aria-hidden",
        "true"
      );


      document.body.classList.remove(
        "modal-open"
      );

    };


    if (modalClose) {

      modalClose.addEventListener(
        "click",
        closeModal
      );

    }


    if (modalBackdrop) {

      modalBackdrop.addEventListener(
        "click",
        closeModal
      );

    }


    document.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Escape" &&
          modal.classList.contains("open")
        ) {

          closeModal();

        }

      }
    );

  }

});
