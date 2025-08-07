"use client";
import { Quiz } from "@/features/quiz";
import { QuizHistory } from "@/features/quiz-history";
import { UploadPDF } from "@/features/upload-pdf";
import { useQuiz } from "@/hooks/use-quiz";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Home() {
  const {
    quiz,
    loading,
    onQuizComplete,
    resetQuiz,
    generateQuiz,
    loadQuizFromHistory,
  } = useQuiz();
  const [file, setFile] = useState<File | null>(null);

  return (
    <div
      className={cn(
        "relative z-10 flex min-h-screen",
        quiz && "justify-center"
      )}
    >
      {quiz ? (
        <Quiz
          quiz={quiz}
          onReset={() => {
            resetQuiz();
            setFile(null);
          }}
          onComplete={(score: number) => {
            onQuizComplete(score);
            setFile(null);
          }}
        />
      ) : (
        <>
          <QuizHistory loadQuizFromHistory={loadQuizFromHistory} />
          <UploadPDF
            file={file}
            setFile={setFile}
            generateQuiz={generateQuiz}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}
