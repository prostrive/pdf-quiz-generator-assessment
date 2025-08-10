"use client";

import QuizGenerator from "@/components/quiz-generator/QuizGenerator";
import Quiz from "@/components/quiz/Quiz";
import { Questions } from "@/types";
import { useState } from "react";

export default function Home() {
  const [questions, setQuestions] = useState<Questions | null>(null);

  return questions ? (
    <Quiz questions={questions} setQuestions={setQuestions} />
  ) : (
    <QuizGenerator setQuestions={setQuestions} />
  );
}
