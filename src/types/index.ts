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
