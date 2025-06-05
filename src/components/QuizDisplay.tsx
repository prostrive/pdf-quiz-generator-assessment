import { useState } from "react";
import { CheckCircle, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { QuestionDisplay } from "@/components/QuestionDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Quiz } from "@/types";

interface Props {
  quiz: Quiz;
  currentQuestionIndex: number;
  userAnswers: (number | undefined)[];
  onQuestionChange: (index: number) => void;
  onAnswerSelect: (answerIndex: number) => void;
  onQuizComplete?: (score: number, answers: (number | undefined)[]) => void;
  onRestart?: () => void;
  onCompletionStateChange?: (showResults: boolean) => void;
  className?: string;
}

export function QuizDisplay({
  quiz,
  currentQuestionIndex,
  userAnswers,
  onQuestionChange,
  onAnswerSelect,
  onQuizComplete,
  onRestart,
  onCompletionStateChange,
  className
}: Props) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const allQuestionsAnswered = userAnswers.every(answer => answer !== undefined);

  const handleAnswerSelect = (answerIndex: number) => {
    if (isCompleted) return;
    onAnswerSelect(answerIndex);
  };

  const handlePreviousQuestion = () => {
    if (!isFirstQuestion) {
      onQuestionChange(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      onQuestionChange(currentQuestionIndex + 1);
    }
  };

  const handleQuizSubmit = () => {
    if (!allQuestionsAnswered) return;

    const score = calculateScore();
    setIsCompleted(true);
    setShowResults(true);
    onCompletionStateChange?.(true);

    if (onQuizComplete) {
      onQuizComplete(score, userAnswers);
    }
  };

  const calculateScore = () => {
    let correct = 0;

    quiz.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });

    return Math.round((correct / quiz.questions.length) * 100);
  };

  const handleRestart = () => {
    onQuestionChange(0);
    setIsCompleted(false);
    setShowResults(false);
    onCompletionStateChange?.(false);

    if (onRestart) {
      onRestart();
    }
  };

  if (showResults) {
    const score = calculateScore();
    const correctCount = quiz.questions.filter((q, i) => userAnswers[i] === q.correctAnswer).length;

    return (
      <div className={cn("space-y-6", className)}>
        {/* Results Summary */}
        <Card className="quiz-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">{score}%</div>
              <p className="text-muted-foreground">
                You got {correctCount} out of {quiz.questions.length} questions correct
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={() => {
                  setShowResults(false);
                  onCompletionStateChange?.(false);
                }}
                variant="outline"
                className="flex-1"
              >
                Review Answers
              </Button>
              <Button onClick={handleRestart} className="flex-1 flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Retake Quiz</span>
                <span className="sm:hidden">Retake</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <div className="space-y-8">
          {quiz.questions.map((question, index) => (
            <QuestionDisplay
              key={question.id}
              question={question}
              questionNumber={index + 1}
              totalQuestions={quiz.questions.length}
              selectedAnswer={userAnswers[index]}
              showCorrectAnswer={true}
              disabled={true}
              className="border-l-4 border-l-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="quiz-card space-y-0 gap-0">
      {/* Current Question */}
      <QuestionDisplay
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={quiz.questions.length}
        selectedAnswer={userAnswers[currentQuestionIndex]}
        onAnswerSelect={handleAnswerSelect}
        disabled={isCompleted}
      />

      {/* Navigation Controls */}
      <CardContent className="pt-6 sm:pt-12">
        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={handlePreviousQuestion}
            disabled={isFirstQuestion}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="flex items-center gap-2 sm:gap-3">
            {allQuestionsAnswered && !isCompleted && (
              <Button onClick={handleQuizSubmit} className="flex items-center gap-2 px-3 sm:px-4">
                <CheckCircle className="h-4 w-4" />
                <span className="inline">Submit Quiz</span>
              </Button>
            )}
          </div>

          <Button
            onClick={handleNextQuestion}
            disabled={isLastQuestion}
            variant="outline"
            className="flex items-center gap-2"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
