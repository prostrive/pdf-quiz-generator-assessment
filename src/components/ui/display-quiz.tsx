"use client";

import { useEffect, useState } from "react";
import { Question } from "@/types";
import { Button } from "./button";
import { Card, CardContent, GradientCard } from "@/components/ui/ui/cards";
import { RadioGroup, RadioGroupItem } from "@/components/ui/ui/radio-group";
import { Label } from "@/components/ui/ui/labels";
import { Input } from "@/components/ui/ui/input";
import {
  evaluateShortAnswerWithOpenAI,
  evaluateMockShortAnswer,
} from "@/actions/quiz";
import { CheckCircle2, Loader2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuizDisplay({
  questions,
  setQuestions,
  setPdfFile,
  resetTrigger,
}: {
  questions: Question[];
  setQuestions: (qs: Question[]) => void;
  setPdfFile: (file: File | null) => void;
  resetTrigger: number;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );

  const currentQuestion = questions[current];

  useEffect(() => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setFeedback(null);
  }, [resetTrigger]);

  const handleSubmit = async () => {
    if (currentQuestion.type === "single-choice") {
      if (!selected || selected.trim() === "") return;
      setLoading(true);
      const result = await evaluateMockShortAnswer(
        currentQuestion.question,
        currentQuestion.answer,
        selected
      );
      setLoading(false);

      if (result.success && result.response === 1) {
        setScore((prev) => prev + 1);
        setFeedback("correct");
      } else {
        setFeedback("incorrect");
      }
    } else {
      if (selected === currentQuestion.answer) {
        setScore((prev) => prev + 1);
        setFeedback("correct");
      } else {
        setFeedback("incorrect");
      }
    }

    setTimeout(() => {
      setSelected(null);
      setFeedback(null);

      if (current + 1 < questions.length) {
        setCurrent((prev) => prev + 1);
      } else {
        setFinished(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setQuestions([]);
    setPdfFile(null);
  };

  if (!questions.length) return null;

  return (
    <GradientCard className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8 space-y-6">
        {finished ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Quiz Completed!
            </h2>
            <div className="space-y-2">
              <p className="text-2xl font-semibold">
                Score: {score} / {questions.length}
              </p>
              <p className="text-muted-foreground">
                {score === questions.length
                  ? "Perfect score! 🎉"
                  : score >= questions.length * 0.7
                  ? "Great job! 🌟"
                  : "Keep practicing! 💪"}
              </p>
            </div>
            <Button
              onClick={resetQuiz}
              className="mt-6 h-12 px-8 text-lg font-medium hover:scale-105 transition-transform"
            >
              Try Another PDF
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Question {current + 1} of {questions.length}
              </h2>
              <div className="text-sm text-muted-foreground">
                Score: {score}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-lg font-medium">{currentQuestion.question}</p>

              {currentQuestion.type === "multiple-choice" ? (
                <RadioGroup
                  value={selected ?? ""}
                  onValueChange={setSelected}
                  className="space-y-3"
                >
                  {currentQuestion.options?.map((option, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200",
                        selected === option
                          ? "border-primary bg-primary/5 scale-[1.02]"
                          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.01]"
                      )}
                    >
                      <RadioGroupItem value={option} id={`option-${idx}`} />
                      <Label
                        htmlFor={`option-${idx}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Input
                  type="text"
                  placeholder="Type your answer here..."
                  value={selected ?? ""}
                  onChange={(e) => setSelected(e.target.value)}
                  className="h-12 text-lg focus:scale-[1.01] transition-transform"
                />
              )}
            </div>

            {feedback && (
              <div
                className={cn(
                  "p-4 rounded-lg flex items-center gap-2 animate-in slide-in-from-bottom-4",
                  feedback === "correct"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-red-500/10 text-red-500"
                )}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {feedback === "correct" ? "Correct!" : "Incorrect!"}
                </span>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={
                !selected ||
                (currentQuestion.type === "single-choice" && loading) ||
                feedback !== null
              }
              className="w-full h-12 text-lg font-medium hover:scale-[1.02] transition-transform"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                "Submit Answer"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </GradientCard>
  );
}
