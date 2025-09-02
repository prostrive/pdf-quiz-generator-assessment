'use client'

import PDFUploadForm from "@/components/sections/pdfUploadForm";
import { useState } from "react";

export default function Home() {
  const [quizQuestions, setQuizQuestions] = useState<QuizDetails[]>([]);

  const handleGeneratedQuizDetails = (quizDetails: QuizDetails[]) => {
    setQuizQuestions(quizDetails);
  }
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold">PDF Quiz Generator</h1>
      <PDFUploadForm 
          quizDetails={handleGeneratedQuizDetails}
      />
    </div>
  );
}
