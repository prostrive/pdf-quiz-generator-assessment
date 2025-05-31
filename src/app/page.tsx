"use client";

import PdfUpload from "@/components/ui/upload-pdf";
import QuizDisplay from "@/components/ui/display-quiz";
import { Question } from "@/types";
import { useState } from "react";

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleQuizGenerated = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    setResetTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] space-y-16 max-w-3xl mx-auto">
      <h1 className="text-center text-4xl font-bold">PDF Quiz Generator</h1>

      <PdfUpload
        pdfFile={pdfFile}
        setPdfFile={setPdfFile}
        onQuizGenerated={handleQuizGenerated}
      />
      <QuizDisplay
        questions={questions}
        setQuestions={setQuestions}
        setPdfFile={setPdfFile}
        resetTrigger={resetTrigger}
      />
    </div>
  );
}
