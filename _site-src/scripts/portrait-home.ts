export {};

const copyButton = document.querySelector<HTMLButtonElement>("[data-copy-email]");
const copyStatus = document.querySelector<HTMLElement>("[data-copy-status]");
const portrait = document.querySelector<HTMLElement>("[data-portrait]");
const precisePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
);

function setCopyStatus(message: string) {
  if (copyStatus) copyStatus.textContent = message;
}

async function copyEmail() {
  const email = copyButton?.dataset.copyEmail;
  if (!copyButton || !email) return;

  try {
    await navigator.clipboard.writeText(email);
    copyButton.textContent = "Copied";
    setCopyStatus(`${email} copied to clipboard.`);
    window.setTimeout(() => {
      copyButton.textContent = "Copy";
    }, 2200);
  } catch {
    const selection = window.getSelection();
    const emailNode = document.querySelector<HTMLElement>(".contact-email strong");

    if (selection && emailNode) {
      const range = document.createRange();
      range.selectNodeContents(emailNode);
      selection.removeAllRanges();
      selection.addRange(range);
      emailNode.focus?.();
      setCopyStatus(`Copy unavailable. ${email} is selected.`);
    } else {
      setCopyStatus(`Copy unavailable. Email ${email}.`);
    }
  }
}

copyButton?.addEventListener("click", copyEmail);

function resetPortrait() {
  if (!portrait) return;
  portrait.style.setProperty("--portrait-rotate-x", "0deg");
  portrait.style.setProperty("--portrait-rotate-y", "0deg");
  portrait.style.setProperty("--portrait-light-x", "50%");
  portrait.style.setProperty("--portrait-light-y", "42%");
}

function movePortrait(event: PointerEvent) {
  if (!portrait || !precisePointer.matches) return;

  const bounds = portrait.getBoundingClientRect();
  const horizontal = (event.clientX - bounds.left) / bounds.width;
  const vertical = (event.clientY - bounds.top) / bounds.height;
  const rotateY = (horizontal - 0.5) * 4;
  const rotateX = (0.5 - vertical) * 4;

  portrait.style.setProperty("--portrait-rotate-x", `${rotateX.toFixed(2)}deg`);
  portrait.style.setProperty("--portrait-rotate-y", `${rotateY.toFixed(2)}deg`);
  portrait.style.setProperty("--portrait-light-x", `${(horizontal * 100).toFixed(1)}%`);
  portrait.style.setProperty("--portrait-light-y", `${(vertical * 100).toFixed(1)}%`);
}

portrait?.addEventListener("pointermove", movePortrait);
portrait?.addEventListener("pointerleave", resetPortrait);
precisePointer.addEventListener("change", resetPortrait);
