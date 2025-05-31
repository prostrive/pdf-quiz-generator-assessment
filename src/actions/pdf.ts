"use server";

import { z } from "zod";
// import { formatError } from "@/lib/utils";
import { uploadPDFSchema } from "@/lib/validators";

import {
  getDocument,
  GlobalWorkerOptions,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import path from "path";

const workerPath = path.resolve(
  process.cwd(),
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs"
);

GlobalWorkerOptions.workerSrc = `file:///${workerPath}`;

export async function parsePDF(data: z.infer<typeof uploadPDFSchema>) {
  try {
    // Parse and validate data
    const validatedFile = uploadPDFSchema.parse(data);

    const arrayBuffer = await validatedFile.pdf.arrayBuffer();
    const loadingTask = await getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const pdfNumPages = pdf.numPages;

    if (pdfNumPages > 9) {
      return {
        success: false,
        message: "PDF must have less than 10 pages",
      };
    }

    let extractedText = "";
    const maxPages = Math.min(pdfNumPages, 10);

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");

      extractedText += pageText + "\n\n";
    }

    return {
      success: true,
      message: "PDF uploaded successfully",
      content: extractedText,
    };
  } catch (error) {
    console.log("error", error);
    return {
      success: false,
    //   message: formatError(error),
    };
  }
}