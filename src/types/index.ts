import { getPDFWorkerConfig } from "@/lib/pdfWorker";

// Core quiz types
export type QuestionType = "multiple-choice" | "short-answer";

export type OptionIndex = 0 | 1 | 2 | 3; // For multiple-choice options (A, B, C, D)

export interface BaseQuestion {
  id: string;
  question: string;
  type: QuestionType;
  explanation?: string; // Optional explanation for the correct answer
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple-choice";
  options: [string, string, string, string]; // Exactly 4 options (A, B, C, D)
  correctAnswer: OptionIndex; // Index of the correct option
  userAnswer?: OptionIndex; // User's selected answer
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: "short-answer";
  correctAnswer: string; // The expected answer
  acceptableAnswers?: string[]; // Alternative acceptable answers
  userAnswer?: string; // User's text input
  maxLength?: number; // Maximum character length for answer
}

export type Question = MultipleChoiceQuestion | ShortAnswerQuestion;

export type UserAnswer = Question["userAnswer"];

export interface Quiz {
  id: string;
  questions: Question[];
  title?: string;
  createdAt: Date;
  completedAt?: Date;
  score?: number;
}

export interface QuizGenerationState {
  isGenerating: boolean;
  currentQuiz: Quiz | null;
  error: string | null;
  progress: {
    phase: "idle" | "validating" | "generating" | "parsing" | "complete" | "error";
    message: string;
  };
}

export interface QuizGenerationResponse {
  success: boolean;
  quiz?: Quiz;
  error?: string;
}

// Add interfaces for parsed response
export interface ParsedMultipleChoiceQuestionResponse {
  id?: string;
  type: "multiple-choice";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface ParsedShortAnswerQuestionResponse {
  id?: string;
  type: "short-answer";
  question: string;
  correctAnswer: string;
  acceptableAnswers?: string[];
  explanation?: string;
  maxLength?: number;
}

export type ParsedQuestionResponse = ParsedMultipleChoiceQuestionResponse | ParsedShortAnswerQuestionResponse;

export interface ParsedQuizResponse {
  questions: ParsedQuestionResponse[];
}

export interface QuizPromptOptions {
  questionCount?: number;
  difficulty?: "easy" | "medium" | "hard";
  includeExplanations?: boolean;
  focusAreas?: string[];
  questionTypes?: QuestionType[]; // Types of questions to generate
  shortAnswerRatio?: number; // Ratio of short-answer to multiple-choice (0-1)
}

export interface QuizGenerationOptions extends QuizPromptOptions {
  title?: string;
  model?: string;
  maxRetries?: number;
}

// OpenAI API types
export interface OpenAIClientState {
  isConnected: boolean | null; // null = not tested yet
  isTesting: boolean;
  error: string | null;
}

export interface OpenAIQuizRequest {
  content: string;
  questionCount?: number;
  difficulty?: "easy" | "medium" | "hard";
  instructions?: string;
}

export interface OpenAIQuizResponse {
  questions: Question[];
  metadata?: {
    generatedAt: string;
    model: string;
    tokensUsed: number;
  };
}

export interface OpenAIAPIError {
  message: string;
  type: string;
  statusCode?: number;
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
