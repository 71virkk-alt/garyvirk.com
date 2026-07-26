const root = document.documentElement;
const header = document.querySelector<HTMLElement>("[data-site-header]");
const menuButton = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const menu = document.querySelector<HTMLElement>("[data-menu]");

function closeMenu() {
  if (!menuButton || !menu) return;
  menuButton.setAttribute("aria-expanded", "false");
  menu.removeAttribute("data-open");
  menu.inert = window.innerWidth <= 820;
  document.body.classList.remove("menu-open");
}

if (menuButton && menu) {
  menu.inert = window.innerWidth <= 820;

  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    menu.toggleAttribute("data-open", !open);
    menu.inert = open;
    document.body.classList.toggle("menu-open", !open);
  });

  menu.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).closest("a")) closeMenu();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeMenu();
      menu.inert = false;
    } else if (!menu.hasAttribute("data-open")) {
      menu.inert = true;
    }
  });
}

function updateHeader() {
  header?.toggleAttribute("data-scrolled", window.scrollY > 16);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (revealItems.length && "IntersectionObserver" in window && !reduceMotion) {
  root.classList.add("reveal-ready");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).setAttribute("data-visible", "");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.setAttribute("data-visible", ""));
}

document.querySelector<HTMLElement>("[data-print]")?.addEventListener("click", () => {
  window.print();
});
