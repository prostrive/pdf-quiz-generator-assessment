import { useState, useCallback } from "react";
import { QuizGenerationOptions, QuizGenerationResponse, QuizGenerationState } from "@/types";

/**
 * Hook to manage quiz generation workflow
 */
export function useQuizGeneration() {
  const [state, setState] = useState<QuizGenerationState>({
    isGenerating: false,
    currentQuiz: null,
    error: null,
    progress: {
      phase: "idle",
      message: "Ready to generate quiz"
    }
  });
  const canGenerate = !state.isGenerating && state.progress.phase !== "generating";

  /**
   * Generate a quiz from preprocessed content
   */
  const generateQuizFromContent = useCallback(
    async (content: string, options: QuizGenerationOptions = {}): Promise<QuizGenerationResponse> => {
      setState(prev => ({
        ...prev,
        isGenerating: true,
        error: null,
        currentQuiz: null,
        progress: {
          phase: "validating",
          message: "Validating content and parameters..."
        }
      }));

      try {
        // Update progress: generating
        setState(prev => ({
          ...prev,
          progress: {
            phase: "generating",
            message: "Generating quiz questions with AI..."
          }
        }));
        console.log("🚀 Starting quiz generation with options:", options);

        const response = await fetch("/api/quiz/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ content, options })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.quiz) {
          // Update progress: parsing complete
          setState(prev => ({
            ...prev,
            progress: {
              phase: "complete",
              message: `Successfully generated ${result.quiz!.questions.length} questions`
            }
          }));

          // Set final success state
          setState(prev => ({
            ...prev,
            isGenerating: false,
            currentQuiz: result.quiz!,
            error: null
          }));

          console.log("✅ Quiz generation completed successfully");

          return result;
        } else {
          throw new Error(result.error || "Quiz generation failed");
        }
      } catch (error) {
        console.error("❌ Quiz generation failed:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error during quiz generation";

        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: errorMessage,
          progress: {
            phase: "error",
            message: `Generation failed: ${errorMessage}`
          }
        }));

        return {
          success: false,
          error: errorMessage
        };
      }
    },
    []
  );

  /**
   * Reset quiz generation state
   */
  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      currentQuiz: null,
      error: null,
      progress: {
        phase: "idle",
        message: "Ready to generate quiz"
      }
    });
  }, []);

  /**
   * Clear current quiz (but keep other state)
   */
  const clearQuiz = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuiz: null,
      progress: {
        phase: "idle",
        message: "Ready to generate quiz"
      }
    }));
  }, []);

  return {
    ...state,
    canGenerate,
    generateQuizFromContent,
    reset,
    clearQuiz
  };
}
