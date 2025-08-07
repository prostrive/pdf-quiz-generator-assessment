import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import pdfParse from "pdf-parse-new";
import _ from "lodash";
import { chunkText } from "@/lib/utils/chunk-text";
import {
  CHUNKS,
  MAX_FILE_SIZE,
  OPENAI_MODEL,
  QUESTIONS_COUNT,
} from "@/lib/constants";
import { QuizSchema } from "@/lib/schemas/quiz.schema";

/**
 * Generates a multiple-choice quiz from the content of a PDF file using OpenAI.
 *
 * Validates the file, extracts text using PDF parsing, chunks the content if needed,
 * and sends it to the OpenAI API to generate questions. Then, merges and shuffles
 * the questions into a final quiz object with metadata.
 *
 * @param {File} file - The PDF file to process.
 * @returns {Promise<{
 *   title: string,
 *   questions: Array<{
 *     question: string,
 *     options: string[],
 *     correctAnswer: number,
 *     explanation: string
 *   }>,
 *   metadata: {
 *     pageCount: number,
 *     textLength: number,
 *     chunkCount: number,
 *     questionCount: number
 *   }
 * }>} - The generated quiz object with questions and metadata.
 *
 * @throws {Error} If the file is missing, invalid, too large, or has insufficient extractable text.
 */
export async function generateQuizFromPdf(file: File) {
  if (!file) throw new Error("No PDF file provided");

  if (file.type !== "application/pdf")
    throw new Error("Invalid file type. Please upload PDF only");

  if (file.size > +MAX_FILE_SIZE)
    throw new Error(`File size exceeds the ${MAX_FILE_SIZE}MB limit.`);

  const buffer = Buffer.from(await file.arrayBuffer());
  const pdfData = await pdfParse(buffer);
  const text = pdfData.text?.trim();

  if (!text || text.length < 100)
    throw new Error("PDF has insufficient extractable text");

  if (text.length > CHUNKS.LARGE)
    throw new Error("PDF has insufficient extractable text");

  // Smart chunking based on total text length and desired question count
  const chunks =
    text.length < CHUNKS.LARGE && text.length >= CHUNKS.MEDIUM
      ? chunkText(text, Math.ceil(text.length / +QUESTIONS_COUNT))
      : [text];
  const quizzes = [];

  for (const chunk of chunks) {
    const content = `
      Create a ${QUESTIONS_COUNT}-question multiple choice quiz from this text. Include:
      - A descriptive title
      - ${QUESTIONS_COUNT} questions with 4 options in array (no labels like A, B, etc.)
      - Index of correct answer (0-based)
      - Brief explanation for each answer
      - Remove duplicate question from previous chats

      Text:
      ${chunk}`.trim();

    const result = await generateObject({
      model: openai(OPENAI_MODEL),
      messages: [
        {
          role: "user",
          content,
        },
      ],
      schema: QuizSchema,
      temperature: 0.7,
    });
    quizzes.push(result.object);
  }

  // Merge & shuffle all questions
  const allQuestions = quizzes.flatMap((q) => q.questions);
  const mergedQuiz = {
    title: quizzes[0]?.title || "Generated Quiz",
    questions: _.shuffle(allQuestions).slice(0, +QUESTIONS_COUNT),
  };

  return {
    ...mergedQuiz,
    metadata: {
      pageCount: pdfData.numpages,
      textLength: text.length,
      chunkCount: chunks.length,
      questionCount: QUESTIONS_COUNT,
    },
  };
}
