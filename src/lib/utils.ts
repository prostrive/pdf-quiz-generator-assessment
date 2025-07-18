import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export interface Question {
    id: number;
    question: string;
    options: string[];
    answer: string;
}

export interface AnsweredQustion {
	id: number,
	isCorrect: boolean
}

export function cn(...inputs: ClassValue[]) {
  	return twMerge(clsx(inputs))
}
