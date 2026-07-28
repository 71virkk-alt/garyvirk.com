export type AttachmentMetadata = {
  name: string;
  size: number;
};

export type AttachmentValidation = {
  valid: boolean;
  validationMessage: string;
  status: string;
};

export const maximumAttachmentBytes = 10 * 1024 * 1024;
export const allowedAttachmentExtensions = new Set([
  "pdf",
  "doc",
  "docx",
  "txt",
  "png",
  "jpg",
  "jpeg"
]);

export function validateAttachmentMetadata(
  file: AttachmentMetadata | null | undefined
): AttachmentValidation {
  if (!file) {
    return { valid: true, validationMessage: "", status: "" };
  }

  const extension = file.name.toLowerCase().split(".").pop();
  if (!extension || !allowedAttachmentExtensions.has(extension)) {
    return {
      valid: false,
      validationMessage: "Choose a PDF, DOC, DOCX, TXT, PNG, or JPG file.",
      status: `${file.name} is not an accepted file type.`
    };
  }

  if (file.size > maximumAttachmentBytes) {
    return {
      valid: false,
      validationMessage: "Choose a file smaller than 10 MB.",
      status: `${file.name} is larger than 10 MB.`
    };
  }

  const sizeLabel =
    file.size < 1024 * 1024
      ? `${Math.max(1, Math.ceil(file.size / 1024))} KB`
      : `${(file.size / 1024 / 1024).toFixed(1)} MB`;

  return {
    valid: true,
    validationMessage: "",
    status: `${file.name} · ${sizeLabel}`
  };
}
