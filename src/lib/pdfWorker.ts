// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Dynamic import for PDF.js to avoid SSR issues
let pdfjsLib: typeof import("pdfjs-dist") | null = null;

/**
 * Initialize PDF.js library dynamically (client-side only)
 */
async function loadPDFJS() {
  if (!isBrowser) {
    throw new Error("PDF.js can only be loaded in browser environment");
  }

  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
  }

  return pdfjsLib;
}

const getWorkerURL = () => {
  return "/pdf.worker.min.js";
};

/**
 * Initialize PDF.js worker
 * Must be called before any PDF processing operations
 */
export async function initializePDFWorker(): Promise<void> {
  if (!isBrowser) {
    throw new Error("PDF Worker can only be initialized in browser environment");
  }

  try {
    const pdfjs = await loadPDFJS();
    const WORKER_URL = getWorkerURL();

    // Set the worker source URL
    pdfjs.GlobalWorkerOptions.workerSrc = WORKER_URL;

    // Test worker initialization by creating a simple document loading task
    // This helps catch worker initialization errors early
    const testArrayBuffer = new ArrayBuffer(0);

    try {
      await pdfjs.getDocument({ data: testArrayBuffer }).promise;
    } catch (error: unknown) {
      // This is expected to fail with an empty buffer
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error && "name" in error ? error.name : "";

      // This is expected - worker is working correctly
      if (errorName === "InvalidPDFException" || errorMessage.includes("Invalid PDF")) return;

      if (errorMessage.includes("worker") || errorMessage.includes("Worker")) {
        // Worker initialization failed
        throw new Error(`PDF Worker initialization failed: ${errorMessage}`);
      }
    }
  } catch (error) {
    throw new PDFWorkerError(`Failed to configure PDF worker: ${error}`);
  }
}

/**
 * Check if PDF worker is properly configured
 */
export function isPDFWorkerConfigured(): boolean {
  if (!isBrowser || !pdfjsLib) {
    return false;
  }

  return !!pdfjsLib.GlobalWorkerOptions.workerSrc;
}

/**
 * Get current worker configuration
 */
export async function getPDFWorkerConfig() {
  if (!isBrowser) {
    return {
      workerSrc: null,
      version: null,
      isConfigured: false,
      browserEnvironment: false
    };
  }

  try {
    const pdfjs = pdfjsLib || (await loadPDFJS());

    return {
      workerSrc: pdfjs.GlobalWorkerOptions.workerSrc,
      version: pdfjs.version,
      isConfigured: isPDFWorkerConfigured(),
      browserEnvironment: true
    };
  } catch {
    return {
      workerSrc: null,
      version: null,
      isConfigured: false,
      browserEnvironment: true
    };
  }
}

/**
 * Error types for PDF worker operations
 */
export class PDFWorkerError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = "PDFWorkerError";
  }
}

/**
 * Utility function to handle worker-related errors gracefully
 */
export function handlePDFWorkerError(error: unknown): PDFWorkerError {
  if (error instanceof PDFWorkerError) {
    return error;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes("worker") || errorMessage.includes("Worker")) {
    return new PDFWorkerError(
      `PDF Worker Error: ${errorMessage}. Please check your internet connection and try again.`,
      error instanceof Error ? error : undefined
    );
  }

  return new PDFWorkerError(`PDF Processing Error: ${errorMessage}`, error instanceof Error ? error : undefined);
}
