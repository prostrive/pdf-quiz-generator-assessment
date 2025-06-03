"use client";

import { useState } from "react";

import { QuizQuestion } from "@/actions/generateQuestions";
import UploadForm from "./UploadForm";
import QuizForm from "./QuizForm";

export default function QuizGenerator() {
  const [quiz, setQuiz] = useState<QuizQuestion[]>();

  if (quiz)
    return (
      <QuizForm
        quiz={quiz}
        onGenerateAgain={() => {
          setQuiz(undefined);
        }}
      />
    );

  return (
    <UploadForm
      onGenerate={(newQuiz) => {
        setQuiz(newQuiz);
      }}
    />
  );
}
