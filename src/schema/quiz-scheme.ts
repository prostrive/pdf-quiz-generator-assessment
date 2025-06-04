import { z } from 'zod'

export const quizRequestSchema = z.object({
  text: z.string().min(1, 'Text is required'),
})

export const quizOptionSchema = z.object({
  label: z.string().min(1),
  text: z.string().min(1),
})

export const quizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(quizOptionSchema).length(5), 
  answer: z.enum(['A', 'B', 'C', 'D', 'E']),    
  choice: z.string().optional()               
});
export const quizSchema = z.object({
  questions: z.array(quizQuestionSchema),
})

export type QuizRequest = z.infer<typeof quizRequestSchema>
export type QuizOption = z.infer<typeof quizOptionSchema>
export type QuizQuestion = z.infer<typeof quizQuestionSchema>
export type QuizResponse = z.infer<typeof quizSchema>