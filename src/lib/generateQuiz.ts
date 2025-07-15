"use server";

import { OpenAI } from 'openai';

/*
    Create an instance of the OpenAI client pointing to Groq's API endpoint

    I used Groq's API here because OpenAI is not available on my end because of subscriptions.
*/
const openAi = new OpenAI({ apiKey: process.env.AI_API_KEY, baseURL: "https://api.groq.com/openai/v1" });

export async function generatePdfQuiz(content: string | undefined) {
    try {
        const context = `
            Can you generate 5 questions using this content:
            ${content}

            Each set of questions should consist a question text with 4 options with 1 correct answer.
            return only JSON array with each question with this format:
            [
                {
                    "question": "",
                    "options": ["", "", "", ""],
                    "answer": "..."
                }
            ]
            ONLY JSON OUTPUT
        `;

        const openAiCompletion = await openAi.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                { role: 'system', content: 'You will be a pdf quiz generator.' },
                { role: 'user', content: context}
            ],
        })

        const output = openAiCompletion.choices[0].message.content;

        // Incase we don't receive an reply from the AI.
        if (!output) {
            return {
                success: false,
                message: "AI response was empty or null."
            };
        }
        // Use regex to extract a JSON array from the output
        const jsonMatch = output.match(/\[\s*{[\s\S]*}\s*]/);

        if (!jsonMatch) {
            // If no valid JSON array is found, return an error
            return {
                success: false,
                message: "No JSON array found in AI response."
            };
        }

        // Try to parse the matched JSON string
        const questions = JSON.parse(output);
        return {
            success: true,
            questions,
        };
    }   catch (error: unknown) {
        // We use 'unknown' here for safer error handling
        if (error instanceof Error) {
            return {
                success: false,
                message: error.message
            }
        } else {
            // Fallback in case the thrown error is a string or unexpected object
            return {
                success: false,
                message: 'An unknown error occured.',
            }
        }
    }
}