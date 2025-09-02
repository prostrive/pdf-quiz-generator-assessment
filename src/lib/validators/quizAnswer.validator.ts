import { z } from "zod";

export const quizAnswerValidator = (quizQuestions: QuizDetails[]) => {
  const shape: Record<string, z.ZodString> = {};

  quizQuestions.forEach((q) => {
    shape[q.id.toString()] = z
      .string()
      .min(1, "You must select an answer");
  });

  return z.object(shape);
};