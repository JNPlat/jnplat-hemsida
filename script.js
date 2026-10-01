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
     AKTIV MENYFLIK VID SCROLL
  ========================================= */

  const navLinks = document.querySelectorAll(
    ".main-nav a"
  );

  const sections = [
    {
      id: "om-oss",
      link: document.querySelector(
        '.main-nav a[href="#om-oss"]'
      )
    },
    {
      id: "tjanster",
      link: document.querySelector(
        '.main-nav a[href="#tjanster"]'
      )
    },
    {
      id: "referenser",
      link: document.querySelector(
        '.main-nav a[href="#referenser"]'
      )
    }
  ];


  const updateActiveNav = () => {

    const scrollPosition =
      window.scrollY + 180;

    let activeSection = null;

    sections.forEach((section) => {

      const element =
        document.getElementById(section.id);

      if (!element) return;

      if (
        scrollPosition >=
        element.offsetTop
      ) {

        activeSection = section;

      }

    });


    navLinks.forEach((link) => {

      link.classList.remove("active");

    });


    if (
      activeSection &&
      activeSection.link
    ) {

      activeSection.link.classList.add(
        "active"
      );

    }

  };


  window.addEventListener(
    "scroll",
    updateActiveNav,
    { passive: true }
  );

  updateActiveNav();


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

  const modalContent =
    document.querySelector(".modal-content");

  const projects =
    document.querySelectorAll(".project");


  /* =========================================
     MODAL-STYLING
  ========================================= */

  const modalStyle =
    document.createElement("style");

  modalStyle.textContent = `

    .main-nav a.active {
      color: var(--copper-dark);
    }

    .main-nav a.active::after {
      transform: scaleX(1);
    }

    .modal-project-image {
      width: 100%;
      max-height: 65vh;
      object-fit: contain;
      margin-bottom: 28px;
      background: #e8e1d6;
    }

    .modal-content {
      max-height: 90vh;
      overflow-y: auto;
    }

    @media (max-width: 800px) {

      .modal-project-image {
        max-height: 50vh;
        margin-bottom: 22px;
      }

    }

  `;

  document.head.appendChild(
    modalStyle
  );


  /* =========================================
     ÖPPNA REFERENSPROJEKT
  ========================================= */

  if (
    modal &&
    modalTitle &&
    modalLocation &&
    modalDescription &&
    modalContent
  ) {

    projects.forEach(
      (project) => {

        project.addEventListener(
          "click",
          () => {

            /* Hämta information */

            modalTitle.textContent =
              project.dataset.title || "";

            modalLocation.textContent =
              project.dataset.location || "";

            modalDescription.textContent =
              project.dataset.description || "";


            /* Hämta bilden */

            const projectImage =
              project.querySelector("img");


            /* Ta bort eventuell gammal bild */

            const oldImage =
              modalContent.querySelector(
                ".modal-project-image"
              );

            if (oldImage) {
              oldImage.remove();
            }


            /* Lägg in den nya bilden */

            if (projectImage) {

              const modalImage =
                document.createElement("img");

              modalImage.className =
                "modal-project-image";

              modalImage.src =
                projectImage.src;

              modalImage.alt =
                projectImage.alt || "";

              /*
                Bilden läggs först i popupen,
                precis under stängknappen.
              */

              modalContent.insertBefore(
                modalImage,
                modalContent.querySelector(
                  ".modal-location"
                )
              );

            }


            /* Öppna */

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
