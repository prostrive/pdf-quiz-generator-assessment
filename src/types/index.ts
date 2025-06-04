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

// File upload types
export type UploadState = "idle" | "uploading" | "processing" | "success" | "error";

export interface FileUploadStatus {
  state: UploadState;
  progress: number;
  error?: string;
  fileName?: string;
  fileSize?: number;
}

// PDF processing types
export interface PDFContent {
  text: string;
  pageCount: number;
  fileName: string;
}

// API response types
export interface QuizGenerationResponse {
  success: boolean;
  quiz?: Quiz;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  content?: PDFContent;
  error?: string;
}

// UI component types
export interface ErrorState {
  type: "error" | "warning" | "info";
  message: string;
  dismissible?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ValidationError {
  type: "file-type" | "file-size" | "file-missing";
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: ValidationError;
}
