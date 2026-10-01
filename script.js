document.addEventListener("DOMContentLoaded", () => {

  /* =========================================
     LOGO → TOPPEN
  ========================================= */

  const brand =
    document.querySelector(".brand");

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


  /* =========================================
     REFERENS-MODAL
  ========================================= */

  const modal =
    document.querySelector(".project-modal");

  const modalTitle =
    document.querySelector("#modal-title");

  const modalLocation =
    document.querySelector("#modal-location");

  const modalDescription =
    document.querySelector("#modal-description");

  const modalClose =
    document.querySelector(".modal-close");

  const modalBackdrop =
    document.querySelector(".modal-backdrop");

  const projects =
    document.querySelectorAll(".project");


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

            modal.classList.add("open");

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


    /* =========================================
       STÄNG MODAL
    ========================================= */

    const closeModal = () => {

      modal.classList.remove("open");

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


    /* =========================================
       ESC → STÄNG
    ========================================= */

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
