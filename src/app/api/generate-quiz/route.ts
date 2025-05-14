import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs/promises'

const client = new OpenAI({
	apiKey: process.env.OPEN_AI_API_KEY
})

export async function POST(req: NextRequest) {
	const data = await req.json()
	const text = data.text

	try {
		const instructions = await fs.readFile('instructions.txt', 'utf-8')
		const response = await client.responses.create({
			model: 'gpt-4o-mini',
			input: [
				{
					role: 'system',
					content: 'You are a helpful assistant designed to output JSON.'
				},
				{
					role: 'user',
					content: text
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
		console.error(error)
		return NextResponse.json(
			{ message: 'Failed to generate Questionnaire please try again.' },
			{
				status: 500
			}
		)
	}
}
