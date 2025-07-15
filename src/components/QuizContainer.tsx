import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import QuizQuestionBlock from "@/components/QuizQuestionBlock";
import type { QuizQuestion } from "@/types/quiz";

type QuizContainerProps = {
  quiz: QuizQuestion[];
};

const QuizContainer: React.FC<QuizContainerProps> = ({ quiz }) => {
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleSelectAnswer = useCallback((qIdx: number, answer: string) => {
    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[qIdx] = answer;
      return updated;
    });
  }, []);

  const handleSubmitQuiz = useCallback(() => {
    let correct = 0;
    quiz.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) correct++;
    });
    setScore(correct);
    setQuizSubmitted(true);
  }, [quiz, userAnswers]);

  useEffect(() => {
    setUserAnswers([]);
    setQuizSubmitted(false);
    setScore(null);
  }, [quiz]);

  return (
    <div className="mt-6 w-full max-w-xl">
      <h2 className="text-2xl font-semibold mb-4">Quiz</h2>
      {quiz.map((q, idx) => (
        <QuizQuestionBlock
          key={idx}
          q={q}
          idx={idx}
          userAnswer={userAnswers[idx]}
          quizSubmitted={quizSubmitted}
          onSelect={(answer) => handleSelectAnswer(idx, answer)}
        />
      ))}
      {!quizSubmitted && (
        <Button
          className="w-full max-w-xs mt-2"
          onClick={handleSubmitQuiz}
          disabled={userAnswers.length !== quiz.length || userAnswers.some(ans => !ans)}
        >
          Submit Quiz
        </Button>
      )}
      {quizSubmitted && score !== null && (
        <div className="mt-4 p-4 border rounded bg-blue-50 text-blue-900 text-lg font-semibold text-center">
          Your Score: {score} / {quiz.length}
        </div>
      )}
    </div>
  );
};

export default QuizContainer; 