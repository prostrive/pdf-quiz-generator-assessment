import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { QuizData, QuizQuestion } from "@/types/quiz.type";

type Props = {
  quiz: QuizData;
  currentQuestion: number;
  question: QuizQuestion;
  selectedAnswer: number | null;
  handleAnswerSelect: (answerIndex: number) => void;
  handlePreviousQuestion: () => void;
  onReset: () => void;
  handleNextQuestion: () => void;
};
export function QuestionCard({
  quiz,
  currentQuestion,
  question,
  selectedAnswer,
  handleAnswerSelect,
  handlePreviousQuestion,
  onReset,
  handleNextQuestion,
}: Props) {
  return (
    <Card className="shadow-2xl border-0 bg-zinc-800 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-zinc-500/50 to-zinc-300/50 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
            {currentQuestion + 1}
          </div>
          <CardTitle className="text-2xl text-zinc-300 flex-1">
            {question.question}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <RadioGroup
          value={selectedAnswer?.toString()}
          onValueChange={(value) => handleAnswerSelect(parseInt(value))}
          className="space-y-4"
        >
          {question.options.map((option, index) => (
            <div
              key={index}
              className={cn(
                "group relative overflow-hidden rounded-xl border-2 transition-all duration-200",
                selectedAnswer === index
                  ? "border-purple-300 bg-gradient-to-r from-zinc-800 to-zinc-700 shadow-md"
                  : "border-zinc-500 border-2 border-dashed bg-zinc-900 hover:border-zinc-200 hover:bg-zinc-800/30"
              )}
            >
              <div className="flex items-center space-x-4 p-6">
                <RadioGroupItem
                  value={index.toString()}
                  id={`option-${index}`}
                  className="border-2 border-purple-300"
                />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer font-medium text-zinc-300 text-lg"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-zinc-500/50 to-zinc-300/50 text-white font-bold rounded-full mr-4 text-sm">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </Label>
              </div>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between mt-10">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className="h-12 px-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-4">
            <Button variant="outline" onClick={onReset} className="h-12 px-6">
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="h-12 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {currentQuestion === quiz.questions.length - 1
                ? "Finish Quiz"
                : "Next Question"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
