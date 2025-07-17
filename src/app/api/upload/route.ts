import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { openai } from "@/lib/openai";

export async function POST(request: NextRequest) {
  // Import pdf-parse dynamically to avoid server-side issues
  const pdfParse = require("pdf-parse");

  try {
    // Check if the request has a body
    if (!request.body) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    // Extract the file from the request
    const formData = await request.formData();
    const file = formData.get("file") as Blob;
    // Validate the file type
    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    // Read the file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(buffer);
    // Get the total number of pages in the PDF
    const totalPages = pdfDoc.getPageCount();
    // initialize an array for chunks of text
    let pdfChunks: string[] = [];
    // Initialize an array to hold the generated questions
    let questions: any[] = [];
    const chunkSize = 5; // Number of pages to process at a time, change as needed to avoid token limits
    // Process the PDF in chunks of n-number of pages until we have 5 questions
    for (let pageIdx = 0; pageIdx < totalPages && questions.length < 5; pageIdx += chunkSize) {
      // Create a new PDF document for the current chunk
      const newPdf = await PDFDocument.create();
      const pagesToCopy = [];
      // Copy the next n pages from the original PDF to the new PDF
      for (let pageProcessingIdx = 0; pageProcessingIdx < chunkSize && pageIdx + pageProcessingIdx < totalPages; pageProcessingIdx++) {
        pagesToCopy.push(pageIdx + pageProcessingIdx);
      }
      // Copy the pages to the new PDF
      const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);
      copiedPages.forEach((page) => newPdf.addPage(page));
      // Convert the new PDF to a buffer and parse it to extract text
      const chunkBuffer = Buffer.from(await newPdf.save());
      const parsed = await pdfParse(chunkBuffer);
      const chunkText = parsed.text.trim();
      // If no text is extracted, skip to the next chunk
      if (!chunkText) continue;
      // Add the extracted text to the chunks array
      pdfChunks.push(chunkText);
    }
    while (pdfChunks.length > 0 && questions.length < 5) {
      for (let chunkIdx = 0; chunkIdx < pdfChunks.length && questions.length < 5; chunkIdx++) {
        // Generate a question using OpenAI's API based on the extracted text
        const prompt = `Based on the following text, generate 1 multiple choice question with 4 options. Respond in JSON format like this:
        {
          "question": "Your question here?",
          "choices": {
            "a": "Option A",
            "b": "Option B",
            "c": "Option C",
            "d": "Option D"
          },
          "answerKey": "a"
        }

        Text:
        """${pdfChunks[chunkIdx]}"""`;
        // Log the prompt for debugging
        try {
          // Call OpenAI's API to generate the question
          const aiRes = await openai.chat.completions.create({
            model: process.env.OPENAI_GPT_MODEL || "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          });
          // Extract the question from the response
          const question = aiRes.choices[0]?.message?.content?.trim();
          // If a question is generated, add it to the questions array
          if (question) questions.push(JSON.parse(question));
        } catch (error) {
          console.error("OpenAI API error:", error);
          return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
        }
      }
    }
    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
  }
}
