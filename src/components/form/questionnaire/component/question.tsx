"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Choices, Question as QuestionType } from "@/lib/database";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { useMemo } from "react";

type Props = QuestionType & {
  isCompleted?: boolean;
  questionIndex: number;
  fileId: string;
  isLoading: boolean;
  userAnswer: string | null;
  isCorrect: boolean;
};

export default function Question({
  question,
  options,
  answer,
  userAnswer,
  isCorrect,
  questionIndex,
  fileId,
  type,
  isLoading,
  isCompleted = false,
}: Props) {
  const normalizedQuestionIndex = useMemo(
    () => questionIndex + 1,
    [questionIndex]
  );

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>
          Q{normalizedQuestionIndex}: {question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {type === "multiple_choice" && options && (
            <RadioGroup
              disabled={isLoading || isCompleted}
              name={`${fileId}:${questionIndex}`}
              defaultValue={userAnswer ? userAnswer : undefined}
            >
              {Object.keys(options).map((choice, i) => {
                const isCorrectAnswer = answer === choice;
                const _correct = isCorrect || isCorrectAnswer;
                const isUserOrCorrectAnswer =
                  choice === userAnswer || answer === choice;

                return (
                  <div key={i} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={choice}
                      id={`${fileId}:${questionIndex}:${i}`}
                    />
                    <Label
                      htmlFor={`${fileId}:${questionIndex}:${i}`}
                      className={
                        isCompleted && isUserOrCorrectAnswer
                          ? cn(_correct ? "text-green-700" : "text-red-700")
                          : ""
                      }
                    >
                      {options[choice as Choices]}
                      {isCompleted && isUserOrCorrectAnswer ? (
                        _correct ? (
                          <Check size={14} />
                        ) : (
                          <X size={14} />
                        )
                      ) : (
                        <></>
                      )}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          )}
          {type === "free_text" && (
            <>
              <div className="grid gap-1">
                <Input
                  defaultValue={userAnswer ? userAnswer : undefined}
                  disabled={isLoading || isCompleted}
                  name={`${fileId}:${questionIndex}`}
                />
                <Label
                  className={cn(
                    "font-normal",
                    isCorrect ? "text-green-700" : "text-red-700"
                  )}
                >
                  {isCompleted && (
                    <>Your answer is {isCorrect ? "correct" : "incorrect"}</>
                  )}
                </Label>
              </div>
              {isCompleted && (
                <Alert>
                  <AlertDescription className="text-xs text-black font-normal">
                    {answer}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
