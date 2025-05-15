"use server"

import {
  getDocument,
  GlobalWorkerOptions,
} from "pdfjs-dist/legacy/build/pdf.mjs"
import path from "path"
import { type TextItem } from "pdfjs-dist/types/src/display/api"

const workerPath = path.resolve(
  process.cwd(),
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs",
)

GlobalWorkerOptions.workerSrc = `file:///${workerPath}`

export async function uploadPDF(file?: File | null) {
  const MAX_SIZE_MB = 3
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

  if (!file)
    return {
      success: false,
      message: "Please upload a PDF file.",
    }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`File is too large. Max size is ${MAX_SIZE_MB}MB.`)
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const typedArray = new Uint8Array(arrayBuffer)
    const pdf = await getDocument(typedArray).promise
    const totalPages = pdf.numPages

    if (totalPages > 9) {
      return {
        success: false,
        message: "PDF file must be 10 pages below.",
      }
    }

    let parsedText = ""

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()

      const pageText = textContent.items
        .filter((item): item is TextItem => "str" in item)
        .map((item) => item.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()

      parsedText += `${pageText}\n\n`
    }

    return {
      success: true,
      parsedText,
    }
  } catch {
    return {
      success: false,
      message: "Something went wrong please try again later.",
    }
  }
}
