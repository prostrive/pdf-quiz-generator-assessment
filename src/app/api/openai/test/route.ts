import { NextResponse } from "next/server";
import { testOpenAIConnection } from "@/lib/openai";

export async function POST() {
  try {
    const result = await testOpenAIConnection();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in OpenAI test API:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}
