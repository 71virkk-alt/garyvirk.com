const root = document.documentElement;
const header = document.querySelector<HTMLElement>("[data-site-header]");
const menuButton = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const menu = document.querySelector<HTMLElement>("[data-menu]");
const signalJourney = document.querySelector<HTMLElement>("[data-signal-journey]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  if (!header || !signalJourney) return;
  const signalBounds = signalJourney.getBoundingClientRect();
  const insideSignal = signalBounds.top < header.offsetHeight && signalBounds.bottom > header.offsetHeight;
  header.toggleAttribute("data-signal-zone", insideSignal);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const signalPanels = Array.from(
  document.querySelectorAll<HTMLElement>("[data-signal-panel]")
);
const signalNavButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-signal-nav]")
);

function setSignalScene(scene: number) {
  if (!signalJourney || reduceMotion) return;
  const normalizedScene = Math.max(0, Math.min(2, scene));
  signalJourney.dataset.scene = String(normalizedScene);

  signalPanels.forEach((panel) => {
    const active = Number(panel.dataset.signalPanel) === normalizedScene;
    panel.toggleAttribute("data-active", active);
    panel.setAttribute("aria-hidden", String(!active));
    panel.inert = !active;
  });

  signalNavButtons.forEach((button) => {
    if (Number(button.dataset.signalNav) === normalizedScene) {
      button.setAttribute("aria-current", "step");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

if (signalJourney) {
  if (reduceMotion) {
    signalJourney.setAttribute("data-reduced-motion", "");
    signalPanels.forEach((panel) => {
      panel.removeAttribute("aria-hidden");
      panel.inert = false;
      panel.setAttribute("data-active", "");
    });
  } else {
    setSignalScene(0);
    window.addEventListener("living-signal:state", (event) => {
      const detail = (event as CustomEvent<{ scene?: number }>).detail;
      if (typeof detail?.scene === "number") setSignalScene(detail.scene);
    });

    signalNavButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const scene = Number(button.dataset.signalNav);
        const bounds = signalJourney.getBoundingClientRect();
        const journeyTop = window.scrollY + bounds.top;
        const travel = Math.max(1, signalJourney.offsetHeight - window.innerHeight);
        window.scrollTo({
          top: journeyTop + travel * (scene / 2),
          behavior: "smooth"
        });
      });
    });
  }
}

const capabilitySystem = document.querySelector<HTMLElement>("[data-capability-system]");
const capabilityRows = Array.from(
  document.querySelectorAll<HTMLElement>("[data-capability]")
);

function setCapability(index: number) {
  if (!capabilitySystem) return;
  capabilitySystem.dataset.activeCapability = String(index);
  const counter = capabilitySystem.querySelector<HTMLElement>(".capability-orbit__core b");
  if (counter) counter.textContent = String(index + 1).padStart(2, "0");
}

capabilityRows.forEach((row) => {
  const activate = () => setCapability(Number(row.dataset.capability ?? 0));
  row.addEventListener("pointerenter", activate);
  row.addEventListener("focus", activate);
});

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
