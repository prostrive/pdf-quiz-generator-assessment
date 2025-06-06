'use server';

import { formatError } from './utils';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateQuiz(pdfContent: string) {
  try {
    const prompt = `
Generate 5 questions based on the following text:
${pdfContent}

Each question should contain a question text and 4 options with 1 correct answer and return the result as a JSON array with each question formatted like this:
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "answer": "..."
  }
]
Only output JSON.
`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a quiz generator.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    // Extract the content from the completion result, defaulting to an empty array string
    let rawContent = completion.choices[0].message.content ?? '[]';

    /**
     * Clean up Markdown-style code block wrappers (e.g. ```json ... ```)
     */
    rawContent = rawContent
      .trim()
      .replace(/^```(?:json)?\s*/i, '') // Remove opening ``` or ```json (case-insensitive)
      .replace(/```$/, '') // Remove closing ```
      .trim();

    const questions = JSON.parse(rawContent);

    return {
      success: true,
      message: 'Generate questions successfully',
      questions,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
