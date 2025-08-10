import OpenAI from "openai";

const MAX_QUESTIONS = Number.parseInt(process.env.MAX_QUESTIONS || "") || 5;
export const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateQuestions = async (text: string) => {
  const notesResponse = await client.responses.create({
    model: "gpt-5-mini",
    instructions:
      "Condense the context into bullet points 'exam notes' with facts, definitions, and relationships. No fluff, no repetition.",
    input: text,
  });

  const notes = notesResponse.output_text;

  const questionsResponse = await client.responses.create({
    model: "gpt-5-mini",
    instructions: `Write ${MAX_QUESTIONS} questions based on the given context in JSON format: { question: string, choices: Array<string>, answer: number }. There should always be 4 non-duplicates choices for each question. The answer is the index of the correct answer in the array.`,
    input: notes,
  });

  return JSON.parse(questionsResponse.output_text);
};
