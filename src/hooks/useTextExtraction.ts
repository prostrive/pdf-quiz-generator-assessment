import { useState, useCallback } from "react";
import { extractTextFromAllPages, getPDFInfo, validateExtractedText } from "@/lib/pdfTextExtraction";
import { MultiPageExtractedText, TextExtractionResult, TextExtractionState } from "@/types";

/**
 * Hook to manage PDF text extraction
 * Handles extracting text from PDF files and validating the results
 */
export function useTextExtraction() {
  const [state, setState] = useState<TextExtractionState>({
    isExtracting: false,
    error: null,
    pdfInfo: null,
    extractedText: null,
    multiPageText: null,
    validation: null
  });
  const isValidForQuiz = Boolean(
    state.multiPageText && state.validation?.isValid && state.validation.wordCount >= 50 // Minimum words needed for meaningful quiz
  );

  /**
   * Extract text from all pages of a PDF file
   */
  const extractText = useCallback(async (file: File): Promise<TextExtractionResult> => {
    console.log("🔄 Starting text extraction for file:", file.name, "Size:", file.size);
    setState(prev => ({
      ...prev,
      isExtracting: true,
      error: null,
      extractedText: null,
      multiPageText: null,
      validation: null
    }));

    try {
      // First, get PDF info
      console.log("📊 Getting PDF info...");
      const pdfInfo = await getPDFInfo(file);
      console.log("✅ PDF info retrieved:", pdfInfo);

      // Extract text from all pages
      console.log("📄 Extracting text from all pages...");
      const { fullText, pageTexts, pageCount } = await extractTextFromAllPages(file);
      console.log("✅ Text extraction completed. Full text length:", fullText.length);

      // Validate the extracted text
      const validation = validateExtractedText(fullText);

      // Create multi-page extracted text object
      const multiPageText: MultiPageExtractedText = {
        fullText,
        pageTexts,
        pageCount,
        totalWordCount: validation.wordCount,
        totalCharCount: validation.charCount
      };

      setState({
        isExtracting: false,
        error: null,
        pdfInfo,
        extractedText: null, // Single page text is not used with multi-page extraction
        multiPageText,
        validation
      });

      return {
        success: true,
        multiPageText
      };
    } catch (error) {
      console.error("❌ Text extraction failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error during text extraction";

      setState(prev => ({
        ...prev,
        isExtracting: false,
        error: errorMessage
      }));

      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);

  /**
   * Extract text from a specific page of a PDF file (for single-page extraction)
   */
  const extractTextFromSinglePage = useCallback(
    async (file: File, pageNumber: number = 1): Promise<TextExtractionResult> => {
      // Import here to avoid unused import warning when not used
      const { extractTextFromPage } = await import("@/lib/pdfTextExtraction");

      setState(prev => ({
        ...prev,
        isExtracting: true,
        error: null,
        extractedText: null,
        multiPageText: null,
        validation: null
      }));

      try {
        // First, get PDF info
        const pdfInfo = await getPDFInfo(file);

        // Extract text from the specified page
        const textContent = await extractTextFromPage(file, pageNumber);

        // Validate the extracted text
        const validation = validateExtractedText(textContent);

        // Create extracted text object
        const extractedText = {
          content: textContent,
          pageNumber,
          wordCount: validation.wordCount,
          charCount: validation.charCount
        };

        setState({
          isExtracting: false,
          error: null,
          pdfInfo,
          extractedText,
          multiPageText: null,
          validation
        });

        return {
          success: true,
          text: extractedText
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error during text extraction";

        setState(prev => ({
          ...prev,
          isExtracting: false,
          error: errorMessage
        }));

        return {
          success: false,
          error: errorMessage
        };
      }
    },
    []
  );

  /**
   * Reset the extraction state
   */
  const reset = useCallback(() => {
    setState({
      isExtracting: false,
      error: null,
      pdfInfo: null,
      extractedText: null,
      multiPageText: null,
      validation: null
    });
  }, []);

  return {
    ...state,
    extractText,
    extractTextFromSinglePage,
    reset,
    isValidForQuiz
  };
}
