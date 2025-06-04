import { useState } from "react";
import { DropZone } from "@/components/ui/DropZone";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FileInput } from "@/components/ui/FileInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatFileSize, validatePDFFile } from "@/lib/fileValidation";
import { cn } from "@/lib/utils";
import { ValidationError } from "@/types";

interface Props {
  onFileValidated: (file: File) => void;
  isProcessing?: boolean;
  processingProgress?: number;
}

export function UploadInterface({ onFileValidated, isProcessing = false, processingProgress = 0 }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"browse" | "drag">("browse");

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setValidationError(null);

    // Validate the file
    const validation = validatePDFFile(file);

    if (!validation.isValid && validation.error) {
      setValidationError(validation.error);
      setSelectedFile(null);
      return;
    }

    // File is valid, notify parent
    onFileValidated(file);
  };

  const handleErrorDismiss = () => {
    setValidationError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Upload Method Toggle */}
      <div className="flex justify-center">
        <div className="bg-muted rounded-lg p-1 flex">
          <button
            onClick={() => setUploadMethod("browse")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              uploadMethod === "browse"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Browse Files
          </button>
          <button
            onClick={() => setUploadMethod("drag")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              uploadMethod === "drag"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Drag & Drop
          </button>
        </div>
      </div>

      {/* Upload Interface */}
      {uploadMethod === "browse" ? (
        <FileInput onFileSelect={handleFileSelect} disabled={isProcessing} />
      ) : (
        <DropZone onFileSelect={handleFileSelect} disabled={isProcessing} />
      )}

      {/* Validation Error */}
      {validationError && (
        <ErrorMessage type="error" message={validationError.message} onDismiss={handleErrorDismiss} />
      )}

      {/* Selected File Info */}
      {selectedFile && !validationError && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">File selected: {selectedFile.name}</p>
            <p className="text-xs text-green-600">Size: {formatFileSize(selectedFile.size)}</p>
          </div>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <LoadingSpinner size="small" />
            <span className="text-sm text-muted-foreground">Processing PDF file...</span>
          </div>

          {processingProgress > 0 && <ProgressBar progress={processingProgress} showPercentage />}
        </div>
      )}

      {/* Validation Rules */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">File Requirements:</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• File format: PDF only</li>
          <li>• Maximum size: 10MB</li>
          <li>• Text-based PDFs work best for quiz generation</li>
        </ul>
      </div>
    </div>
  );
}
