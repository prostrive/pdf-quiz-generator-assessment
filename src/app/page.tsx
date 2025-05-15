"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PDFDocument } from "pdf-lib";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const [error, setError] = useState("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showButton, setShowButton] = useState<boolean>(false);
  const [questionnaire, setQuestionnaire] = useState<string | null>(null);

  const uploadHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = event.target?.files[0];

    // if (!file || file.type !== "application/pdf") {
    //   setError("Please upload valid PDF file!");
    //   return;
    // }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const numberOfPages = pdf.getPageCount();

      if (numberOfPages > 10) {
        setError("PDF has more than 10 pages please upload a smaller file!");
        return;
      }
      const pdfContents = await extractPdfContents(pdf);
      setExtractedText(pdfContents);
      setShowButton(true);
    } catch (err) {
      console.log("Error loading PDF: ", err);
      setError("Failed to Load PDF");
    }
  };

  const extractPdfContents = async (pdfDoc: PDFDocument) => {
    const pages = pdfDoc.getPages();
    let pdfContent = "";

    for (const page of pages) {
      const text = await page.getTextContent();
      pdfContent += text.items.map((items: any) => items.str).join(" ") + "\n";
    }

    return pdfContent;
  };

  const generateQuestionsHandler = async () => {
    if (!extractedText) {
      setError("No text extracted from PDF");
      return;
    }
    setLoading(true);
    try {
      if (typeof window !== "undefined" && window.HuggingFace) {
        const model = await window.HuggingFace.load("gpt2");
        const response = await model.generate({
          inputs: `Generate a 5-question questionaire based on the following text:\n\n${extractedText}`,
          paramerters: {
            max_length: 200,
          },
        });
        setQuestionnaire(response[0].generated_text);
      } else {
        setError("Transformer.js not loaded!");
      }
    } catch (error) {
      setError("Failed to generate questionnaire!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold">PDF Quiz Generator</h1>
      <input type="file" accept="application/pdf" onChange={uploadHandler} />
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {showButton && (
        <div>
          <button
            onClick={generateQuestionsHandler}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg blue-600"
          >
            {loading ? "Generating Questionnaire" : "Generate Questionnaire"}
          </button>
        </div>
      )}
      {questionnaire && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold">Generated questions:</h3>
          <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md">
            {questionnaire}
          </pre>
        </div>
      )}
    </div>
  );
}
