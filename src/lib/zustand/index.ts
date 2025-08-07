import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import quizHistorySlice, {
  type QuizHistorySlice,
} from "@/lib/zustand/slices/quiz-history-slice";

export type Store = QuizHistorySlice;

export const useQuizStore = create<Store>()(
  persist(
    (...args) => ({
      ...quizHistorySlice(...args),
    }),
    {
      name: "pdf-quiz-generator",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
