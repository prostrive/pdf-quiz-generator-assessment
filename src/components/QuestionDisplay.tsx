import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Question } from "@/types";

interface Props {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: number | undefined;
  onAnswerSelect?: (answerIndex: number) => void;
  showCorrectAnswer?: boolean;
  disabled?: boolean;
  className?: string;
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  showCorrectAnswer = false,
  disabled = false
}: Props) {
  const optionLabels = ["A", "B", "C", "D"] as const;

  const getOptionClassName = (optionIndex: number) => {
    const baseClasses =
      "question-option bg-white text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer whitespace-normal h-auto [&>div]:items-center [&>div>div]:m-0";

    if (showCorrectAnswer) {
      // Show correct/incorrect answers
      if (optionIndex === question.correctAnswer) {
        return cn(baseClasses, "bg-green-100 border-green-500 text-green-800 hover:bg-green-100");
      }

      if (selectedAnswer === optionIndex && optionIndex !== question.correctAnswer) {
        return cn(baseClasses, "bg-red-100 border-red-500 text-red-800 hover:bg-red-100");
      }

      return cn(baseClasses, "bg-muted/50 border-muted text-muted-foreground");
    }

    // Normal interactive state
    if (selectedAnswer === optionIndex) {
      return cn(baseClasses, "question-option-selected");
    }

    return cn(baseClasses, "hover:bg-accent hover:text-accent-foreground");
  };

  const handleOptionClick = (optionIndex: number) => {
    if (!disabled && onAnswerSelect) {
      onAnswerSelect(optionIndex);
    }
  };

  return (
    <div>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Question {questionNumber}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {questionNumber} of {totalQuestions}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Text */}
        <div className="space-y-3">
          <h3 className="text-base font-medium leading-relaxed text-foreground">{question.question}</h3>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium">Select your answer:</p>
          <div className="grid gap-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={disabled}
                className={getOptionClassName(index)}
                aria-pressed={selectedAnswer === index}
                aria-describedby={`option-${index}-description`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 flex items-center text-center">
                    <span className="w-6 h-6 rounded-full border border-current text-sm font-medium">
                      {optionLabels[index]}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm">{option}</span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Correct Answer Indicator (when in review mode) */}
        {showCorrectAnswer && (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Correct answer:</span>
              <span className="font-medium text-green-700">
                {optionLabels[question.correctAnswer]} - {question.options[question.correctAnswer]}
              </span>
            </div>

            {/* Explanation (if available) */}
            {question.explanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex flex-col items-start gap-2">
                  <span className="text-blue-600 font-medium text-sm">Explanation:</span>
                  <p className="text-blue-800 text-sm leading-relaxed">{question.explanation}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </div>
  );
}
