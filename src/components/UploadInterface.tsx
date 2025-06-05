"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useContentPreprocessing } from "@/hooks/useContentPreprocessing";
import { usePDFWorker } from "@/hooks/usePDFWorker";
import { useTextExtraction } from "@/hooks/useTextExtraction";
import { useUploadProgress } from "@/hooks/useUploadProgress";
import { FILE_VALIDATION_CONFIG, formatFileSize, validatePDFFile } from "@/lib/fileValidation";
import { cn } from "@/lib/utils";
import { MultiPageExtractedText, Quiz, PreprocessedContent as TPreprocessedContent, ValidationError } from "@/types";
import { OpenAIClientStatus } from "./OpenAIClientStatus";
import { PDFWorkerStatus } from "./PDFWorkerStatus";
import { QuizGenerationInterface } from "./QuizGenerationInterface";
import { DropZone } from "./ui/DropZone";
import { ErrorMessage } from "./ui/ErrorMessage";
import { FileInput } from "./ui/FileInput";
import { UploadProgressDisplay } from "./ui/UploadProgressDisplay";

interface PreprocessedContentProps {
  preprocessedContent: TPreprocessedContent;
  isContentReady: boolean;
}

interface TextExtractionResultProps {
  multiPageText: MultiPageExtractedText;
  isContentReady: boolean;
}

interface UploadInterfaceProps {
  onFileProcessed?: (file: File) => void;
}

interface ValidationIssueListProps {
  issues: string[];
  title: string;
}

function PreprocessedContent({ preprocessedContent, isContentReady }: PreprocessedContentProps) {
  const reducedPercentage = (
    (1 - preprocessedContent.cleanedLength / preprocessedContent.originalLength || 0) * 100
  ).toFixed(1);
  const textColor = isContentReady ? "text-green-700" : "text-yellow-700";
  const valueColor = isContentReady ? "text-green-600" : "text-yellow-600";
  const borderColor = isContentReady ? "border-green-200" : "border-yellow-200";

  return (
    <div className={cn("pt-2 border-t", borderColor)}>
      <h4 className={cn("text-xs font-semibold mb-2", textColor)}>Content Preprocessing</h4>
      <div className="grid grid-cols-3 gap-4 text-xs mb-3">
        <div>
          <span className={cn("font-medium", textColor)}>Content optimized:</span>
          <span className={cn("ml-1", valueColor)}>{reducedPercentage}% reduced</span>
        </div>
        <div>
          <span className={cn("font-medium", textColor)}>Estimated tokens:</span>
          <span className={cn("ml-1", valueColor)}>{preprocessedContent.estimatedTokens}</span>
        </div>
        <div>
          <span className={cn("font-medium", textColor)}>Sections removed:</span>
          <span className={cn("ml-1", valueColor)}>{preprocessedContent.removedSections}</span>
        </div>
      </div>
    </div>
  );
}

function TextExtractionResult({ multiPageText, isContentReady }: TextExtractionResultProps) {
  const textColor = isContentReady ? "text-green-700" : "text-yellow-700";
  const valueColor = isContentReady ? "text-green-600" : "text-yellow-600";

  return (
    <>
      <h4 className={cn("text-xs font-semibold mb-2", textColor)}>Text Extraction Results</h4>
      <div className="grid grid-cols-3 gap-4 text-xs mb-3">
        <div>
          <span className={cn("font-medium", textColor)}>Pages processed:</span>
          <span className={cn("ml-1", valueColor)}>{multiPageText.pageCount}</span>
        </div>
        <div>
          <span className={cn("font-medium", textColor)}>Words extracted:</span>
          <span className={cn("ml-1", valueColor)}>{multiPageText.totalWordCount}</span>
        </div>
        <div>
          <span className={cn("font-medium", textColor)}>Characters:</span>
          <span className={cn("ml-1", valueColor)}>{multiPageText.totalCharCount}</span>
        </div>
      </div>
    </>
  );
}

