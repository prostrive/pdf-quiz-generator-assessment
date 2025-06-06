'use client';

import { useState } from 'react';
import { Question } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type QuestionnaireProps = {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  setPdfFile: (file: File | null) => void;
};

export default function Questionnaire({
  questions,
  setQuestions,
  setPdfFile,
}: QuestionnaireProps) {
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Derived state
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const scorePercentage = Math.round((score / questions.length) * 100);

  /**
   * Resets the quiz to its initial state
   */
  const resetQuiz = () => {
    setQuestions([]);
    setPdfFile(null);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
  };

  /**
   * Handles answer submission and progresses to next question or finishes quiz
   */
  const handleSubmit = () => {
    // Validate answer and update score
    if (selectedOption === currentQuestion.answer) {
      setScore((prevScore) => prevScore + 1);
    }

    // Reset selection
    setSelectedOption(null);

    // Progress to next question or finish quiz
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  // Early return if no questions available
  if (!questions.length) return null;

  return (
    <Card className='w-full'>
      <CardContent className='p-6 space-y-4'>
        {isFinished ? (
          <QuizCompletion
            score={score}
            totalQuestions={questions.length}
            scorePercentage={scorePercentage}
            onReset={resetQuiz}
          />
        ) : (
          <QuestionView
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            question={currentQuestion.question}
            options={currentQuestion.options || []}
            selectedOption={selectedOption}
            onOptionSelect={setSelectedOption}
            onSubmit={handleSubmit}
            isSubmitDisabled={!selectedOption || isLoading}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}

type QuizCompletionProps = {
  score: number;
  totalQuestions: number;
  scorePercentage: number;
  onReset: () => void;
};

/**
 * Component for displaying quiz completion results
 */
const QuizCompletion = ({
  score,
  totalQuestions,
  scorePercentage,
  onReset,
}: QuizCompletionProps) => (
  <div className='text-center space-y-4'>
    <h2 className='text-2xl font-bold'>Quiz Completed!</h2>
    <div className='space-y-2'>
      <p className='text-lg'>
        Your Score: {score} / {totalQuestions}
      </p>
      <p className='text-sm text-muted-foreground'>
        ({scorePercentage}% correct)
      </p>
    </div>
    <Button onClick={onReset} className='mt-4'>
      Upload another PDF
    </Button>
  </div>
);

type QuestionViewProps = {
  currentQuestionIndex: number;
  totalQuestions: number;
  question: string;
  options: string[];
  selectedOption: string | null;
  onOptionSelect: (value: string) => void;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
  isLoading: boolean;
};

/**
 * Component for displaying a single question and its options
 */
const QuestionView = ({
  currentQuestionIndex,
  totalQuestions,
  question,
  options,
  selectedOption,
  onOptionSelect,
  onSubmit,
  isSubmitDisabled,
  isLoading,
}: QuestionViewProps) => (
  <>
    <div className='space-y-4'>
      <h2 className='text-lg font-medium'>
        Question {currentQuestionIndex + 1} of {totalQuestions}
      </h2>
      <p className='font-bold'>{question}</p>

      <RadioGroup value={selectedOption ?? ''} onValueChange={onOptionSelect}>
        {options.map((option, index) => (
          <div key={option} className='flex items-center space-x-2'>
            <RadioGroupItem value={option} id={`option-${index}`} />
            <Label htmlFor={`option-${index}`}>{option}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>

    <Button
      onClick={onSubmit}
      disabled={isSubmitDisabled}
      className='mt-4 w-full'
    >
      {isLoading
        ? 'Checking...'
        : isSubmitDisabled
        ? 'Select an option'
        : 'Submit Answer'}
    </Button>
  </>
);
