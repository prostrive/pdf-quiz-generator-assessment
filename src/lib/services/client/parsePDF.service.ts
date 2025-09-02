import {
  getDocument,
  GlobalWorkerOptions,
} from 'pdfjs-dist/legacy/build/pdf.mjs';
import { pdfFileValidator } from '@/lib/validators/pdfFile.validator';
import { z } from 'zod';
import { PDFDocumentProxy } from "pdfjs-dist";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import { ParsePDFResponse } from '@/lib/types/pdfDetails.type';

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export async function parsePDF(file: z.infer<typeof pdfFileValidator>): Promise<ParsePDFResponse> {
    try {
        const validatedFile = pdfFileValidator.parse(file);

        const arrayBuffer: ArrayBuffer = await validatedFile.pdf.arrayBuffer();
        const pdf: PDFDocumentProxy = await getDocument({ data: arrayBuffer}).promise;
        const pdfNumPages = pdf.numPages;

        if (pdfNumPages >= 10) {
            return {
                success: false,
                message: "PDF has too many pages. Please upload a PDF with less than 10 pages."
            }
        };

        let extractedText: string = "";
        const maxPages = Math.min(pdfNumPages, 10);

        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item) => {
                if ("str" in item) {
                    return (item as TextItem).str;
                }
                return "";
                })
                .join(" ");

            extractedText += pageText + '\n\n'.trim();
        }

        return {
            success: true,
            message: "PDF Parse Successfully",
            extractedText: extractedText
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to parse PDF file.",
        }
    }
}