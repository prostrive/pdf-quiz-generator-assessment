"use client";

import { useState } from "react";
import { UploadInterface } from "@/components/UploadInterface";

export default function Home() {
  const [processedFile, setProcessedFile] = useState<File | null>(null);

  const handleFileProcessed = (file: File) => {
    setProcessedFile(file);
    console.log("PDF file processed and ready:", file.name);
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

      <UploadInterface onFileProcessed={handleFileProcessed} />

      {processedFile && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            File processed: <span className="font-medium">{processedFile.name}</span>
          </p>
        </div>
      )}
    </div>
  );
}
