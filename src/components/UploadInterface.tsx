"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropZone } from "@/components/ui/DropZone";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FileInput } from "@/components/ui/FileInput";
import { UploadProgressDisplay } from "@/components/ui/UploadProgressDisplay";
import { useContentPreprocessing } from "@/hooks/useContentPreprocessing";
import { usePDFWorker } from "@/hooks/usePDFWorker";
import { useTextExtraction } from "@/hooks/useTextExtraction";
import { useUploadProgress } from "@/hooks/useUploadProgress";
import { formatFileSize, validatePDFFile } from "@/lib/fileValidation";
import { cn } from "@/lib/utils";
import { MultiPageExtractedText, Quiz, PreprocessedContent as TPreprocessedContent, ValidationError } from "@/types";
import { OpenAIClientStatus } from "./OpenAIClientStatus";
import { PDFWorkerStatus } from "./PDFWorkerStatus";
import { QuizGenerationInterface } from "./QuizGenerationInterface";

interface PreprocessedContentProps {
  preprocessedContent: TPreprocessedContent;
}

interface TextExtractionResultProps {
  multiPageText: MultiPageExtractedText;
}

interface UploadInterfaceProps {
  onFileProcessed: (file: File) => void;
}

interface ValidationIssueListProps {
  issues: string[];
  title: string;
}

function PreprocessedContent({ preprocessedContent }: PreprocessedContentProps) {
  const reducedPercentage = (
    (1 - preprocessedContent.cleanedLength / preprocessedContent.originalLength) *
    100
  ).toFixed(1);

  return (
    <div className="pt-2 border-t border-green-200">
      <h4 className="text-xs font-semibold text-green-700 mb-2">Content Preprocessing</h4>
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-green-700 font-medium">Content optimized:</span>
          <span className="ml-1 text-green-600">{reducedPercentage}% reduced</span>
        </div>
        <div>
          <span className="text-green-700 font-medium">Estimated tokens:</span>
          <span className="ml-1 text-green-600">{preprocessedContent.estimatedTokens}</span>
        </div>
        <div>
          <span className="text-green-700 font-medium">Sections removed:</span>
          <span className="ml-1 text-green-600">{preprocessedContent.removedSections}</span>
        </div>
      </div>
    </div>
  );
}

function TextExtractionResult({ multiPageText }: TextExtractionResultProps) {
  return (
    <>
      <h4 className="text-xs font-semibold text-green-700 mb-2">Text Extraction Results</h4>
      <div className="grid grid-cols-3 gap-4 text-xs mb-3">
        <div>
          <span className="text-green-700 font-medium">Pages processed:</span>
          <span className="ml-1 text-green-600">{multiPageText.pageCount}</span>
        </div>
        <div>
          <span className="text-green-700 font-medium">Words extracted:</span>
          <span className="ml-1 text-green-600">{multiPageText.totalWordCount}</span>
        </div>
        <div>
          <span className="text-green-700 font-medium">Characters:</span>
          <span className="ml-1 text-green-600">{multiPageText.totalCharCount}</span>
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
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
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
            onFileProcessed(file);
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
    setGeneratedQuiz(quiz);
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
            <li>• Maximum size: 10MB</li>
            <li>• Text-based PDFs work best for quiz generation</li>
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

          {/* Content Processing Results */}
          {multiPageText && extractionValidation && (
            <div className="pt-2 border-t border-green-200">
              <TextExtractionResult multiPageText={multiPageText} />

              {/* Content Preprocessing Results */}
              {preprocessedContent && <PreprocessedContent preprocessedContent={preprocessedContent} />}

              {/* Quality Issues */}
              {extractionValidation.issues.length > 0 && (
                <ValidationIssueList issues={extractionValidation.issues} title="Text Quality Issues" />
              )}

              {/* Preprocessing Issues */}
              {preprocessingValidation && preprocessingValidation.issues.length > 0 && (
                <ValidationIssueList issues={preprocessingValidation.issues} title="Content Preprocessing Issues" />
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

          {/* Generated Quiz Display */}
          {generatedQuiz && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Quiz Ready!</p>
                  <p className="text-xs text-blue-600">
                    &quot;{generatedQuiz.title}&quot; with {generatedQuiz.questions.length} questions
                  </p>
                </div>
              </div>
              <div className="text-xs text-blue-600">
                <p>
                  Your quiz has been generated and is ready to use. You can now take the quiz or generate a new one with
                  different options.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
