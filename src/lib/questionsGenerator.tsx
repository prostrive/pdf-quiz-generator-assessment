import openai from "@/lib/openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const questionsGenerator = async (pdfText: string) => {
	const MODEL = process.env.OPEN_AI_MODEL;
	const MAX_QUESTION_NUM = 5;
	try {
		const QuestionSchema = z.object({
			id: z.number(),
			question: z.string(),
			options: z.array(z.string()),
			answer: z.string(),
			difficulty: z.string(),
		});
		const QuestionsSchema = z.object({
			questions: z.array(QuestionSchema),
		});

		const systemPrompt = `
		Uing this data: ${pdfText}
		
		Generate **exactly ${MAX_QUESTION_NUM}** quiz questions that test understanding of the material. Do NOT use any information not explicitly in the content.		
		Respond with **only** a JSON array of 5 question objects using the exact format below — no extra text:
		
		[
			{
			"id": 1,
			"question": "Question text here?",
			"options": [
				"Option 1",
				"Option 2",
				"Option 3",
				"Option 4"
			],
			"answer": "Correct option text",
			},
			...
		]
		
		Important rules:
		- Generate exactly ${MAX_QUESTION_NUM} questions per request.
		- Each question must be unique, and cover different parts of the content.
		- Each must have one correct answer and three plausible distractors.
		- Do not add explanations or extra text outside the JSON array.`;

		const response = await openai.responses.parse({
			model: MODEL,
			input: [
				{ role: "system", content: "You are a quiz generator" },
				{ role: "user", content: systemPrompt }
			],
			text: {
				format: zodTextFormat(QuestionsSchema, "questions"),
			},
		});

		let questions = response.output_parsed?.questions;
		if (!questions || questions.length < MAX_QUESTION_NUM) {
			throw new Error("Failed to generate questions");
		}
		return questions;
	} catch (error) {
		console.error(error);
		return [];
	}
};

export default questionsGenerator;
