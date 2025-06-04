import { useState, useEffect, useCallback } from "react";
import { initializePDFWorker, isPDFWorkerConfigured, getPDFWorkerConfig, PDFWorkerError } from "@/lib/pdfWorker";
import { PDFWorkerState } from "@/types";

/**
 * Hook to manage PDF.js worker initialization
 * Handles worker setup, loading states, and error handling
 */
export function usePDFWorker() {
  const [state, setState] = useState<PDFWorkerState>({
    isInitialized: false,
    isInitializing: false,
    error: null,
    config: null
  });
  const isReady = state.isInitialized && !state.error;

  /**
   * Initialize the PDF worker
   */
  const initialize = useCallback(async () => {
    // Don't reinitialize if already initialized or currently initializing
    if (state.isInitialized || state.isInitializing) return;

    setState(prev => ({
      ...prev,
      isInitializing: true,
      error: null
    }));

    try {
      await initializePDFWorker();
      const config = await getPDFWorkerConfig();

      setState({
        isInitialized: true,
        isInitializing: false,
        error: null,
        config
      });

      console.log("PDF Worker initialized successfully", config);
    } catch (error) {
      const pdfError =
        error instanceof PDFWorkerError
          ? error
          : new PDFWorkerError(
              error instanceof Error ? error.message : "Unknown error during PDF worker initialization"
            );

      const config = await getPDFWorkerConfig();
      setState({
        isInitialized: false,
        isInitializing: false,
        error: pdfError.message,
        config
      });

      console.error("PDF Worker initialization failed:", pdfError);
    }
  }, [state.isInitialized, state.isInitializing]);

  /**
   * Reset worker state (useful for retry scenarios)
   */
  const reset = useCallback(() => {
    setState({
      isInitialized: false,
      isInitializing: false,
      error: null,
      config: null
    });
  }, []);

  /**
   * Auto-initialize on mount
   */
  useEffect(() => {
    const checkAndInitialize = async () => {
      // Check if already configured (e.g., from a previous initialization)
      if (isPDFWorkerConfigured() && !state.isInitialized && !state.isInitializing) {
        const config = await getPDFWorkerConfig();
        setState(prev => ({
          ...prev,
          isInitialized: true,
          config
        }));
      } else if (!state.isInitialized && !state.isInitializing) {
        // Auto-initialize on mount
        initialize();
      }
    };

    checkAndInitialize();
  }, [initialize, state.isInitialized, state.isInitializing]);

  return {
    ...state,
    initialize,
    reset,
    isReady
  };
}
