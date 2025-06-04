import { NextResponse } from 'next/server'
import { quizRequestSchema, quizSchema } from '@/schema'
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { cleanAITextOutput } from '@/helpers';

const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
})


const quizPrompt = new PromptTemplate({
  template: `
You are a quiz generator. Based on the input text, generate exactly 5 multiple-choice questions.
Each question must have:
- A question string.
- Five options (A, B, C, D, E).
- The correct answer letter (e.g., "A").

IMPORTANT: 
- The correct answer should be placed randomly among the five options for each question.
- The label for the correct answer ("answer") must match the label of the correct option in the options array.
- Do NOT always use "A" as the correct answer. Use a different label for each question as appropriate.
- Make sure the answer is randomized

Return in strict JSON format like this:anog
{{
  "questions":[
      {{
        "question": "What is the capital of France?",
        "options": [
          {{ "label": "A", "text": "Paris" }},
          {{ "label": "B", "text": "London" }},
          {{ "label": "C", "text": "Berlin" }},
          {{ "label": "D", "text": "Madrid" }},
          {{ "label": "E", "text": "Manila" }}
        ],
        "answer": "A"
      }},
    ...
  ]
}}

Refer to the text below to generate your quiz questions:
{text}
`,
  inputVariables: ['text'],
})



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = quizRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'InvalidRequest',
          message: parsed.error?.issues?.[0]?.message || 'Invalid request body',
        },
        { status: 400 }
      );
    }

    const { text } = parsed.data;
    const prompt = await quizPrompt.format({ text });

    const result = await llm.invoke([
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt },
    ]);

    const cleaned = cleanAITextOutput(
      typeof result.content === 'string' ? result.content : ''
    );
    const quizJson = JSON.parse(cleaned || '{}');

    const quizValidation = quizSchema.safeParse(quizJson);
    if (!quizValidation.success) {
      return NextResponse.json(
        {
          error: 'InvalidFormat',
          message: 'Generated quiz has invalid format',
        },
        { status: 500 }
      );
    }
    return NextResponse.json(quizValidation.data);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'InternalServerError',
        message: `Failed to generate quiz: ${String(error)}`,
      },
      { status: 500 }
    );
  }
}