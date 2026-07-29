import { validateAttachmentMetadata } from "./contact-validation";

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
const contactFallback = document.querySelector<HTMLAnchorElement>("[data-contact-fallback]");
const contactFallbackNote = document.querySelector<HTMLElement>("[data-contact-fallback-note]");
const precisePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
);
const contactServiceProbeTimeout = 5000;
let contactSubmissionPending = false;

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
  const result = validateAttachmentMetadata(contactFile.files?.[0]);
  contactFile.setCustomValidity(result.validationMessage);
  contactFileStatus.textContent = result.status;
  return result.valid;
}

function resetSubmitState() {
  contactSubmissionPending = false;
  if (contactSubmit) {
    contactSubmit.disabled = false;
    contactSubmit.removeAttribute("aria-busy");
  }
  if (contactSubmitLabel) contactSubmitLabel.textContent = "Send message";
  if (contactFormStatus) contactFormStatus.textContent = "";
  if (contactFallback) contactFallback.hidden = true;
  if (contactFallbackNote) contactFallbackNote.hidden = true;
}

function prepareEmailFallback() {
  if (!contactForm || !contactFallback) return;

  const firstName = contactForm.elements.namedItem("first_name");
  const lastName = contactForm.elements.namedItem("last_name");
  const senderEmail = contactForm.elements.namedItem("email");
  const message = contactForm.elements.namedItem("message");
  const recipient = contactFallback
    .getAttribute("href")
    ?.replace(/^mailto:/, "")
    .split("?")[0];

  if (
    !(firstName instanceof HTMLInputElement) ||
    !(lastName instanceof HTMLInputElement) ||
    !(senderEmail instanceof HTMLInputElement) ||
    !(message instanceof HTMLTextAreaElement) ||
    !recipient
  ) {
    return;
  }

  const senderName = `${firstName.value.trim()} ${lastName.value.trim()}`.trim();
  const query = new URLSearchParams({
    subject: `Portfolio message from ${senderName}`,
    body: [
      "Hello Gary,",
      "",
      message.value.trim(),
      "",
      `From: ${senderName}`,
      `Reply to: ${senderEmail.value.trim()}`,
      "Sent from: garyvirk.com"
    ].join("\n")
  });

  contactFallback.href = `mailto:${recipient}?${query.toString()}`;

  if (contactFallbackNote) {
    const attachmentName = contactFile?.files?.[0]?.name;
    contactFallbackNote.textContent = attachmentName
      ? `Your message is filled in. Add ${attachmentName} again in your email app.`
      : "Your message is filled in and ready to review before sending.";
  }
}

async function canReachContactService() {
  if (!contactForm) return false;
  if (typeof window.fetch !== "function" || typeof window.AbortController !== "function") {
    return true;
  }

  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), contactServiceProbeTimeout);

    try {
      await fetch(contactForm.action, {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-store",
        signal: controller.signal
      });
    } finally {
      window.clearTimeout(timeout);
    }
    return true;
  } catch {
    return false;
  }
}

function formIsReadyToSend() {
  if (!contactForm || !validateAttachment() || !contactForm.checkValidity()) {
    contactForm?.reportValidity();
    return false;
  }
  return true;
}

function markInvalidField(event: Event) {
  const field = event.target;
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
  field.setAttribute("aria-invalid", "true");
  if (contactFormStatus) {
    contactFormStatus.textContent = "Complete the required fields before sending.";
  }
}

function clearResolvedFieldError(event: Event) {
  const field = event.target;
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
  if (field.validity.valid) field.removeAttribute("aria-invalid");
}

contactMessage?.addEventListener("input", updateMessageCount);
contactFile?.addEventListener("change", validateAttachment);
contactForm?.addEventListener("invalid", markInvalidField, true);
contactForm?.addEventListener("input", clearResolvedFieldError);
contactForm?.addEventListener("change", clearResolvedFieldError);
contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (contactSubmissionPending) return;
  if (contactFallback) contactFallback.hidden = true;

  if (!formIsReadyToSend()) {
    if (contactFormStatus) {
      contactFormStatus.textContent = "Check the highlighted fields before sending.";
    }
    return;
  }

  contactSubmissionPending = true;
  if (contactSubmit) {
    contactSubmit.disabled = true;
    contactSubmit.setAttribute("aria-busy", "true");
  }
  if (contactSubmitLabel) contactSubmitLabel.textContent = "Sending";
  if (contactFormStatus) {
    contactFormStatus.textContent = "Sending your message...";
  }

  const serviceAvailable = await canReachContactService();
  if (!serviceAvailable) {
    resetSubmitState();
    if (contactFormStatus) {
      contactFormStatus.textContent = "Couldn’t send the form right now.";
    }
    prepareEmailFallback();
    if (contactFallback) contactFallback.hidden = false;
    if (contactFallbackNote) contactFallbackNote.hidden = false;
    return;
  }

  if (!formIsReadyToSend()) {
    resetSubmitState();
    if (contactFormStatus) {
      contactFormStatus.textContent = "The form changed before it was sent. Check the fields and try again.";
    }
    return;
  }

  HTMLFormElement.prototype.submit.call(contactForm);
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
