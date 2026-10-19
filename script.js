document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const brand = document.querySelector(".brand");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sections = ["hem", "tjanster", "sa-jobbar-jag", "om", "aktuellt", "kontakt"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const contactSection = document.getElementById("kontakt");

  let scrollTicking = false;

  // Mjuk scroll bara när besökaren inte valt minskad rörelse
  const scrollBehavior = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  function getHeaderHeight() {
    return header ? header.getBoundingClientRect().height : 0;
  }

  function updateActiveSection() {
    if (!sections.length) return;

    const scrollPosition = window.scrollY + getHeaderHeight() + 30;
    let activeSection = sections[0];

    for (const section of sections) {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      if (sectionTop <= scrollPosition) activeSection = section;
    }

    const atPageBottom =
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 5;

    if (atPageBottom && contactSection) activeSection = contactSection;

    navLinks.forEach((link) => {
      const active = link.dataset.section === activeSection.id;
      link.classList.toggle("active", active);

      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function scrollToSection(target) {
    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      getHeaderHeight();

    window.scrollTo({
      top: Math.max(0, top),
      behavior: scrollBehavior()
    });
  }

  brand?.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const target = targetId ? document.querySelector(targetId) : null;
      if (!target) return;

      event.preventDefault();
      navLinks.forEach((navLink) => {
        navLink.classList.remove("active");
        navLink.removeAttribute("aria-current");
      });
      scrollToSection(target);
    });
  });

  updateActiveSection();

  // Cross-page hash navigation: wait until the destination page has completed
  // layout, then align the target once without competing smooth-scroll calls.
  if (window.location.hash) {
    let hashTarget = null;
    try { hashTarget = document.querySelector(window.location.hash); } catch (_) {}
    if (hashTarget) {
      const alignHashTarget = () => {
        const top = hashTarget.getBoundingClientRect().top + window.scrollY - getHeaderHeight();
        window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
      };
      const alignAfterLayout = () => {
        requestAnimationFrame(() => requestAnimationFrame(alignHashTarget));
        window.setTimeout(alignHashTarget, 180);
        window.setTimeout(alignHashTarget, 500);
      };
      if (document.readyState === "complete") alignAfterLayout();
      else window.addEventListener("load", alignAfterLayout, { once: true });
    }
  }

  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) return;

      scrollTicking = true;
      window.requestAnimationFrame(() => {
        updateActiveSection();
        scrollTicking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", updateActiveSection);
  window.addEventListener("load", updateActiveSection);
});
