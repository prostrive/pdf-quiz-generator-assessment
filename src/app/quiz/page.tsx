"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { QuestionPagination } from "@/components/QuestionPagination";
import { QuizDisplay } from "@/components/QuizDisplay";
import { Button } from "@/components/ui/button";
import { Quiz, UserAnswer } from "@/types";

export default function QuizPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Try to load quiz data from localStorage
    const storedQuiz = localStorage.getItem("currentQuiz");

    if (storedQuiz) {
      try {
        const parsedQuiz = JSON.parse(storedQuiz);
        // Convert date strings back to Date objects
        parsedQuiz.createdAt = new Date(parsedQuiz.createdAt);

        if (parsedQuiz.completedAt) {
          parsedQuiz.completedAt = new Date(parsedQuiz.completedAt);
        }

        setQuiz(parsedQuiz);
        setUserAnswers(new Array(parsedQuiz.questions.length).fill(undefined));
      } catch (error) {
        console.error("Failed to parse stored quiz:", error);
        router.push("/");
      }
    }

    setLoading(false);
  }, [router]);

  const handleQuestionChange = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleAnswerSelect = (answerIndex: UserAnswer) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(quiz!.questions.length).fill(undefined));
    setShowResults(false);
  };

  const handleCompletionStateChange = (showingResults: boolean) => {
    setShowResults(showingResults);
  };

  const handleBackToHome = () => {
    // Clear the stored quiz and navigate back
    localStorage.removeItem("currentQuiz");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
        <p className="text-muted-foreground mb-6">No quiz data found. Please generate a quiz first.</p>
        <Button onClick={handleBackToHome} className="inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="touch-manipulation">
      <div className="mb-4 sm:mb-6">
        <Button onClick={handleBackToHome} variant="outline" className="inline-flex items-center gap-2 min-h-[44px]">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>
      <div className="text-center mb-3 sm:mb-4 px-2">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">{quiz.title || "Generated Quiz"}</h1>
      </div>

      {/* Question Pagination */}
      {!showResults && (
        <div className="mb-6">
          <QuestionPagination
            totalQuestions={quiz.questions.length}
            currentQuestionIndex={currentQuestionIndex}
            userAnswers={userAnswers}
            onQuestionSelect={handleQuestionChange}
          />
        </div>
      )}

      <QuizDisplay
        quiz={quiz}
        currentQuestionIndex={currentQuestionIndex}
        userAnswers={userAnswers}
        onQuestionChange={handleQuestionChange}
        onAnswerSelect={handleAnswerSelect}
        onQuizComplete={score => console.log("Quiz completed with score:", score)}
        onRestart={handleRestart}
        onCompletionStateChange={handleCompletionStateChange}
      />

      <div className="mt-6 sm:mt-8 text-center">
        <Button onClick={handleBackToHome} variant="outline" className="inline-flex items-center gap-2 min-h-[44px]">
          <ArrowLeft className="w-4 h-4" />
          Generate New Quiz
        </Button>
      </div>
    </div>
  );
}
