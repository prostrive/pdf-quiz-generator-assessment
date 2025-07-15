"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import QuizContainer from "@/components/QuizContainer";
import ExtractedText from "@/components/ExtractedText";
import GenerateQuizButton from "@/components/GenerateQuizButton";
import FileUpload from "@/components/FileUpload";
import ErrorAlert from "@/components/ErrorAlert";
import LoadingSpinner from "@/components/LoadingSpinner";
import { usePdfTextExtractor } from "@/hooks/usePdfTextExtractor";
import { useQuizGenerator } from "@/hooks/useQuizGenerator";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { extractText, loading, error, text: pdfText } = usePdfTextExtractor();
  const { generateQuiz, quiz, loading: quizLoading, error: quizError } = useQuizGenerator();

  return (
    <main className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold">PDF Quiz Generator</h1>
      <section className="flex flex-col items-center gap-4 w-full max-w-xl">
        <FileUpload
          onFileChange={(file) => {
            setSelectedFile(file);
            if (file) extractText(file);
          }}
          selectedFile={selectedFile}
          disabled={loading}
        />
        <Button
          disabled={!selectedFile || loading}
          onClick={() => selectedFile && extractText(selectedFile)}
          aria-busy={loading}
          aria-disabled={!selectedFile || loading}
          className="w-full max-w-xs"
        >
          {loading ? "Extracting..." : "Upload PDF"}
        </Button>
        {selectedFile && <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>}
        {loading && <LoadingSpinner className="my-4" />}
        {error && <ErrorAlert message={error} />}
        {pdfText && !quiz && (
          <>
            <ExtractedText text={pdfText} />
            <GenerateQuizButton
              loading={quizLoading}
              onClick={() => pdfText && generateQuiz(pdfText)}
              error={quizError}
            />
          </>
        )}
        {quiz && (
          <QuizContainer quiz={quiz} />
        )}
      </section>
    </main>
  );
}
