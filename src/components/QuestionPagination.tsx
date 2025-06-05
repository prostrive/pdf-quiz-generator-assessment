import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  totalQuestions: number;
  currentQuestionIndex: number;
  userAnswers: (number | undefined)[];
  onQuestionSelect: (index: number) => void;
  disabled?: boolean;
}

export function QuestionPagination({
  totalQuestions,
  currentQuestionIndex,
  userAnswers,
  onQuestionSelect,
  disabled = false
}: Props) {
  return (
    <div className="space-y-3 mb-6 sm:mb-8">
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-2">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const isAnswered = userAnswers[index] !== undefined;
          const isCurrentQuestion = index === currentQuestionIndex;
          const className = cn(
            "w-10 h-10 rounded-full border-2 transition-all duration-200",
            isAnswered
              ? "bg-green-500 text-white border-green-500 hover:bg-green-600 hover:text-white hover:border-green-600"
              : "bg-white text-foreground border-muted-foreground hover:bg-accent hover:border-accent-foreground",
            !isAnswered && isCurrentQuestion && "border-primary",
            isCurrentQuestion &&
              "border-0 bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-bold"
          );

          return (
            <Button
              key={index}
              onClick={() => onQuestionSelect(index)}
              variant="outline"
              size="sm"
              className={className}
              disabled={disabled}
            >
              {index + 1}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
