import { useState } from "react";
import type { QuizQuestion } from "@/types/quiz";

export function useQuizGenerator() {
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateQuiz = async (text: string) => {
    setQuiz(null);
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz.");
      setQuiz(data.quiz);
    } catch (err) {
      let message = "Failed to generate quiz.";
      if (typeof err === "object" && err !== null && "message" in err && typeof (err as Record<string, unknown>).message === "string") {
        message = (err as { message: string }).message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuiz(null);
    setLoading(false);
    setError("");
  };

  return { generateQuiz, quiz, loading, error, reset };
} 