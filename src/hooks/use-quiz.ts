import { MAX_API_CALL_TIMEOUT } from "@/lib/constants";
import { useQuizStore } from "@/lib/zustand";
import { QuizData, QuizHistory } from "@/types/quiz.type";
import { useState } from "react";
import { toast } from "sonner";

export function useQuiz() {
  const { addQuizHistory, updateQuizScore } = useQuizStore();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Generates a quiz from a provided PDF file by calling the `/api/generate-quiz` endpoint.
   *
   * @param {File | null} file - The PDF file to generate the quiz from.
   * @returns {Promise<void>}
   */
  const generateQuiz = async (file: File | null) => {
    if (!file) {
      toast.error("No file selected", {
        description: "Please select a PDF file first",
      });
      return;
    }

    const loadingToast = toast.loading("Processing PDF", {
      description: "Extracting text and generating quiz questions...",
    });

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("pdf", file);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        +MAX_API_CALL_TIMEOUT
      ); // 5 mins timeout

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        type: response.type,
        headers: {
          "content-type": response.headers.get("content-type"),
          "content-length": response.headers.get("content-length"),
        },
      });

      // Get the raw response text
      const responseText = await response.text();
      console.log(
        "Raw response text (first 500 chars):",
        responseText.substring(0, 500)
      );

      // Handle different response scenarios
      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;

        // Try to extract error from response
        if (responseText) {
          if (responseText.includes("Internal Server Error"))
            errorMessage =
              "Internal server error occurred. Please check your environment configuration and try again.";
          else if (responseText.includes("404"))
            errorMessage =
              "API endpoint not found. Please check your server configuration.";
          else if (responseText.includes("500"))
            errorMessage =
              "Server configuration error. Please check your environment variables.";
          else {
            // Try to parse as JSON for structured error
            try {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.error || errorMessage;
            } catch {
              // If not JSON, use first 200 characters of response
              errorMessage =
                responseText.length > 200
                  ? responseText.substring(0, 200) + "..."
                  : responseText || errorMessage;
            }
          }
        }

        throw new Error(errorMessage);
      }

      // Parse successful response
      if (!responseText.trim()) throw new Error("Empty response from server");

      let quizData;
      try {
        quizData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error(
          "Server returned invalid response format. Please try again."
        );
      }

      // Validate quiz data structure
      if (
        !quizData.title ||
        !quizData.questions ||
        !Array.isArray(quizData.questions)
      )
        throw new Error("Invalid quiz data received from server");

      const quizId = Date.now().toString();
      const historyEntry: QuizHistory = {
        id: quizId,
        title: quizData.title,
        fileName: file.name,
        createdAt: new Date().toISOString(),
        totalQuestions: quizData.questions.length,
        quiz: quizData,
      };

      addQuizHistory(historyEntry);
      setQuiz(quizData);
      setCurrentQuizId(quizId);

      toast.success("Quiz generated successfully!", {
        description: `Created ${quizData.questions.length} questions from ${
          quizData.metadata?.pageCount || "your"
        } pages`,
      });
    } catch (err) {
      console.error("Error:", err);

      let errorMessage = "Failed to generate quiz. Please try again.";

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          errorMessage =
            "Request timed out. Please try with a smaller PDF or check your connection.";
        } else {
          errorMessage = err.message;
        }
      }

      toast.error("Quiz generation failed", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setCurrentQuizId(null);
  };

  /**
   * Called when the quiz is completed. Updates the score and shows a toast.
   *
   * @param {number} score - The user's quiz score.
   */
  const onQuizComplete = (score: number) => {
    if (currentQuizId) updateQuizScore(currentQuizId, score);

    const percentage = Math.round((score / quiz!.questions.length) * 100);
    toast.success("Quiz completed!", {
      description: `You scored ${score}/${
        quiz!.questions.length
      } (${percentage}%)`,
    });
  };

  /**
   * Loads a quiz from history into the current state.
   *
   * @param {QuizHistory} historyItem - The quiz history item to load.
   */
  const loadQuizFromHistory = (historyItem: QuizHistory) => {
    setQuiz(historyItem.quiz);

    setCurrentQuizId(historyItem.id);
    toast.success("Quiz loaded", {
      description: `Loaded "${historyItem.title}" from history`,
    });
  };

  return {
    quiz,
    setQuiz,
    currentQuizId,
    setCurrentQuizId,
    loading,
    generateQuiz,
    resetQuiz,
    onQuizComplete,
    loadQuizFromHistory,
  };
}
