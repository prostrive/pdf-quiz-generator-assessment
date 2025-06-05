import { useState, useCallback } from "react";
import { preprocessPDFContent, validatePreprocessedContent } from "@/lib/contentPreprocessing";
import { PreprocessedContent, ContentValidation, PreprocessingOptions } from "@/types";

/**
 * Hook to manage content preprocessing
 * Handles cleaning and optimizing extracted text for quiz generation
 */
export function useContentPreprocessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preprocessedContent, setPreprocessedContent] = useState<PreprocessedContent | null>(null);
  const [validation, setValidation] = useState<ContentValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isReadyForQuizGeneration = Boolean(preprocessedContent && validation?.isValid && !isProcessing && !error);

  /**
   * Preprocess extracted text content
   */
  const preprocessContent = useCallback(
    async (
      text: string,
      options?: PreprocessingOptions
    ): Promise<{
      success: boolean;
      content?: PreprocessedContent;
      validation?: ContentValidation;
      error?: string;
    }> => {
      setIsProcessing(true);
      setError(null);
      setPreprocessedContent(null);
      setValidation(null);

      try {
        console.log("🔄 Starting content preprocessing...");
        console.log("📊 Original text length:", text.length);

        // Preprocess the content
        const processed = preprocessPDFContent(text, options);
        console.log("✅ Content preprocessed:", {
          originalLength: processed.originalLength,
          cleanedLength: processed.cleanedLength,
          removedSections: processed.removedSections,
          estimatedTokens: processed.estimatedTokens
        });

        // Validate the preprocessed content
        const validation = validatePreprocessedContent(processed);
        console.log("🔍 Content validation:", validation);

        setPreprocessedContent(processed);
        setValidation(validation);
        setIsProcessing(false);

        return {
          success: true,
          content: processed,
          validation
        };
      } catch (error) {
        console.error("❌ Content preprocessing failed:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown preprocessing error";

        setError(errorMessage);
        setIsProcessing(false);

        return {
          success: false,
          error: errorMessage
        };
      }
    },
    []
  );

  /**
   * Reset preprocessing state
   */
  const reset = useCallback(() => {
    setIsProcessing(false);
    setPreprocessedContent(null);
    setValidation(null);
    setError(null);
  }, []);

  return {
    isProcessing,
    preprocessedContent,
    validation,
    error,
    preprocessContent,
    reset,
    isReadyForQuizGeneration
  };
}
