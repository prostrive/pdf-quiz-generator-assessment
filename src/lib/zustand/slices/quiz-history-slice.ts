import { MAX_QUIZ_HISTORY_COUNT } from "@/lib/constants";
import { QuizHistory } from "@/types/quiz.type";
import { toast } from "sonner";
import { StateCreator } from "zustand";

export type QuizHistorySlice = {
  quizHistory: QuizHistory[];
  addQuizHistory: (quizHistory: QuizHistory) => void;
  deleteQuizHistory: (id: string) => void;
  updateQuizScore: (id: string, score: number) => void;
};

const quizHistorySlice: StateCreator<QuizHistorySlice> = (set) => ({
  quizHistory: [],

  addQuizHistory: (quizItem) =>
    set((state) => {
      const newHistory = [quizItem, ...state.quizHistory].slice(
        0,
        +MAX_QUIZ_HISTORY_COUNT
      );
      return { quizHistory: newHistory };
    }),

  deleteQuizHistory: (id) => {
    toast.success("Quiz Deleted", {
      description: "Quiz has been deleted successfully",
    });
    return set((state) => ({
      quizHistory: state.quizHistory.filter((item) => item.id !== id),
    }));
  },

  updateQuizScore: (id, score) =>
    set((state) => ({
      quizHistory: state.quizHistory.map((item) =>
        item.id === id ? { ...item, score } : item
      ),
    })),
});

export default quizHistorySlice;
