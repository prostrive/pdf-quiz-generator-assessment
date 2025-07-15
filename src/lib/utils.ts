import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Question = {
    question: string;
    options?: string[];
    answer: string;
    selection?: string;
    isCorrect?: boolean;
}

export const pdfFormSchema = z.object({
    pdf: z.custom<File>((file) => file instanceof File && file.type === "application/pdf", {
        message: "Please upload a valid PDF file",
    })
});