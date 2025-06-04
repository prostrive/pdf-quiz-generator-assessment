"use client";

import { useEffect } from "react";
import { usePDFWorker } from "@/hooks/usePDFWorker";
import { ErrorMessage } from "./ui/ErrorMessage";
import { LoadingSpinner } from "./ui/LoadingSpinner";

interface Props {
  onWorkerReady?: () => void;
}

/**
 * Component to display PDF worker initialization status
 * Shows loading state during initialization and any errors
 */
export function PDFWorkerStatus({ onWorkerReady }: Props) {
  const { isInitialized, isInitializing, error, isReady, config, reset } = usePDFWorker();

  // Notify parent when worker is ready
  useEffect(() => {
    if (isReady && onWorkerReady) {
      onWorkerReady();
    }
  }, [isReady, onWorkerReady]);

  if (isInitializing) {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <LoadingSpinner size="small" />
        <div className="text-sm text-blue-700">Initializing PDF processor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <ErrorMessage type="error" message={error} dismissible={false} />
        <button
          onClick={reset}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Retry Initialization
        </button>
      </div>
    );
  }

  if (isInitialized && config) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-green-800">PDF Processor Ready</span>
        </div>
        <div className="text-xs text-green-600">
          Version: {config.version} | Worker: {config.isConfigured ? "Configured" : "Not Configured"}
        </div>
      </div>
    );
  }

  return null;
}
