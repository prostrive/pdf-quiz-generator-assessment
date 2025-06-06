import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

/**
 * Combines multiple class names into a single string,
 * resolving Tailwind class conflicts intelligently.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export type Question = {
  question: string;
  options?: string[];
  answer: string; // Correct answer
  selected?: string; // User-selected answer (for evaluation)
  isCorrect?: boolean; // Was the answer correct?
};

/**
 * Zod schema to validate uploaded PDF input.
 *
 * Ensures the input is:
 * - A valid File instance
 * - Of MIME type `application/pdf`
 */
export const pdfSchema = z.object({
  pdf: z.instanceof(File).refine((file) => file.type === 'application/pdf', {
    message: 'Invalid file type',
  }),
});

/**
 * Standardized formatter for handling various error types.
 *
 * - Zod validation errors
 * - OpenAI-like nested error objects
 * - Generic  errors
 */
export async function formatError(error: unknown): Promise<string> {
  console.error('formatError:', error);

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return error.errors.map((e) => e.message).join(' ');
  }

  // Handle OpenAI-style error structure
  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as any).error?.message === 'string'
  ) {
    return (error as any).error.message;
  }

  // Fallback: Use message if available, else stringify the entire error
  return typeof (error as any)?.message === 'string'
    ? (error as any).message
    : JSON.stringify(error);
}
