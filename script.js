/* =========================================
   J. NORBERG PLÅTSLAGERI
   Site interactions
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =========================================
     MOBILMENY
  ========================================= */

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  if (menuButton && nav) {

    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("open");

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


  /* =========================================
     HEADER + FLYTANDE LOGGA
  ========================================= */

  const header = document.querySelector(".site-header");

  if (header) {

    let lastScrollY = window.scrollY;
    let ticking = false;

    /*
      Skapar den lilla flytande loggan.
      Den finns inte i HTML från början.
    */

    let floatingLogo = document.querySelector(".floating-logo");

    if (!floatingLogo) {

      floatingLogo = document.createElement("a");

      floatingLogo.className = "floating-logo";

      floatingLogo.href = "#top";

      floatingLogo.setAttribute(
        "aria-label",
        "Till startsidan"
      );

      floatingLogo.innerHTML = `
        <img
          src="logo/J.NORBERG.svg"
          alt="J. Norberg Plåtslageri"
        >
      `;

      document.body.appendChild(floatingLogo);
    }


    const handleScroll = () => {

      const currentScrollY = window.scrollY;


      /*
        När vi är nära toppen:
        vanlig header + ingen flytande logga.
      */

      if (currentScrollY < 120) {

        header.classList.remove("header-hidden");
        floatingLogo.classList.remove("visible");

        lastScrollY = currentScrollY;

        ticking = false;

        return;
      }


      /*
        Scrollar nedåt:
        göm vanlig header,
        visa flytande logga.
      */

      if (currentScrollY > lastScrollY + 5) {

        header.classList.add("header-hidden");
        floatingLogo.classList.add("visible");

      }


      /*
        Scrollar uppåt:
        visa vanlig header igen.
      */

      else if (currentScrollY < lastScrollY - 5) {

        header.classList.remove("header-hidden");

      }

      lastScrollY = currentScrollY;

      ticking = false;
    };


    window.addEventListener(
      "scroll",
      () => {

        if (!ticking) {

          window.requestAnimationFrame(
            handleScroll
          );

          ticking = true;
        }

      },
      { passive: true }
    );


    /*
      Klick på flytande logga
    */

    floatingLogo.addEventListener("click", event => {

      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    });
  }


  /* =========================================
     REFERENSBILDER
  ========================================= */

  /*
    Dina bilder ligger i denna ordning:

    01 IMG_1412.jpeg
    02 IMG_1508.jpeg
    03 IMG_2248.jpeg
    04 IMG_2280.jpeg
    05 IMG_2335.jpeg
    06 IMG_2421.jpeg
    07 IMG_2829.jpeg
    08 IMG_3698.jpeg
  */

  const imageFiles = [
    "IMG_1412.jpeg",
    "IMG_1508.jpeg",
    "IMG_2248.jpeg",
    "IMG_2280.jpeg",
    "IMG_2335.jpeg",
    "IMG_2421.jpeg",
    "IMG_2829.jpeg",
    "IMG_3698.jpeg"
  ];


  /*
    Försöker hitta referensbilderna.
    Om HTML redan innehåller <img> använder vi dem.
  */

  const projects = document.querySelectorAll(".project");


  projects.forEach((project, index) => {

    const imageContainer =
      project.querySelector(".project-image");

    if (!imageContainer) return;


    /*
      Om det redan finns en bild:
      använd den.
    */

    let image =
      imageContainer.querySelector("img");


    /*
      Om det inte finns en bild:
      skapa en från images-mappen.
    */

    if (!image && imageFiles[index]) {

      image = document.createElement("img");

      image.src =
        `images/${imageFiles[index]}`;

      image.alt =
        "J. Norberg Plåtslageri – referensarbete";

      imageContainer.appendChild(image);
    }


    if (!image) return;


    /*
      Gör projektet klickbart.
    */

    project.setAttribute(
      "role",
      "button"
    );

    project.setAttribute(
      "tabindex",
      "0"
    );

    project.setAttribute(
      "aria-label",
      "Visa referens"
    );


    /*
      Ta bort den gamla informationen från
      referensbildens normala vy.

      Informationen visas istället i lightboxen.
    */

    const meta =
      project.querySelector(".project-meta");

    if (meta) {
      meta.style.display = "none";
    }


    /*
      Klick
    */

    project.addEventListener("click", event => {

      /*
        Om användaren råkar klicka på en länk
        inne i projektet ska den fortfarande fungera.
      */

      if (event.target.closest("a")) return;

      openLightbox(project, image);

    });


    /*
      Tangentbord
    */

    project.addEventListener("keydown", event => {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        openLightbox(project, image);
      }

    });

  });


  /* =========================================
     LIGHTBOX
  ========================================= */

  let lightbox = null;


  function createLightbox() {

    if (lightbox) return lightbox;


    lightbox = document.createElement("div");

    lightbox.className = "lightbox";


    lightbox.innerHTML = `
      <div class="lightbox-content">

        <button
          class="lightbox-close"
          type="button"
          aria-label="Stäng bild"
        >
          ×
        </button>

        <img
          class="lightbox-image"
          src=""
          alt=""
        >

        <div class="lightbox-caption">

          <h3 class="lightbox-title"></h3>

          <p class="lightbox-location"></p>

        </div>

      </div>
    `;


    document.body.appendChild(lightbox);


    /*
      Stäng-knapp
    */

    const closeButton =
      lightbox.querySelector(".lightbox-close");

    closeButton.addEventListener(
      "click",
      closeLightbox
    );


    /*
      Klick utanför bilden stänger.
    */

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


    /*
      ESC stänger.
    */

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


    return lightbox;
  }


  function openLightbox(project, image) {

    const box =
      createLightbox();


    const lightboxImage =
      box.querySelector(".lightbox-image");

    const title =
      box.querySelector(".lightbox-title");

    const location =
      box.querySelector(".lightbox-location");


    /*
      Hämta titel och plats från projektet.

      Om de finns i HTML används de.
    */

    const heading =
      project.querySelector("h3");

    const paragraph =
      project.querySelector(".project-meta p");


    lightboxImage.src =
      image.currentSrc ||
      image.src;

    lightboxImage.alt =
      image.alt || "";


    title.textContent =
      heading
        ? heading.textContent.trim()
        : "Referensarbete";


    location.textContent =
      paragraph
        ? paragraph.textContent.trim()
        : "";


    box.classList.add("open");

    document.body.classList.add(
      "lightbox-open"
    );


    /*
      Fokus på stäng-knappen för
      bättre tillgänglighet.
    */

    box.querySelector(
      ".lightbox-close"
    ).focus();

  }


  function closeLightbox() {

    if (!lightbox) return;

    lightbox.classList.remove("open");

    document.body.classList.remove(
      "lightbox-open"
    );

  }

});
