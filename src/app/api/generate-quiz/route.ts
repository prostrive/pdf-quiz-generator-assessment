import { buildCompactContext, compressPage } from "@/lib/compress";
import { generateQuestions } from "@/lib/openAI";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        {
          error:
            "Invalid request: 'text' field is required and must be a string.",
        },
        { status: 400 }
      );
    }

    // Compress the text into pages and build the context
    const compressedPages = compressPage(text);
    const context = buildCompactContext(compressedPages);

    // Generate questions using OpenAI
    let questions;
    try {
      questions = await generateQuestions(context);
    } catch (error) {
      console.error("Error generating questions:", error);
      return NextResponse.json(
        { error: "Failed to generate questions from the provided context." },
        { status: 500 }
      );
    }

    // Return the generated questions
    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in POST /api/generate-quiz:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
