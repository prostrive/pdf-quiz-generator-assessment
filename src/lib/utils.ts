import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const scoreHeading = (score: number) => {
  if (score <= 2) return "Nice Try. 👍"
  if (score >= 2 && score <= 4) return "You're getting there. 👌"

  return "Perfect! ⭐️"
}
