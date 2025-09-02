import { generateQuizFromText } from '@/lib/services/api/quizGenerator.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Topic is required.' },
                { status: 400 }
            );
        }

        const quizDetails: QuizDetails[] = await generateQuizFromText(text);

        if (!quizDetails || quizDetails.length === 0) {
        return NextResponse.json(
            { error: 'No quiz data generated.', detail: quizDetails },
            { status: 500 }
        );
        }

        return NextResponse.json(
            { quizData: quizDetails, message: "Quiz generated successfully." }, 
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Failed to generate quiz: ', error);
        return NextResponse.json(
            { error: 'Failed to generate quiz: ', detail: error.message},
            { status: 500}
        )
    }
}