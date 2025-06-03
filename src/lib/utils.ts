import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractKeySections(pages: string[]): string {
  const keywords = [
    // Common structure
    "introduction",
    "overview",
    "objective",
    "goals",
    "summary",
    "conclusion",
    "key points",
    "main idea",
    "important",
    "takeaway",
    "highlights",

    // Educational material
    "lesson",
    "chapter",
    "topic",
    "definition",
    "explanation",
    "theory",
    "principle",
    "concept",
    "example",

    // Exam/training prep
    "quiz",
    "review",
    "test",
    "practice questions",

    // Technical docs
    "description",
    "steps",
    "methods",
    "how it works",
    "process",
    "results",

    // Business/reports
    "executive summary",
    "problem",
    "solution",
    "analysis",
    "recommendation",
  ];

  const keywordLines: string[] = [];

  for (const page of pages) {
    const lines = page.split("\n").map((line) => line.trim());
    for (const line of lines) {
      if (keywords.some((kw) => line.toLowerCase().includes(kw))) {
        keywordLines.push(line);
      }
    }
  }

  const keywordText = keywordLines.join("\n\n");

  // return keyword-matched content, trimmed to 3000 chars
  if (keywordText.length > 0) {
    return keywordText.slice(0, 3000);
  }

  // Fallback: use first 2 and last page
  const firstTwo = pages.slice(0, 2).join("\n\n");
  const last = pages[pages.length - 1];
  return [firstTwo, last].join("\n\n").slice(0, 3000);
}
