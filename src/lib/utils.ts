import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreMessage(score: number) {
  if (score <= 2) {
    return "It's okay, you still did great by answering all the questions.";
  }

  if (score >= 4) {
    return "Good job!, you answered most of the questions correctly.";
  }

  return "Excellent! you answered all of the questions correctly.";
}

export function isValidJSON(value: string) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}
