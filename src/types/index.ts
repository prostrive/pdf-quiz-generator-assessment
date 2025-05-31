export type Question = {
  question: string;
  type: "multiple-choice" | "single-choice";
  options?: string[]; 
  answer: string;
  selected?: string; 
  isCorrect?: boolean; 
};

export type GenerateQuizOptions = {
  includeSingleAnswer?: boolean;
};