function ValidationIssueList({ issues, title }: ValidationIssueListProps) {
  return (
    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
      <p className="text-yellow-700 font-medium">{title}:</p>
      <ul className="mt-1 text-yellow-600 space-y-1">
        {issues.map((issue, index) => (
          <li key={index}>• {issue}</li>
        ))}
      </ul>
    </div>
  );
}

export function UploadInterface({ onFileProcessed }: UploadInterfaceProps) {
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"browse" | "drag">("browse");
  const { uploadState, simulateUpload, simulateProcessing, reset } = useUploadProgress();
  const { isReady: pdfWorkerReady } = usePDFWorker();
  const {
    extractText,
    isExtracting,
    multiPageText,
    validation: extractionValidation,
    error: extractionError
  } = useTextExtraction();
  const {
    preprocessContent,
    isProcessing: isPreprocessing,
    preprocessedContent,
    validation: preprocessingValidation,
    error: preprocessingError
  } = useContentPreprocessing();
  const isUploading = uploadState.progress.phase === "uploading" || uploadState.progress.phase === "processing";
  const isProcessing = isUploading || isExtracting || isPreprocessing;
  const isContentReady =
    uploadState.progress.phase === "complete" && !!preprocessedContent && !!preprocessingValidation?.isValid;

  const getUploadMethodClass = (isSelected: boolean) =>
    cn(
      "px-4 py-2 rounded-md text-sm font-medium transition-colors",
      isSelected
        ? "bg-background text-foreground shadow-sm hover:bg-background"
        : "text-muted-foreground hover:text-foreground",
      isProcessing && "opacity-50 cursor-not-allowed"
    );

  // Handle when PDF worker is ready
  const handleWorkerReady = () => {
    console.log("PDF Worker is ready for processing");
  };

  const handleFileSelect = async (file: File) => {
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
    const validation = await validatePDFFile(file);

    if (!validation.isValid && validation.error) {
      setValidationError(validation.error);

      return;
    }

    // File is valid, start upload simulation
    simulateUpload(file, async () => {
      // After upload completes, start real text extraction
      try {
        // Start processing simulation alongside real extraction
        simulateProcessing([
          { name: "Extracting text from PDF", duration: 25 },
          { name: "Preprocessing content", duration: 15 },
          { name: "Analyzing content quality", duration: 15 },
          { name: "Preparing for quiz generation", duration: 10 }
        ]);

        // Perform actual text extraction
        const result = await extractText(file);

        if (result.success && result.multiPageText) {
          // Preprocess the extracted content
          const preprocessingResult = await preprocessContent(result.multiPageText.fullText, {
            maxTokens: 3000,
            removeHeaders: true,
            removeExcessiveWhitespace: true,
            minParagraphLength: 20
          });

          if (preprocessingResult.success && preprocessingResult.content && preprocessingResult.validation?.isValid) {
            // Notify parent that file is ready for processing
            onFileProcessed?.(file);
          } else {
            // Handle preprocessing failure
            const issues = preprocessingResult.validation?.issues || ["Content preprocessing failed"];
            setValidationError({
              type: "file-missing",
              message: `Content preprocessing issues: ${issues.join(", ")}`
            });
          }
        } else {
          // Handle extraction failure
          setValidationError({
            type: "file-missing",
            message: result.error || "Failed to extract text from PDF"
          });
        }
      } catch (error) {
        setValidationError({
          type: "file-missing",
          message: `Text extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`
        });
      }
    });
  };

  const handleErrorDismiss = () => {
    setValidationError(null);
  };

  const handleQuizGenerated = (quiz: Quiz) => {
    // Store quiz in localStorage for the quiz route
    localStorage.setItem("currentQuiz", JSON.stringify(quiz));
    console.log("Quiz generated:", quiz);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* PDF Worker Status */}
      <PDFWorkerStatus onWorkerReady={handleWorkerReady} />

      {/* OpenAI Client Status */}
      <OpenAIClientStatus />

      <div className="flex justify-center">
        <div className="bg-muted rounded-lg p-1 flex">
          <Button
            onClick={() => setUploadMethod("browse")}
            disabled={isProcessing}
            variant="ghost"
            size="sm"
            className={getUploadMethodClass(uploadMethod === "browse")}
          >
            Browse Files
          </Button>
          <Button
            onClick={() => setUploadMethod("drag")}
            disabled={isProcessing}
            variant="ghost"
            size="sm"
            className={getUploadMethodClass(uploadMethod === "drag")}
          >
            Drag & Drop
          </Button>
        </div>
      </div>

      {/* Upload Interface */}
      {uploadMethod === "browse" ? (
        <FileInput onFileSelect={handleFileSelect} disabled={isProcessing} />
      ) : (
        <DropZone onFileSelect={handleFileSelect} disabled={isProcessing} />
      )}

      {/* Validation Rules */}
      {uploadState.progress.phase === "idle" && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">File Requirements:</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• File format: PDF only</li>
            <li>• Maximum size: {formatFileSize(FILE_VALIDATION_CONFIG.maxFileSize)}</li>
            <li>• Text-based PDFs work best for quiz generation</li>
            <li>• Recommended size: Under {formatFileSize(3 * 1024 * 1024)} for faster processing</li>
          </ul>
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <ErrorMessage type="error" message={validationError.message} onDismiss={handleErrorDismiss} />
      )}

      {/* Error State */}
      {uploadState.progress.phase === "error" && uploadState.error && (
        <ErrorMessage type="error" message={uploadState.error} onDismiss={reset} />
      )}

      {/* Text Extraction Error */}
      {extractionError && (
        <ErrorMessage type="error" message={`Text extraction failed: ${extractionError}`} onDismiss={reset} />
      )}

      {/* Content Preprocessing Error */}
      {preprocessingError && (
        <ErrorMessage type="error" message={`Content preprocessing failed: ${preprocessingError}`} onDismiss={reset} />
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
        <div
          className={cn(
            "border rounded-lg p-4 space-y-3",
            isContentReady ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn("w-2 h-2 rounded-full", isContentReady ? "bg-green-500" : "bg-yellow-500")}></div>
            <div className="flex-1">
              <p className={cn("text-sm font-medium", isContentReady ? "text-green-800" : "text-yellow-800")}>
                {isContentReady ? "Ready for quiz generation" : "Processing completed with issues"}
              </p>
            </div>
          </div>

          {/* Content Processing Results */}
          {multiPageText && extractionValidation && (
            <div className={cn("pt-2 border-t", isContentReady ? "border-green-200" : "border-yellow-200")}>
              <TextExtractionResult multiPageText={multiPageText} isContentReady={isContentReady} />

              {/* Content Preprocessing Results */}
              {preprocessedContent && (
                <PreprocessedContent preprocessedContent={preprocessedContent} isContentReady={isContentReady} />
              )}

              {/* Quality Issues */}
              {extractionValidation.issues.length > 0 && (
                <ValidationIssueList issues={extractionValidation.issues} title="Text Quality Issues" />
              )}

              {/* Preprocessing Issues */}
              {preprocessingValidation && preprocessingValidation.issues.length > 0 && (
                <ValidationIssueList issues={preprocessingValidation.issues} title="Content Preprocessing Issues" />
              )}

              {/* Content Not Ready Message */}
              {!isContentReady && (
                <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
                  <p className="text-sm font-medium text-yellow-800 mb-1">Cannot generate quiz</p>
                  <p className="text-xs text-yellow-700">
                    The PDF content is not suitable for quiz generation. Please try uploading a PDF with more text
                    content.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quiz Generation Interface */}
          {isContentReady && (
            <div className="mt-6">
              <QuizGenerationInterface
                content={preprocessedContent}
                isContentReady={isContentReady}
                onQuizGenerated={handleQuizGenerated}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
