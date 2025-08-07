import { NextRequest } from "next/server";
import { generateQuizFromPdf } from "@/lib/utils/generate-quiz-from-pdf";

/**
 * Handles a POST request to generate a quiz from a PDF file.
 *
 * @param {NextRequest} request - The incoming request object from Next.js API route.
 * @returns {Promise<Response>} - A JSON response containing the generated quiz or an error message.
 *
 * @throws {Error} If the OpenAI API key is missing or if any step in the quiz generation fails.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey)
      throw new Error(
        "Missing OpenAI API key. Please set OPENAI_API_KEY in your .env.local."
      );

    const formData = await request.formData();
    const file = formData.get("pdf") as File;

    const quiz = await generateQuizFromPdf(file);

    return Response.json(quiz);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
