"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfText, setPdfText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPdfText("");
      setError("");
    }
  };

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
        <label htmlFor="pdf-upload" className="sr-only">Upload PDF</label>
        <div className="flex justify-center w-full">
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            aria-label="Upload PDF file"
            className="block w-full max-w-xs text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
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
            <div className="mt-4 p-2 border rounded bg-gray-50 max-w-xl max-h-60 overflow-auto text-xs whitespace-pre-wrap">
              <strong>Extracted Text:</strong>
              <div>{pdfText}</div>
            </div>
            <Button
              className="w-full max-w-xs mt-4"
              onClick={handleGenerateQuiz}
              disabled={quizLoading}
              aria-busy={quizLoading}
            >
              {quizLoading ? "Generating Quiz..." : "Generate Quiz"}
            </Button>
            {quizError && (
              <div className="mt-2 p-2 border border-red-300 rounded bg-red-50 text-red-700 max-w-xl w-full text-xs" role="alert">
                <strong>Error:</strong> {quizError}
              </div>
            )}
          </>
        )}
        {quiz && (
          <div className="mt-6 w-full max-w-xl">
            <h2 className="text-2xl font-semibold mb-4">Quiz</h2>
            {quiz.map((q, idx) => (
              <div key={idx} className="mb-6 p-4 border rounded bg-white">
                <div className="font-medium mb-2">{idx + 1}. {q.question}</div>
                <ul className="space-y-2">
                  {q.options.map((opt: string, oidx: number) => (
                    <li key={oidx} className="pl-2">{String.fromCharCode(65 + oidx)}. {opt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
