document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     MOBILMENY
  ========================= */

  const menuButton =
    document.querySelector(".menu-toggle");

  const nav =
    document.querySelector(".nav");


  if (menuButton && nav) {

    menuButton.addEventListener("click", () => {

      const open =
        nav.classList.toggle("open");

      menuButton.setAttribute(
        "aria-expanded",
        String(open)
      );

    });


    nav.querySelectorAll("a").forEach(link => {

      link.addEventListener("click", () => {

        nav.classList.remove("open");

        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );

      });

    });

  }


  /* =========================
     KOMPAKT HEADER VID SCROLL
  ========================= */

  const header =
    document.querySelector(".site-header");


  if (header) {

    let ticking = false;


    const updateHeader = () => {

      if (window.scrollY > 80) {

        header.classList.add(
          "header-compact"
        );

      } else {

        header.classList.remove(
          "header-compact"
        );

      }

      ticking = false;
    };


    window.addEventListener(
      "scroll",
      () => {

        if (!ticking) {

          window.requestAnimationFrame(
            updateHeader
          );

          ticking = true;
        }

      },
      { passive: true }
    );


    updateHeader();

  }


  /* =========================
     LIGHTBOX
  ========================= */

  const lightbox =
    document.querySelector("#lightbox");

  const lightboxImage =
    document.querySelector(".lightbox-image");

  const lightboxTitle =
    document.querySelector(".lightbox-title");

  const lightboxLocation =
    document.querySelector(".lightbox-location");

  const closeButton =
    document.querySelector(".lightbox-close");


  const projects =
    document.querySelectorAll(
      "[data-lightbox]"
    );


  if (
    lightbox &&
    lightboxImage &&
    lightboxTitle &&
    lightboxLocation
  ) {


    const openLightbox = project => {

      const image =
        project.dataset.image;

      const title =
        project.dataset.title || "";

      const location =
        project.dataset.location || "";


      lightboxImage.src = image;

      lightboxImage.alt = title;

      lightboxTitle.textContent =
        title;

      lightboxLocation.textContent =
        location;


      lightbox.classList.add("open");

      lightbox.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.classList.add(
        "lightbox-open"
      );


      if (closeButton) {
        closeButton.focus();
      }

    };


    const closeLightbox = () => {

      lightbox.classList.remove(
        "open"
      );

      lightbox.setAttribute(
        "aria-hidden",
        "true"
      );

      document.body.classList.remove(
        "lightbox-open"
      );

    };


    projects.forEach(project => {

      project.addEventListener(
        "click",
        () => {

          openLightbox(project);

        }
      );


      project.addEventListener(
        "keydown",
        event => {

          if (
            event.key === "Enter" ||
            event.key === " "
          ) {

            event.preventDefault();

            openLightbox(project);

          }

        }
      );

    });


    if (closeButton) {

      closeButton.addEventListener(
        "click",
        closeLightbox
      );

    }


    lightbox.addEventListener(
      "click",
      event => {

        if (
          event.target === lightbox
        ) {

          closeLightbox();

        }

      }
    );


    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape" &&
          lightbox.classList.contains("open")
        ) {

          closeLightbox();

        }

      }
    );

  }

});
