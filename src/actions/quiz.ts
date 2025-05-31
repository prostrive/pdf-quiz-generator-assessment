"use server";

import { GenerateQuizOptions } from "@/types";
import { formatError } from "@/lib/utils";
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
  options.includeSingleAnswer
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
      model: "gpt-3.5-turbo",
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
      model: "gpt-3.5-turbo",
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

// Mock quiz data for testing
const mockQuestions = [
  {
    type: "multiple-choice",
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    answer: "Paris"
  },
  {
    type: "multiple-choice",
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    answer: "Mars"
  },
  {
    type: "single-choice",
    question: "What is the chemical symbol for water?",
    answer: "H2O"
  },
  {
    type: "multiple-choice",
    question: "Who painted the Mona Lisa?",
    options: ["Van Gogh", "Da Vinci", "Picasso", "Rembrandt"],
    answer: "Da Vinci"
  },
  {
    type: "single-choice",
    question: "What is the largest mammal in the world?",
    answer: "Blue Whale"
  }
];

// Mock function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock quiz generator
export async function generateMockQuiz() {
  await delay(2000); // Simulate API delay
  return {
    success: true,
    message: "Generated mock questions successfully",
    questions: mockQuestions
  };
}

// Mock short answer evaluator
export async function evaluateMockShortAnswer(
  question: string,
  expectedAnswer: string,
  userAnswer: string
) {
  await delay(1000); // Simulate API delay
  const isCorrect = userAnswer.toLowerCase().trim() === expectedAnswer.toLowerCase().trim();
  return {
    success: true,
    message: "Successfully evaluated short-answer type question",
    response: isCorrect ? 1 : 0
  };
}