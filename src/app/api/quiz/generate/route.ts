import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/quizGeneration";
import { QuizGenerationOptions } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, options }: { content: string; options?: QuizGenerationOptions } = body;

    if (!content) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 });
    }

    // Generate the quiz using the server-side function
    const result = await generateQuiz(content, options);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in quiz generation API:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}
