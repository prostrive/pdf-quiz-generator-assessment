type StepType = "upload" | "generate" | "quiz";
type StepStatus = "current" | "complete" | "pending";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
}
interface QuizResponse {
  questions: QuizQuestion[];
}