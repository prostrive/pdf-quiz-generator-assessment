"use server";

import { GenerateQuizOptions } from "@/types";
import { formatError } from "../utils";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateQuiz(
  content: string,
  options: GenerateQuizOptions = {}
) {
  try {
    const prompt = `
Generate 5 quiz questions based on the following text:
${content}

Each question should have:
- A question text
- A type: "multiple-choice" or "short-answer"
- If multiple-choice: 4 options and one correct answer
- If short-answer: a single correct answer

${
  options.includeShortAnswers
    ? "Mix multiple-choice and short-answer questions."
    : "Only generate multiple-choice questions."
}

Return the result as a JSON array with each question like:
[
  {
    "type": "multiple-choice",
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "answer": "..."
  },
  {
    "type": "short-answer",
    "question": "...",
    "answer": "..."
  }
]
Only output JSON.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a quiz generator." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    let raw = completion.choices[0].message.content || "[]";

    // Remove Markdown code block formatting like ```json ... ```
    raw = raw
      .trim()
      .replace(/^```(?:json)?/, "")
      .replace(/```$/, "")
      .trim();

    const questions = JSON.parse(raw);

    return {
      success: true,
      message: "Generate questions successfully",
      questions,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function evaluateShortAnswerWithOpenAI(
  question: string,
  expectedAnswer: string,
  userAnswer: string
) {
  try {
    const prompt = `
You are a quiz evaluator. Given a question, the expected correct answer, and the user's answer, return ONLY 1 if the user's answer is correct or 0 if incorrect. Do not include any explanation or text, only a single number.

Question: ${question}
Expected Answer: ${expectedAnswer}
User's Answer: ${userAnswer}

Respond with 1 for correct, or 0 for incorrect.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that evaluates short answer quiz responses.",
        },
        {
          role: "user",
          content: prompt.trim(),
        },
      ],
    });

    const response = completion.choices[0].message.content?.trim() ?? "";

    return {
      success: true,
      message: "Successfully evaluated short-answer type question",
      response: response === "1" ? 1 : 0,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
