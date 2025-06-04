"use client";

import { useState } from "react";
import { DropZone } from "@/components/ui/DropZone";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FileInput } from "@/components/ui/FileInput";
import { UploadProgressDisplay } from "@/components/ui/UploadProgressDisplay";
import { usePDFWorker } from "@/hooks/usePDFWorker";
import { useUploadProgress } from "@/hooks/useUploadProgress";
import { formatFileSize, validatePDFFile } from "@/lib/fileValidation";
import { cn } from "@/lib/utils";
import { ValidationError } from "@/types";
import { PDFWorkerStatus } from "./PDFWorkerStatus";

interface Props {
  onFileProcessed: (file: File) => void;
}

export function UploadInterface({ onFileProcessed }: Props) {
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"browse" | "drag">("browse");
  const { uploadState, simulateUpload, simulateProcessing, reset } = useUploadProgress();
  const { isReady: pdfWorkerReady } = usePDFWorker();
  const isUploading = uploadState.progress.phase === "uploading" || uploadState.progress.phase === "processing";

  const getUploadMethodClass = (isSelected: boolean) =>
    cn(
      "px-4 py-2 rounded-md text-sm font-medium transition-colors",
      isSelected ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      isUploading && "opacity-50 cursor-not-allowed"
    );

  // Handle when PDF worker is ready
  const handleWorkerReady = () => {
    console.log("PDF Worker is ready for processing");
  };

  const handleFileSelect = (file: File) => {
    // Check if PDF worker is ready
    if (!pdfWorkerReady) {
      setValidationError({
        type: "file-missing",
        message: "PDF processor is not ready. Please wait for initialization to complete."
      });

      return;
    }

    setValidationError(null);
    reset(); // Clear any previous upload state

    // Validate the file
    const validation = validatePDFFile(file);

    if (!validation.isValid && validation.error) {
      setValidationError(validation.error);

      return;
    }

    // File is valid, start upload simulation
    simulateUpload(file, () => {
      // After upload completes, start processing simulation
      simulateProcessing([
        { name: "Extracting text", duration: 30 },
        { name: "Analyzing content", duration: 20 },
        { name: "Preparing for quiz generation", duration: 10 }
      ]);

      // Notify parent that file is ready for processing
      onFileProcessed(file);
    });
  };

  const handleErrorDismiss = () => {
    setValidationError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* PDF Worker Status */}
      <PDFWorkerStatus onWorkerReady={handleWorkerReady} />

      {/* Upload Method Toggle */}
      <div className="flex justify-center">
        <div className="bg-muted rounded-lg p-1 flex">
          <button
            onClick={() => setUploadMethod("browse")}
            disabled={isUploading}
            className={getUploadMethodClass(uploadMethod === "browse")}
          >
            Browse Files
          </button>
          <button
            onClick={() => setUploadMethod("drag")}
            disabled={isUploading}
            className={getUploadMethodClass(uploadMethod === "drag")}
          >
            Drag & Drop
          </button>
        </div>
      </div>

      {/* Upload Interface */}
      {uploadMethod === "browse" ? (
        <FileInput onFileSelect={handleFileSelect} disabled={isUploading} />
      ) : (
        <DropZone onFileSelect={handleFileSelect} disabled={isUploading} />
      )}

      {/* Validation Rules */}
      {uploadState.progress.phase === "idle" && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">File Requirements:</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• File format: PDF only</li>
            <li>• Maximum size: 10MB</li>
            <li>• Text-based PDFs work best for quiz generation</li>
          </ul>
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <ErrorMessage type="error" message={validationError.message} onDismiss={handleErrorDismiss} />
      )}

      {/* Upload Progress */}
      {uploadState.progress.phase !== "idle" && (
        <UploadProgressDisplay
          progress={uploadState.progress}
          fileName={uploadState.file?.name}
          fileSize={uploadState.file?.size}
          uploadSpeed={uploadState.progress.uploadSpeed}
          timeRemaining={uploadState.progress.timeRemaining}
        />
      )}

      {/* Completion State */}
      {uploadState.progress.phase === "complete" && uploadState.file && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Ready for quiz generation</p>
              <p className="text-xs text-green-600">
                {uploadState.file.name} • {formatFileSize(uploadState.file.size)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {uploadState.progress.phase === "error" && uploadState.error && (
        <ErrorMessage type="error" message={uploadState.error} onDismiss={() => reset()} />
      )}
    </div>
  );
}
