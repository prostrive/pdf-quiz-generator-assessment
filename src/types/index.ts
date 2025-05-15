export type Question = {
  question: string;
  type: "multiple-choice" | "short-answer";
  options?: string[]; // optional, only for multiple-choice
  answer: string;
  selected?: string; // the user's answer (for both types)
  isCorrect?: boolean; // result of evaluation
};

export type GenerateQuizOptions = {
  includeShortAnswers?: boolean;
};
