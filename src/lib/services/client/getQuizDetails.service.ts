import { QuizDetails } from "@/lib/types/quizDetails.type";

export async function getQuizDetails(text: string): Promise<QuizDetails[]> {
    const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch quiz details.');
    }

    const data = await response.json();
    return data.quizData;
}