import { QuizDetails } from "@/lib/types/quizDetails.type";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function generateQuizFromText(text: string): Promise<QuizDetails[]> {
    const truncatedText: string = text.substring(0, 3000);

    const prompt = `
        Based on the following text, create 5 questions:

        Instructions:
        - At least 1 must be a short-answer question.
        - The rest can be multiple-choice questions with 4 options each.
        - Mark the correct answer clearly.
        - Ensure questions are clear and concise.
        - Distractors (incorrect options) should be plausible.
        - For short-answer questions, "options" can be an empty array and "answer" should be the correct text.
        - Do not include any explanations or additional text.
        - The answer key must be an integer index (0–3) for multiple-choice or a string for short-answer.

        Text: """${truncatedText}"""

        Return an array of objects in **valid JSON** format like thixs:
        [
            {
                "id": 1,
                "type": "multiple-choice", // "short-answer" for short-answer questions
                "question": "Your question here",
                "options": ["Option A", "Option B", "Option C", "Option D"], // only for multiple-choice
                "answer": 0 // integer index for multiple-choice or string for short-answer
            }
        ]
    `;


    // Chose gpt-3.5-turbo for cheapest cost and for demo purposes only
    const completion = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'You are a helpful assistant that generates quiz questions based on provided text.' },
            { role: 'user', content: prompt }
        ],
        response_format: { type: 'text' }
    })

    let rawContent: string = completion?.choices[0]?.message?.content?.trim() ?? "";

    if (!rawContent) {
        throw new Error("No response from AI model.");
    }

    rawContent = rawContent.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

    return JSON.parse(rawContent);
}