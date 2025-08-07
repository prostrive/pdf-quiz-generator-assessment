export const OPENAI_MODEL = process.env.OPENAI_MODEL! ?? "gpt-4o";

export const MAX_QUIZ_HISTORY_COUNT = process.env.MAX_QUIZ_HISTORY_COUNT! ?? 10;

export const QUESTIONS_COUNT = process.env.QUESTIONS_COUNT! ?? 5;

export const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE! ?? 5 * 1024 * 1024; // 5 mb

export const MAX_API_CALL_TIMEOUT =
  process.env.MAX_API_CALL_TIMEOUT! ?? 5 * 60 * 1000; // 5 mins

export const CHUNKS = {
  SMALL: 6_000,
  MEDIUM: 15_000,
  LARGE: 500_000,
}; // number of characters
