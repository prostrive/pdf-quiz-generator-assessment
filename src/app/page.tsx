"use client";

import { useState } from "react";
import { UploadInterface } from "@/components/UploadInterface";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleFileValidated = (file: File) => {
    setSelectedFile(file);
    console.log("Valid PDF file selected:", file.name);

    simulateProcessing();
  };

  const simulateProcessing = () => {
    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate processing progress
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);

          return 100;
        }

        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">PDF Quiz Generator</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload a PDF document and generate interactive quizzes using AI. Perfect for studying, training, or knowledge
          assessment.
        </p>
      </div>

      <UploadInterface
        onFileValidated={handleFileValidated}
        isProcessing={isProcessing}
        processingProgress={processingProgress}
      />

      {selectedFile && !isProcessing && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Ready to process: <span className="font-medium">{selectedFile.name}</span>
          </p>
        </div>
      )}
    </div>
  );
}
