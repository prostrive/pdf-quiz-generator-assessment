import { ValidationResult } from "@/types";

// Configuration for file validation
export const FILE_VALIDATION_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
  allowedMimeTypes: ["application/pdf"],
  allowedExtensions: [".pdf"],
  // PDF magic bytes for file signature validation
  pdfSignatures: [
    [0x25, 0x50, 0x44, 0x46] // %PDF
  ]
};

/**
 * Validates file signature by checking magic bytes
 */
async function validatePDFSignature(file: File): Promise<boolean> {
  try {
    // Read first 4 bytes to check for PDF signature
    const buffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check for %PDF signature
    const pdfSignature = FILE_VALIDATION_CONFIG.pdfSignatures[0];

    for (let i = 0; i < pdfSignature.length; i++) {
      if (bytes[i] !== pdfSignature[i]) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error validating PDF signature:", error);
    return false;
  }
}

/**
 * Validates MIME type with additional checks for spoofed files
 */
function validateMimeTypeWithFallback(file: File): { isValid: boolean; trusted: boolean } {
  // Check declared MIME type
  const declaredMimeValid = FILE_VALIDATION_CONFIG.allowedMimeTypes.includes(file.type);

  // Handle cases where MIME type might be missing or incorrect
  if (!file.type || file.type === "application/octet-stream") {
    // MIME type is missing or generic, we'll rely on extension and signature
    return { isValid: false, trusted: false };
  }

  return { isValid: declaredMimeValid, trusted: true };
}

/**
 * Enhanced file extension validation
 */
function validateFileExtension(fileName: string): { isValid: boolean; extension: string } {
  const parts = fileName.toLowerCase().split(".");

  if (parts.length < 2) {
    return { isValid: false, extension: "" };
  }

  const extension = "." + parts[parts.length - 1];
  const isValid = FILE_VALIDATION_CONFIG.allowedExtensions.includes(extension);

  return { isValid, extension };
}

/**
 * Advanced PDF validation that checks for common corruption patterns
 */
async function validatePDFStructure(file: File): Promise<{ isValid: boolean; issues: string[] }> {
  try {
    // Read first 1KB to check PDF structure
    const buffer = await file.slice(0, 1024).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const header = new TextDecoder().decode(bytes.slice(0, 100));

    const issues: string[] = [];

    // Check for PDF version
    const versionMatch = header.match(/%PDF-(\d+\.\d+)/);
    if (!versionMatch) {
      issues.push("PDF version header not found or corrupted");
    } else {
      const version = parseFloat(versionMatch[1]);
      if (version < 1.3) {
        issues.push("PDF version is very old and may not be compatible");
      }
      if (version > 2.0) {
        issues.push("PDF version is newer than expected");
      }
    }

    // Check for null bytes in header (corruption indicator)
    const headerBytes = bytes.slice(0, 50);
    let nullByteCount = 0;
    for (let i = 0; i < headerBytes.length; i++) {
      if (headerBytes[i] === 0) nullByteCount++;
    }

    if (nullByteCount > 5) {
      issues.push("File appears to be corrupted (excessive null bytes in header)");
    }

    // Check if file ends properly (read last 256 bytes)
    if (file.size > 256) {
      const endBuffer = await file.slice(-256).arrayBuffer();
      const endText = new TextDecoder().decode(new Uint8Array(endBuffer));

      if (!endText.includes("%%EOF")) {
        issues.push("PDF file may be truncated or corrupted (missing EOF marker)");
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  } catch (error) {
    console.warn("PDF structure validation failed:", error);
    return {
      isValid: false,
      issues: ["Failed to validate PDF structure"]
    };
  }
}

/**
 * Validates if a file is a valid PDF file with comprehensive checks
 */
export async function validatePDFFile(file: File | null): Promise<ValidationResult> {
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

  // Check file extension first
  const extensionValidation = validateFileExtension(file.name);

  if (!extensionValidation.isValid) {
    return {
      isValid: false,
      error: {
        type: "file-type",
        message: `File must have a .pdf extension. Found: ${extensionValidation.extension || "no extension"}`
      }
    };
  }

  // Check MIME type with fallback handling
  const mimeValidation = validateMimeTypeWithFallback(file);

  if (!mimeValidation.isValid && mimeValidation.trusted) {
    return {
      isValid: false,
      error: {
        type: "file-type",
        message: `Invalid file type detected: ${file.type}. Only PDF files are allowed.`
      }
    };
  }

  // For untrusted MIME types or missing MIME types, validate file signature
  if (!mimeValidation.trusted || !mimeValidation.isValid) {
    const signatureValid = await validatePDFSignature(file);

    if (!signatureValid) {
      return {
        isValid: false,
        error: {
          type: "file-type",
          message:
            "File does not appear to be a valid PDF. The file may be corrupted, renamed, or not a genuine PDF file."
        }
      };
    }
  }

  // Perform advanced PDF structure validation
  const structureValidation = await validatePDFStructure(file);

  if (!structureValidation.isValid) {
    return {
      isValid: false,
      error: {
        type: "file-type",
        message: `PDF file appears to be corrupted: ${structureValidation.issues.join(", ")}`
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

  // Check for zero-byte files
  if (file.size === 0) {
    return {
      isValid: false,
      error: {
        type: "file-type",
        message: "The selected file is empty. Please select a valid PDF file."
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

/**
 * Check if file name contains suspicious patterns that might indicate it's not a real PDF
 */
function detectSuspiciousFileName(fileName: string): string[] {
  const suspiciousPatterns = [
    /\.exe\.pdf$/i,
    /\.zip\.pdf$/i,
    /\.rar\.pdf$/i,
    /\.doc\.pdf$/i,
    /\.docx\.pdf$/i,
    /\.txt\.pdf$/i
  ];

  const warnings: string[] = [];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fileName)) {
      warnings.push("File name suggests it may have been renamed from another format");

      break;
    }
  }

  return warnings;
}

/**
 * Perform comprehensive PDF file validation
 */
export async function validatePDFFileComprehensive(
  file: File | null
): Promise<ValidationResult & { warnings?: string[] }> {
  const baseValidation = await validatePDFFile(file);

  if (!baseValidation.isValid || !file) {
    return baseValidation;
  }

  // Additional checks for enhanced validation
  const warnings: string[] = [];

  // Check for suspicious file names
  const nameWarnings = detectSuspiciousFileName(file.name);
  warnings.push(...nameWarnings);

  // Check if file size is suspiciously small for a PDF
  if (file.size < 1024) {
    // Less than 1KB
    warnings.push("File size is unusually small for a PDF document");
  }

  // Check if file size is larger than typical for quiz generation
  if (file.size > 5 * 1024 * 1024) {
    // Larger than 5MB
    warnings.push("Large file size may result in slower processing");
  }

  // Perform advanced PDF structure validation
  const structureValidation = await validatePDFStructure(file);

  if (!structureValidation.isValid) {
    warnings.push(...structureValidation.issues);
  }

  return {
    ...baseValidation,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
