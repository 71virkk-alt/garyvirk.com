export {};

const copyButton = document.querySelector<HTMLButtonElement>("[data-copy-email]");
const copyStatus = document.querySelector<HTMLElement>("[data-copy-status]");
const portrait = document.querySelector<HTMLElement>("[data-portrait]");
const contactForm = document.querySelector<HTMLFormElement>("[data-contact-form]");
const contactFile = document.querySelector<HTMLInputElement>("[data-contact-file]");
const contactFileStatus = document.querySelector<HTMLElement>("[data-contact-file-status]");
const contactMessage = document.querySelector<HTMLTextAreaElement>("[data-contact-message]");
const contactMessageCount = document.querySelector<HTMLElement>("[data-contact-message-count]");
const contactSubmit = document.querySelector<HTMLButtonElement>("[data-contact-submit]");
const contactSubmitLabel = document.querySelector<HTMLElement>("[data-contact-submit-label]");
const contactFormStatus = document.querySelector<HTMLElement>("[data-contact-form-status]");
const precisePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
);
const maximumAttachmentBytes = 10 * 1024 * 1024;

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

function updateMessageCount() {
  if (!contactMessage || !contactMessageCount) return;
  contactMessageCount.textContent = `${contactMessage.value.length} / ${contactMessage.maxLength}`;
}

function validateAttachment() {
  if (!contactFile || !contactFileStatus) return true;
  const file = contactFile.files?.[0];
  contactFile.setCustomValidity("");

  if (!file) {
    contactFileStatus.textContent = "";
    return true;
  }

  if (file.size > maximumAttachmentBytes) {
    contactFile.setCustomValidity("Choose a file smaller than 10 MB.");
    contactFileStatus.textContent = `${file.name} is larger than 10 MB.`;
    return false;
  }

  const sizeLabel =
    file.size < 1024 * 1024
      ? `${Math.max(1, Math.ceil(file.size / 1024))} KB`
      : `${(file.size / 1024 / 1024).toFixed(1)} MB`;
  contactFileStatus.textContent = `${file.name} · ${sizeLabel}`;
  return true;
}

function resetSubmitState() {
  if (contactSubmit) {
    contactSubmit.disabled = false;
    contactSubmit.removeAttribute("aria-busy");
  }
  if (contactSubmitLabel) contactSubmitLabel.textContent = "Send message";
  if (contactFormStatus) contactFormStatus.textContent = "";
}

contactMessage?.addEventListener("input", updateMessageCount);
contactFile?.addEventListener("change", validateAttachment);
contactForm?.addEventListener("submit", (event) => {
  if (!validateAttachment() || !contactForm.checkValidity()) {
    event.preventDefault();
    contactForm.reportValidity();
    if (contactFormStatus) {
      contactFormStatus.textContent = "Check the highlighted fields before sending.";
    }
    return;
  }

  if (contactSubmit) {
    contactSubmit.disabled = true;
    contactSubmit.setAttribute("aria-busy", "true");
  }
  if (contactSubmitLabel) contactSubmitLabel.textContent = "Sending";
  if (contactFormStatus) {
    contactFormStatus.textContent = "Sending your message...";
  }
});

window.addEventListener("pageshow", resetSubmitState);
updateMessageCount();
validateAttachment();

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
  const rotateY = (horizontal - 0.5) * 2.5;
  const rotateX = (0.5 - vertical) * 2.5;

  portrait.style.setProperty("--portrait-rotate-x", `${rotateX.toFixed(2)}deg`);
  portrait.style.setProperty("--portrait-rotate-y", `${rotateY.toFixed(2)}deg`);
  portrait.style.setProperty("--portrait-light-x", `${(horizontal * 100).toFixed(1)}%`);
  portrait.style.setProperty("--portrait-light-y", `${(vertical * 100).toFixed(1)}%`);
}

portrait?.addEventListener("pointermove", movePortrait);
portrait?.addEventListener("pointerleave", resetPortrait);
precisePointer.addEventListener("change", resetPortrait);
