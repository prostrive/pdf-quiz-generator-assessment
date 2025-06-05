import { getPDFWorkerConfig } from "@/lib/pdfWorker";

// Core quiz types
export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string]; // Exactly 4 options (A, B, C, D)
  correctAnswer: 0 | 1 | 2 | 3; // Index of the correct option
  userAnswer?: 0 | 1 | 2 | 3; // User's selected answer
}

export interface Quiz {
  id: string;
  questions: Question[];
  title?: string;
  createdAt: Date;
  completedAt?: Date;
  score?: number;
}

// API response types
export interface QuizGenerationResponse {
  success: boolean;
  quiz?: Quiz;
  error?: string;
}

// UI component types
export interface ErrorState {
  type: "error" | "warning" | "info";
  message: string;
  dismissible?: boolean;
}

export interface ValidationError {
  type: "file-type" | "file-size" | "file-missing";
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: ValidationError;
}

export interface UploadProgress {
  phase: "idle" | "uploading" | "processing" | "complete" | "error";
  progress: number; // 0-100
  message: string;
  timeRemaining?: number; // in seconds
  uploadSpeed?: number; // bytes per second
}

export interface UploadState {
  file: File | null;
  progress: UploadProgress;
  error: string | null;
  startTime: number | null;
  bytesUploaded: number;
}

export interface PDFWorkerState {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  config: Awaited<ReturnType<typeof getPDFWorkerConfig>> | null;
}

// PDF text extraction types
export interface PDFInfo {
  numPages: number;
  fileName: string;
  fileSize: number;
  title?: string;
  author?: string;
}

export interface ExtractedText {
  content: string;
  pageNumber: number;
  wordCount: number;
  charCount: number;
}

export interface MultiPageExtractedText {
  fullText: string;
  pageTexts: string[];
  pageCount: number;
  totalWordCount: number;
  totalCharCount: number;
}

export interface TextExtractionResult {
  success: boolean;
  text?: ExtractedText;
  multiPageText?: MultiPageExtractedText;
  error?: string;
}

export interface TextValidation {
  isValid: boolean;
  wordCount: number;
  charCount: number;
  issues: string[];
}

export interface TextExtractionState {
  isExtracting: boolean;
  error: string | null;
  pdfInfo: PDFInfo | null;
  extractedText: ExtractedText | null;
  multiPageText: MultiPageExtractedText | null;
  validation: TextValidation | null;
  extractionProgress?: {
    currentPage: number;
    totalPages: number;
  };
}

// Content preprocessing types
export interface PreprocessingOptions {
  maxTokens?: number;
  removeHeaders?: boolean;
  removeExcessiveWhitespace?: boolean;
  minParagraphLength?: number;
}

export interface PreprocessedContent {
  cleanedText: string;
  originalLength: number;
  cleanedLength: number;
  removedSections: number;
  estimatedTokens: number;
}

export interface ContentValidation {
  isValid: boolean;
  issues: string[];
}

export interface PreprocessingOptions {
  maxTokens?: number; // Maximum tokens for OpenAI API (default: 3000)
  removeHeaders?: boolean; // Remove likely headers/footers (default: true)
  removeExcessiveWhitespace?: boolean; // Clean up whitespace (default: true)
  minParagraphLength?: number; // Minimum paragraph length to keep (default: 20)
}

export interface PreprocessedContent {
  cleanedText: string;
  originalLength: number;
  cleanedLength: number;
  removedSections: number;
  estimatedTokens: number;
}
