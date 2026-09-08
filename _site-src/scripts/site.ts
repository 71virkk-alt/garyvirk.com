export {};

const root = document.documentElement;
const header = document.querySelector<HTMLElement>("[data-site-header]");
const menuButton = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const menu = document.querySelector<HTMLElement>("[data-menu]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function closeMenu(returnFocus = false) {
  if (!menuButton || !menu) return;
  menuButton.setAttribute("aria-expanded", "false");
  menu.removeAttribute("data-open");
  menu.inert = window.innerWidth <= 820;
  document.body.classList.remove("menu-open");
  if (returnFocus) menuButton.focus();
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
    if (event.key === "Escape" && menu.hasAttribute("data-open")) closeMenu(true);
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

// Keep the original image and artifact link available without scripting.
const evidenceImages = document.querySelectorAll<HTMLImageElement>(".evidence-image img");
if (evidenceImages.length && typeof HTMLDialogElement !== "undefined") {
  const viewer = document.createElement("dialog");
  viewer.className = "evidence-viewer";
  viewer.setAttribute("aria-labelledby", "evidence-viewer-title");
  const toolbar = document.createElement("div");
  toolbar.className = "evidence-viewer-header";
  const title = document.createElement("p");
  title.id = "evidence-viewer-title";
  const close = document.createElement("button");
  close.className = "evidence-viewer-close";
  close.textContent = "Close";
  close.type = "button";
  const enlarged = document.createElement("img");
  toolbar.append(title, close);
  viewer.append(toolbar, enlarged);
  document.body.append(viewer);
  close.addEventListener("click", () => viewer.close());
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) {
      const box = viewer.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) viewer.close();
    }
  });
  evidenceImages.forEach((image) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "evidence-enlarge";
    button.textContent = "Enlarge ↗";
    const caption = image.closest("figure")?.querySelector("figcaption strong")?.textContent || image.alt;
    button.setAttribute("aria-label", `Enlarge ${caption}`);
    button.addEventListener("click", () => {
      title.textContent = caption;
      enlarged.src = image.currentSrc || image.src;
      enlarged.alt = image.alt;
      viewer.showModal();
      close.focus();
    });
    image.parentElement?.append(button);
  });
}
