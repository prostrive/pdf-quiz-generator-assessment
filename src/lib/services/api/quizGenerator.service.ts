import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function generateQuizFromText(text: string): Promise<QuizDetails[]> {
    const truncatedText: string = text.substring(0, 3000);

    const prompt = `
        Based on the following text, create 5 multiple-choice questions with 4 options each.
        Mark the correct answer clearly.

        Text: """${truncatedText}"""

        Return an array of objects in **valid JSON** format like this:
        [
            {
                "id": 1,
                "question": "Your question here",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer": 0
            }
        ]

        Instructions:
        - Ensure questions are clear and concise.
        - Distractors (incorrect options) should be plausible.
        - Do not include any explanations or additional text.
        - The answer key must only be an integer index (0–3).
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

    let rawContent = completion?.choices[0]?.message?.content?.trim() ?? "";

    if (!rawContent) {
        throw new Error("No response from AI model.");
    }

    rawContent = rawContent.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

    return JSON.parse(rawContent);
}