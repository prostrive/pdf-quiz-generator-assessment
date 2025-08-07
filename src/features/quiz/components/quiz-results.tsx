"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, RotateCcw, Trophy } from "lucide-react";
import { PdfInfo } from "@/features/quiz/components/pdf-info";
import { cn } from "@/lib/utils";
import { QuizData } from "@/types/quiz.type";

type Props = {
  quiz: QuizData;
  selectedAnswers: number[];
  calculateScore: (answers?: number[]) => number;
  onReset: () => void;
};

export function QuizResults({
  quiz,
  selectedAnswers,
  calculateScore,
  onReset,
}: Props) {
  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-emerald-600";
    if (percentage >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreGradient = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "from-emerald-500 to-green-600";
    if (percentage >= 60) return "from-amber-500 to-orange-600";
    return "from-red-500 to-rose-600";
  };

  const score = calculateScore();
  const total = quiz.questions.length;
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="relative z-10 max-w-5xl mx-auto pt-12 p-6">
      <Card className="shadow-2xl border-0 bg-zinc-800/95 backdrop-blur-sm mb-8">
        <CardHeader className="text-center pb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r rounded-full blur-lg opacity-30 animate-pulse",
                  getScoreGradient(score, total)
                )}
              ></div>
              <Trophy
                className={cn(
                  "relative h-16 w-16",
                  getScoreColor(score, total)
                )}
              />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-zinc-300 to-zinc-200 bg-clip-text text-transparent mb-4">
            Quiz Complete!
          </CardTitle>
          <CardDescription className="text-xl text-zinc-500">
            {quiz.title}
          </CardDescription>
          {quiz.metadata && (
            <div className="mt-6">
              <PdfInfo
                pageCount={quiz.metadata.pageCount}
                textLength={quiz.metadata.textLength}
                truncated={quiz.metadata.truncated}
              />
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="text-center mb-12">
            <div
              className={cn(
                "text-8xl font-bold mb-4",
                getScoreColor(score, total)
              )}
            >
              {score}/{total}
            </div>
            <div
              className={cn(
                "text-3xl font-semibold mb-6",
                getScoreColor(score, total)
              )}
            >
              {percentage}% Correct
            </div>
            <div className="max-w-md mx-auto">
              <Progress value={percentage} className="h-3" />
            </div>
          </div>

          <div className="grid gap-6">
            {quiz.questions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <Card
                  key={index}
                  className={cn(
                    "transition-all duration-200 bg-zinc-900 border-zinc-700"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex-1 pr-4 text-zinc-200">
                        <span className="text-zinc-500 font-bold mr-2">
                          Q{index + 1}.
                        </span>
                        {question.question}
                      </CardTitle>
                      {isCorrect ? (
                        <CheckCircle className="h-7 w-7 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-7 w-7 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all",
                            optionIndex === question.correctAnswer
                              ? "bg-emerald-500/50 border-zinc-500 text-emerald-800"
                              : optionIndex === userAnswer && !isCorrect
                              ? "bg-red-500/20 border-zinc-500 text-red-800"
                              : "bg-zinc-900 border-gray-200/50 opacity-20 border-dashed"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="font-semibold text-zinc-400 mr-3">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              <span className="font-medium text-zinc-300">
                                {option}
                              </span>
                            </div>
                            {optionIndex === question.correctAnswer && (
                              <CheckCircle className="h-5 w-5 text-emerald-600 mr-3" />
                            )}
                            {optionIndex === userAnswer && !isCorrect && (
                              <XCircle className="h-5 w-5 text-red-600 mr-3" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gradient-to-r from-zinc-700/50 to-zinc-900 p-4 rounded-lg border border-zinc-900">
                      <p className="text-zinc-400">
                        <span className="font-bold">💡 Explanation:</span>{" "}
                        {question.explanation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center mt-12">
            <Button
              onClick={onReset}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-12 px-8"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Generate New Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
