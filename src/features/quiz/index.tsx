"use client";

import { Progress } from "@/components/ui/progress";
import { QuizData } from "@/types/quiz.type";
import { useQuizQuestion } from "@/hooks/use-quiz-question";
import { QuestionCard } from "./components/question-card";
import { QuizResults } from "./components/quiz-results";

type Props = {
  quiz: QuizData;
  onReset: () => void;
  onComplete: (score: number) => void;
};

export function Quiz({ quiz, onReset, onComplete }: Props) {
  const {
    showResults,
    selectedAnswers,
    currentQuestion,
    question,
    progress,
    selectedAnswer,
    calculateScore,
    handleAnswerSelect,
    handleNextQuestion,
    handlePreviousQuestion,
  } = useQuizQuestion(quiz, onComplete);

  if (showResults) {
    return (
      <QuizResults
        calculateScore={calculateScore}
        onReset={onReset}
        quiz={quiz}
        selectedAnswers={selectedAnswers}
      />
    );
  }

  return (
    <div className="relative z-10 max-w-3xl w-full pt-12 p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-300 to-zinc-200 bg-clip-text text-transparent">
            {quiz.title}
          </h1>
          <div className="text-right">
            <div className="text-sm text-zinc-500 mb-1">Progress</div>
            <div className="text-lg font-bold text-zinc-300">
              {currentQuestion + 1} of {quiz.questions.length}
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Question Card */}
      <QuestionCard
        currentQuestion={currentQuestion}
        handleAnswerSelect={handleAnswerSelect}
        handleNextQuestion={handleNextQuestion}
        handlePreviousQuestion={handlePreviousQuestion}
        onReset={onReset}
        question={question}
        quiz={quiz}
        selectedAnswer={selectedAnswer}
      />
    </div>
  );
}
