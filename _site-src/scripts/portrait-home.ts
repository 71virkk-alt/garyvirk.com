export {};

const shell = document.querySelector<HTMLElement>("[data-portfolio-shell]");
const navigation = document.querySelector<HTMLElement>("[data-view-navigation]");
const viewButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-view-target]")
);
const viewPanels = Array.from(
  document.querySelectorAll<HTMLElement>("[data-view-panel]")
);
const currentView = document.querySelector<HTMLElement>("[data-current-view]");
const portrait = document.querySelector<HTMLElement>("[data-portrait-frame]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const viewOrder = ["about", "work", "experience", "credentials"] as const;

type ViewName = (typeof viewOrder)[number];

function isViewName(value: string | null): value is ViewName {
  return viewOrder.includes(value as ViewName);
}

function setView(view: ViewName, updateHistory = true) {
  if (!shell) return;

  shell.dataset.activeView = view;

  viewButtons.forEach((button) => {
    const active = button.dataset.viewTarget === view;
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });

  viewPanels.forEach((panel) => {
    const active = panel.dataset.viewPanel === view;
    panel.toggleAttribute("data-active", active);
    panel.setAttribute("aria-hidden", String(!active));
    panel.inert = !active;
  });

  const index = viewOrder.indexOf(view) + 1;
  if (currentView) currentView.textContent = String(index).padStart(2, "0");

  if (updateHistory) {
    const nextUrl = view === "about" ? window.location.pathname : `#${view}`;
    window.history.replaceState(null, "", nextUrl);
  }
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.viewTarget ?? null;
    if (isViewName(view)) setView(view);
  });
});

navigation?.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

  const activeIndex = viewButtons.findIndex(
    (button) => button.getAttribute("aria-current") === "page"
  );
  const direction = event.key === "ArrowRight" ? 1 : -1;
  const nextIndex = (activeIndex + direction + viewButtons.length) % viewButtons.length;
  const nextButton = viewButtons[nextIndex];
  const view = nextButton?.dataset.viewTarget ?? null;

  if (isViewName(view)) {
    event.preventDefault();
    setView(view);
    nextButton.focus();
  }
});

const initialView = window.location.hash.slice(1);
setView(isViewName(initialView) ? initialView : "about", false);

if (portrait && precisePointer && !reduceMotion) {
  portrait.addEventListener("pointerenter", () => {
    portrait.setAttribute("data-engaged", "");
  });

  portrait.addEventListener("pointermove", (event) => {
    portrait.setAttribute("data-engaged", "");
    const bounds = portrait.getBoundingClientRect();
    const x = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left));
    const y = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top));
    const normalizedX = x / bounds.width - 0.5;
    const normalizedY = y / bounds.height - 0.5;

    portrait.style.setProperty("--pointer-x", `${x}px`);
    portrait.style.setProperty("--pointer-y", `${y}px`);
    portrait.style.setProperty("--shift-x", `${normalizedX * -7}px`);
    portrait.style.setProperty("--shift-y", `${normalizedY * -5}px`);
  });

  portrait.addEventListener("pointerleave", () => {
    portrait.removeAttribute("data-engaged");
    portrait.style.setProperty("--shift-x", "0px");
    portrait.style.setProperty("--shift-y", "0px");
  });
}
