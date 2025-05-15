import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import OpenAI from 'openai'

const client = new OpenAI({
	apiKey: process.env.OPEN_AI_API_KEY
})

export async function POST(req: NextRequest) {
	const data = await req.json()
	const { questions, answers, context } = data.data

	try {
		const instructions = await fs.readFile('submit-quiz.txt', 'utf-8')
		const response = await client.responses.create({
			model: 'gpt-4o-mini',
			input: [
				{
					role: 'system',
					content: 'You are a helpful assistant designed to output JSON.'
				},
				{
					role: 'user',
					content: context
				},
				{
					role: 'user',
					content: questions.join('\n\n')
				},
				{
					role: 'user',
					content: answers.join('\n\n')
				}
			],
			instructions
		})

		return NextResponse.json(
			{ result: response.output_text },
			{
				status: 200
			}
		)
	} catch (error) {
		console.error({ error })
		return NextResponse.json(
			{ message: 'Failed to submit please try again later.' },
			{
				status: 500
			}
		)
	}
}
