import { ValidationResult } from "@/types";

// Configuration for file validation
export const FILE_VALIDATION_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
  allowedMimeTypes: ["application/pdf"],
  allowedExtensions: [".pdf"]
};

/**
 * Validates if a file is a valid PDF file
 */
export function validatePDFFile(file: File | null): ValidationResult {
  // Check if file exists
  if (!file) {
    return {
      isValid: false,
      error: {
        type: "file-missing",
        message: "Please select a file"
      }
    };
  }

  // Check file type by MIME type
  if (!FILE_VALIDATION_CONFIG.allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: {
        type: "file-type",
        message: "Only PDF files are allowed. Please select a PDF file."
      }
    };
  }

  // Check file extension as backup
  const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

  if (!FILE_VALIDATION_CONFIG.allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: {
        type: "file-type",
        message: "File must have a .pdf extension."
      }
    };
  }

  // Check file size
  if (file.size > FILE_VALIDATION_CONFIG.maxFileSize) {
    const maxSizeMB = FILE_VALIDATION_CONFIG.maxFileSize / (1024 * 1024);
    const currentSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    return {
      isValid: false,
      error: {
        type: "file-size",
        message: `File size must be less than ${maxSizeMB}MB. Current file is ${currentSizeMB}MB.`
      }
    };
  }

  return { isValid: true };
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
