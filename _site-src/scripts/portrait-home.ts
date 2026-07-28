export {};

const copyButton = document.querySelector<HTMLButtonElement>("[data-copy-email]");
const copyStatus = document.querySelector<HTMLElement>("[data-copy-status]");

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
