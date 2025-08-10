export type QuizAnswers = Record<number, number>;
export type Questions = Array<Question>;
export type Question = {
  question: string;
  choices: Array<string>;
  answer: number;
};
