import { PDFInfo } from "@/types";
import { PDFWorkerError } from "./pdfWorker";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Dynamic import for PDF.js to avoid SSR issues
let pdfjsLib: typeof import("pdfjs-dist") | null = null;

/**
 * Load PDF.js library dynamically (client-side only)
 */
async function loadPDFJS() {
  if (!isBrowser) {
    throw new Error("PDF.js can only be loaded in browser environment");
  }

  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");

    // Configure the worker if not already configured
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
      console.log("✅ PDF.js worker configured with URL:", pdfjsLib.GlobalWorkerOptions.workerSrc);
    }
  }

  return pdfjsLib;
}

/**
 * Extract text from a single PDF page
 * @param file - The PDF file to extract text from
 * @param pageNumber - Page number to extract (1-indexed)
 * @returns Promise containing extracted text
 */
export async function extractTextFromPage(file: File, pageNumber: number = 1): Promise<string> {
  if (!isBrowser) {
    throw new PDFWorkerError("Text extraction can only be performed in browser environment");
  }

  try {
    const pdfjs = await loadPDFJS();

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    // Check if page number is valid
    if (pageNumber < 1 || pageNumber > pdf.numPages) {
      throw new PDFWorkerError(`Invalid page number: ${pageNumber}. PDF has ${pdf.numPages} pages.`);
    }

    // Get the specified page
    const page = await pdf.getPage(pageNumber);

    // Extract text content
    const textContent = await page.getTextContent();

    // Combine text items into a single string
    let extractedText = "";

    textContent.items.forEach(item => {
      if ("str" in item) {
        extractedText += item.str;

        // Add space after text item if it doesn't end with whitespace
        if (item.str && !item.str.endsWith(" ")) {
          extractedText += " ";
        }
      }
    });

    // Clean up the extracted text
    return cleanupExtractedText(extractedText);
  } catch (error) {
    if (error instanceof PDFWorkerError) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new PDFWorkerError(`Failed to extract text from PDF page ${pageNumber}: ${errorMessage}`);
  }
}

/**
 * Extract text from all pages of a PDF file
 * @param file - The PDF file to extract text from
 * @returns Promise containing extracted text from all pages
 */
export async function extractTextFromAllPages(file: File): Promise<{
  fullText: string;
  pageTexts: string[];
  pageCount: number;
}> {
  if (!isBrowser) {
    throw new PDFWorkerError("Text extraction can only be performed in browser environment");
  }

  try {
    console.log("🔍 Starting multi-page text extraction for file:", file.name);
    const pdfjs = await loadPDFJS();
    console.log("✅ PDF.js loaded successfully");

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log("✅ File converted to ArrayBuffer, size:", arrayBuffer.byteLength);

    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    console.log("✅ PDF document loaded, pages:", pdf.numPages);
    const pageCount = pdf.numPages;
    const pageTexts: string[] = [];

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        // Get the current page
        const page = await pdf.getPage(pageNum);

        // Extract text content
        const textContent = await page.getTextContent();

        // Combine text items into a single string for this page
        let pageText = "";

        textContent.items.forEach(item => {
          if ("str" in item) {
            pageText += item.str;

            // Add space after text item if it doesn't end with whitespace
            if (item.str && !item.str.endsWith(" ")) {
              pageText += " ";
            }
          }
        });

        // Clean up the extracted text for this page
        const cleanedPageText = cleanupExtractedText(pageText);
        pageTexts.push(cleanedPageText);
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        // Add empty string for failed pages to maintain page indexing
        pageTexts.push("");
      }
    }

    // Combine all page texts with page breaks
    const fullText = pageTexts
      .filter(text => text.trim().length > 0) // Remove empty pages
      .join("\n\n--- Page Break ---\n\n");

    // Clean up the full text
    const cleanedFullText = cleanupExtractedText(fullText);

    return {
      fullText: cleanedFullText,
      pageTexts,
      pageCount
    };
  } catch (error) {
    console.error("❌ Error during multi-page text extraction:", error);

    if (error instanceof PDFWorkerError) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new PDFWorkerError(`Failed to extract text from PDF: ${errorMessage}`);
  }
}

/**
 * Get basic information about a PDF file
 * @param file - The PDF file to analyze
 * @returns Promise containing PDF metadata
 */
export async function getPDFInfo(file: File): Promise<PDFInfo> {
  if (!isBrowser) {
    throw new PDFWorkerError("PDF info extraction can only be performed in browser environment");
  }

  try {
    const pdfjs = await loadPDFJS();

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise; // Get metadata
    const metadata = await pdf.getMetadata();
    const info = (metadata.info || {}) as Record<string, string>;

    const result: PDFInfo = {
      numPages: pdf.numPages,
      fileName: file.name,
      fileSize: file.size
    };

    if (info.Title) {
      result.title = info.Title;
    }

    if (info.Author) {
      result.author = info.Author;
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new PDFWorkerError(`Failed to get PDF info: ${errorMessage}`);
  }
}

/**
 * Clean up extracted text by removing excessive whitespace and formatting issues
 * @param text - Raw extracted text
 * @returns Cleaned text
 */
function cleanupExtractedText(text: string): string {
  return (
    text
      // Replace multiple spaces with single space
      .replace(/\s+/g, " ")
      // Remove leading and trailing whitespace
      .trim()
      // Remove excessive line breaks
      .replace(/\n\s*\n/g, "\n")
      // Ensure sentences end with proper punctuation spacing
      .replace(/([.!?])\s*([A-Z])/g, "$1 $2")
  );
}

/**
 * Validate that text extraction was successful
 * @param text - Extracted text to validate
 * @returns Validation result
 */
export function validateExtractedText(text: string): {
  isValid: boolean;
  wordCount: number;
  charCount: number;
  issues: string[];
} {
  const issues: string[] = [];
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;

  if (charCount === 0) {
    issues.push("No text extracted from PDF");
  } else if (charCount < 100) {
    issues.push("Very little text extracted - PDF may be image-based or scanned");
  } else if (wordCount < 20) {
    issues.push("Low word count - may not be sufficient for quiz generation");
  }

  // Check for excessive repeated characters (indicates OCR issues)
  const repeatedCharPattern = /(.)\1{10,}/;

  if (repeatedCharPattern.test(text)) {
    issues.push("Text contains excessive repeated characters - may indicate processing issues");
  }

  return {
    isValid: issues.length === 0,
    wordCount,
    charCount,
    issues
  };
}
