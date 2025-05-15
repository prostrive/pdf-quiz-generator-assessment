"use client";

import { useEffect, useState } from "react";
import { Question } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { evaluateShortAnswerWithOpenAI } from "@/lib/actions/quiz";

export default function QuizDisplay({
  questions,
  setQuestions,
  setPdfFile,
  resetTrigger,
}: {
  questions: Question[];
  setQuestions: (qs: Question[]) => void;
  setPdfFile: (file: File | null) => void;
  resetTrigger: number; // used to re-trigger quiz reset
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[current];

  useEffect(() => {
    // Reset local state when resetTrigger changes
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }, [resetTrigger]);

  const handleSubmit = async () => {
    if (currentQuestion.type === "short-answer") {
      if (!selected || selected.trim() === "") return;
      setLoading(true);
      const result = await evaluateShortAnswerWithOpenAI(
        currentQuestion.question,
        currentQuestion.answer,
        selected
      );
      setLoading(false);

      if (result.success && result.response === 1) {
        setScore((prev) => prev + 1);
      }
    } else {
      if (selected === currentQuestion.answer) {
        setScore((prev) => prev + 1);
      }
    }

    setSelected(null);

    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setPdfFile(null);
  };

  if (!questions.length) return null;

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        {finished ? (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Quiz Completed!</h2>
              <p className="text-lg">
                Your score: {score} / {questions.length}
              </p>
              <Button className="mt-4" onClick={resetQuiz}>
                Try another PDF!
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-medium">
              Question {current + 1} of {questions.length}
            </h2>
            <p className="font-semibold">{currentQuestion.question}</p>

            {currentQuestion.type === "multiple-choice" ? (
              <RadioGroup value={selected ?? ""} onValueChange={setSelected}>
                {currentQuestion.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${idx}`} />
                    <Label htmlFor={`option-${idx}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Input
                type="text"
                placeholder="Type your answer here"
                value={selected ?? ""}
                onChange={(e) => setSelected(e.target.value)}
              />
            )}

            <Button
              onClick={handleSubmit}
              disabled={
                !selected ||
                (currentQuestion.type === "short-answer" && loading)
              }
              className="mt-4"
            >
              {loading ? "Checking..." : "Submit Answer"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
