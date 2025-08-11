import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateMockQuiz = (content: string): QuizResponse => {

  const mockQuestions = [
    {
      id: 1,
      question: "Based on the document, what is the primary topic discussed?",
      options: [
        "Technical specifications",
        "Business processes", 
        "Educational content",
        "General information"
      ],
      correct: 3
    },
    {
      id: 2,
      question: "Which of the following concepts is most emphasized in the text?",
      options: [
        "Implementation strategies",
        "Theoretical frameworks",
        "Practical applications",
        "Historical context"
      ],
      correct: 2
    },
    {
      id: 3,
      question: "According to the document, what approach is recommended?",
      options: [
        "A systematic methodology",
        "An experimental approach", 
        "A traditional method",
        "A hybrid solution"
      ],
      correct: 0
    },
    {
      id: 4,
      question: "What is identified as a key consideration in the text?",
      options: [
        "Cost effectiveness",
        "Time constraints",
        "Quality assurance", 
        "User experience"
      ],
      correct: 2
    },
    {
      id: 5,
      question: "Based on the content, what outcome is most likely expected?",
      options: [
        "Improved efficiency",
        "Reduced complexity",
        "Enhanced understanding",
        "Better integration"
      ],
      correct: 2
    }
  ];

  return {
    questions: mockQuestions
  };
};

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' }, 
        { status: 400 }
      );
    }

    const truncatedContent = content.substring(0, 3000);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockQuiz = generateMockQuiz(truncatedContent);

    /* 
    Using OpenAI API requires billing details. This will lead to insufficient quota error.
    
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: 'system',
          content: `You are a quiz generator. Create exactly 5 multiple-choice questions based on the provided text. 

            IMPORTANT: Respond with ONLY a valid JSON object in this exact format:
            {
              "questions": [
                {
                  "id": 1,
                  "question": "Your question here?",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "correct": 0
                }
              ]
            }

            Rules:
            - Each question must have exactly 4 options
            - The "correct" field should be the index (0-3) of the correct answer
            - Questions should test understanding, not just memorization
            - Make sure all questions are answerable from the provided text
            - Do not include any explanation or additional text, just the JSON`
        },
        {
          role: 'user',
          content: `Generate 5 multiple-choice questions based on this text:\n\n${truncatedContent}`
        }
      ],
    });

    const quizData = JSON.parse(completion.choices[0].message.content);
    */

    return NextResponse.json({ 
      success: true, 
      quiz: mockQuiz,
      message: "Quiz generated successfully (using mock data)"
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz', details: error.message }, 
      { status: 500 }
    );
  }
}