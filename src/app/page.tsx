"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import QuizContainer from "@/components/QuizContainer";
import ExtractedText from "@/components/ExtractedText";
import GenerateQuizButton from "@/components/GenerateQuizButton";
import FileUpload from "@/components/FileUpload";
import type { QuizQuestion } from "@/types/quiz";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfText, setPdfText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");

  // Extract text from PDF using PDF.js
  const extractTextFromPDF = async (file: File) => {
    setLoading(true);
    setPdfText("");
    setError("");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      // Set workerSrc globally for PDF.js (production-ready, local worker)
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      const maxPages = Math.min(pdf.numPages, 10);
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => {
            if (typeof item === 'object' && item !== null && 'str' in item) {
              return (item as { str: string }).str;
            }
            return "";
          })
          .join(" ");
        text += pageText + "\n";
      }
      setPdfText(text);
    } catch (err: unknown) {
      let message = "Failed to extract text from PDF.";
      if (typeof err === "object" && err !== null && "message" in err && typeof (err as Record<string, unknown>).message === "string") {
        message = (err as { message: string }).message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Call API to generate quiz from extracted text
  const handleGenerateQuiz = async () => {
    setQuiz(null);
    setQuizError("");
    setQuizLoading(true);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pdfText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz.");
      setQuiz(data.quiz);
    } catch (err) {
      let message = "Failed to generate quiz.";
      if (typeof err === "object" && err !== null && "message" in err && typeof (err as Record<string, unknown>).message === "string") {
        message = (err as { message: string }).message;
      }
      setQuizError(message);
    } finally {
      setQuizLoading(false);
    }
  };

  return (
    <main className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold">PDF Quiz Generator</h1>
      <section className="flex flex-col items-center gap-4 w-full max-w-xl">
        <FileUpload
          onFileChange={(file) => {
            setSelectedFile(file);
            setPdfText("");
            setError("");
          }}
          selectedFile={selectedFile}
          disabled={loading}
        />
        <Button
          disabled={!selectedFile || loading}
          onClick={() => selectedFile && extractTextFromPDF(selectedFile)}
          aria-busy={loading}
          aria-disabled={!selectedFile || loading}
          className="w-full max-w-xs"
        >
          {loading ? "Extracting..." : "Upload PDF"}
        </Button>
        {selectedFile && <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>}
        {error && (
          <div className="mt-2 p-2 border border-red-300 rounded bg-red-50 text-red-700 max-w-xl w-full text-xs" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}
        {pdfText && !quiz && (
          <>
            <ExtractedText text={pdfText} />
            <GenerateQuizButton
              loading={quizLoading}
              onClick={handleGenerateQuiz}
              error={quizError}
            />
          </>
        )}
        {quiz && (
          <QuizContainer quiz={quiz as QuizQuestion[]} />
        )}
      </section>
    </main>
  );
}
