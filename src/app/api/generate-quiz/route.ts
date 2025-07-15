import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string' || text.length < 20) {
      return NextResponse.json({ error: 'Invalid or too short text for quiz generation.' }, { status: 400 });
    }

    // MOCK: Return static quiz if MOCK_OPENAI is set
    if (process.env.MOCK_OPENAI === 'true') {
      const quiz = [
        {
          question: 'What is the largest planet in the Solar System?',
          options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
          answer: 'Jupiter',
        },
        {
          question: 'Which planet is known as the Red Planet?',
          options: ['Mercury', 'Mars', 'Saturn', 'Neptune'],
          answer: 'Mars',
        },
        {
          question: 'What is the only natural satellite of Earth?',
          options: ['Phobos', 'Deimos', 'The Moon', 'Europa'],
          answer: 'The Moon',
        },
        {
          question: 'How many planets are in the Solar System?',
          options: ['7', '8', '9', '10'],
          answer: '8',
        },
        {
          question: 'Which planet is closest to the Sun?',
          options: ['Venus', 'Mercury', 'Earth', 'Mars'],
          answer: 'Mercury',
        },
      ];
      return NextResponse.json({ quiz });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 500 });
    }

    const prompt = `Generate 5 multiple-choice questions (with 4 options each, only one correct answer per question) based on the following text. Return the result as a JSON array with the following format: [{"question": string, "options": string[], "answer": string}]. Only include the questions, options, and correct answer, no explanations.\n\nText:\n${text}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates quizzes.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `OpenAI API error: ${error}` }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    let quiz;
    try {
      quiz = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: 'Failed to parse OpenAI response as JSON.' }, { status: 500 });
    }

    return NextResponse.json({ quiz });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || 'Internal server error.' }, { status: 500 });
  }
} 