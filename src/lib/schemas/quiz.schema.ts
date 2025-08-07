import z from "zod";
import { QUESTIONS_COUNT } from "@/lib/constants";

export const QuizSchema = z.object({
  title: z.string(),
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correctAnswer: z.number().min(0).max(3),
        explanation: z.string(),
      })
    )
    .length(+QUESTIONS_COUNT),
});
