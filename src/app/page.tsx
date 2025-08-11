"use client";
import GeneratePDF from "@/components/common/generatePDF";
import StepsHeader from "@/components/common/stepsHeader";
import UploadPDF from "@/components/common/uploadPDF";
import { useRef, useState } from "react";
import axios from "axios";
import GenerateQuiz from "@/components/common/generateQuiz";
import ShowResults from "@/components/common/showResults";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<StepType>("upload");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [quiz, setQuiz] = useState(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps: StepType[] = ["upload", "generate", "quiz"];

  const extractTextFromPDF = async (file: File) => {
    setIsExtracting(true);
    setError("");

    try {
      const pdfjsLib = await import("pdfjs-dist");

      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

      if (pdf._pdfInfo.numPages > 10) {
        throw Error("PDF has too many pages. Maximum 10 pages allowed.");
      }

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");

        fullText += pageText + "\n\n";
      }

      const trimmedText = fullText.trim();

      if (!trimmedText || trimmedText.length < 100) {
        throw new Error(
          "This PDF doesn't contain enough readable text. Please upload a different PDF."
        );
      }

      setExtractedText(trimmedText);
      setCurrentStep("generate");
    } catch (error: any) {
      console.error("PDF extraction error:", error);
      setError(
        error.message || "Failed to process PDF. Please try a different file."
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size too large. Please select a PDF smaller than 10MB.");
      return;
    }

    setPdfFile(file);
    await extractTextFromPDF(file);
  };

  const generateQuiz = async () => {
    setIsGenerating(true);
    setError("");

    try {
      if (!extractedText) {
        setError("No content to generate quiz from.");
        return;
      }

      const response = await axios.post("/api/generate-quiz", {
        content: extractedText,
      });
      const quizData = await response.data;

      if (!quizData.success || !quizData.quiz) {
        throw new Error("Failed to generate quiz questions.");
      }

      setQuiz(quizData.quiz);
      setCurrentStep("quiz");
    } catch (error: any) {
      console.error("Quiz generation error:", error);

      if (!error.response) {
        setError(
          "Connection failed. Please check your internet and try again."
        );
      } else if (error.response?.status >= 500) {
        setError("Server error occurred. Please try again in a moment.");
      } else {
        setError(
          "Failed to generate quiz. Please try again or upload a different PDF."
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const getStepStatus = (step: StepType): StepStatus => {
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);

    if (stepIndex < currentIndex) return "complete";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  const handleAnswerSelect = (questionId: number, value: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: parseInt(value),
    }));
  };

  const handleReset = () => {
    setCurrentStep("upload");
    setPdfFile(null);
    setExtractedText("");
    setQuiz(null);
    setUserAnswers({});
    setShowResults(false);
    setError("");
    setIsExtracting(false);
    setIsGenerating(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearError = () => {
    setError("");
  };

  return (
    <div className="flex flex-col gap-10 items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-4xl font-bold">PDF Quiz Generator</h1>
        <h2 className="text-xl">
          Upload a PDF and generate an interactive quiz with OpenAI
        </h2>
      </div>

      <StepsHeader onStatusChange={getStepStatus} steps={steps} />

      {currentStep === "upload" && (
        <UploadPDF
          isLoading={isExtracting}
          onFileSelect={handleFileSelect}
          error={error}
          onClearError={handleClearError}
          ref={fileInputRef}
        />
      )}

      {currentStep === "generate" && (
        <GeneratePDF
          file={pdfFile as File}
          isLoading={isGenerating}
          ref={canvasRef}
          onGenerate={generateQuiz}
          onClearError={handleClearError}
        />
      )}

      {currentStep === "quiz" && quiz && !showResults && (
        <GenerateQuiz
          quiz={quiz}
          onAnswerSelect={handleAnswerSelect}
          onSubmit={() => setShowResults(true)}
          userAnswers={userAnswers}
        />
      )}

      {showResults && quiz && (
        <ShowResults
          quiz={quiz}
          userAnswers={userAnswers}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
