import { useState } from "react";

export function usePdfTextExtractor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");

  const extractText = async (file: File) => {
    setLoading(true);
    setError("");
    setText("");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let extracted = "";
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
        extracted += pageText + "\n";
      }
      setText(extracted);
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

  return { extractText, loading, error, text };
} 