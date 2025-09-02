'use client'

import PDFUploadForm from "@/components/sections/pdfUploadForm";
import QuizViewer from "@/components/sections/quizViewer";
import { useState } from "react";

export default function Home() {
  const [quizQuestions, setQuizQuestions] = useState<QuizDetails[]>([]);

  const handleGeneratedQuizDetails = (quizDetails: QuizDetails[]) => {
    setQuizQuestions(quizDetails);
  }
  return (
    <div className="min-h-screen p-6 sm:p-10 font-[family-name:var(--font-geist-sans)] flex flex-col items-center gap-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-center">
        PDF Quiz Generator
      </h1>
      <div className="w-full max-w-2xl">
        <PDFUploadForm quizDetails={handleGeneratedQuizDetails} />
      </div>
      <div className="w-full max-w-2xl">
        <QuizViewer quizQuestions={quizQuestions} />
      </div>
    </div>
  );
}
