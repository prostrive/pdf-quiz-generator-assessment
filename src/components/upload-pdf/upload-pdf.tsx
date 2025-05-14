'use client'

import { FormEvent, useState, type ChangeEvent } from 'react'
import { Button } from '../ui/button'
import { TextItem } from 'pdfjs-dist/types/src/display/api'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
	import.meta.url
).toString()

type Questionnaire = {
	question: string
	choices: string[]
	correctAnswer: string
}

function UploadPDF() {
	const [error, setError] = useState({ error: false, message: '' })
	const [fullText, setFullText] = useState('')
	const [questionnaire, setQuestionnaire] = useState<Questionnaire[] | null>(
		null
	)
	const [isLoading, setIsLoading] = useState(false)

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0]

		if (selectedFile?.type !== 'application/pdf') {
			return setError({ error: true, message: 'Please upload a PDF file.' })
		}

		const arrayBuffer = await selectedFile.arrayBuffer()
		const typedArray = new Uint8Array(arrayBuffer)
		const pdf = await pdfjsLib.getDocument(typedArray).promise
		const totalPages = pdf.numPages

		if (totalPages === 10) {
			return setError({
				error: true,
				message: 'PDF file must be 10 pages below.'
			})
		}

		let fullText = ''

		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i)
			const textContent = await page.getTextContent()

			const pageText = textContent.items
				.filter((item): item is TextItem => 'str' in item)
				.map((item) => item.str)
				.join(' ')
				.replace(/\s+/g, ' ')
				.trim()

			fullText += `${pageText}\n\n`
			setFullText(fullText)
		}

		setError({ error: false, message: '' })
	}

	const handleGenerateQuiz = async (e: FormEvent) => {
		e.preventDefault()

		try {
			if (!fullText) {
				alert('asdfaf')
				return setError({ error: true, message: 'Please upload a PDF file.' })
			}

			setIsLoading(true)
			const response = await fetch('/api/generate-quiz', {
				method: 'POST',
				body: JSON.stringify({ text: fullText })
			})
			const data = await response.json()
			const questions = JSON.parse(data.result)

			setQuestionnaire(questions.questions)
			setIsLoading(false)
		} catch (err) {
			console.error(err.message)
			return setError({ error: true, message: err.message })
		}
	}

	const handleSubmitResult = async () => {}

	return (
		<div>
			<form onSubmit={handleGenerateQuiz} className='flex flex-col gap-1'>
				<label htmlFor='upload-pdf'>Upload PDF</label>
				<input
					className='border-gray-400 border-2 rounded-md p-1 cursor-pointer'
					type='file'
					name='upload-pdf'
					id='upload-pdf'
					onChange={handleFileChange}
				/>
				{error.error && <p className='text-red-700'>{error.message}</p>}
				<Button type='submit'>Generate Quiz</Button>
			</form>

			{isLoading ? (
				<div>Loading...</div>
			) : (
				<form
					className='flex flex-col gap-6 pt-4'
					onSubmit={handleSubmitResult}
				>
					<ul className='flex flex-col gap-2'>
						{questionnaire?.map((item, idx) => {
							const itemNumber = idx + 1
							return (
								<li className='flex flex-col gap-2' key={item.question}>
									<p>
										<strong>
											{itemNumber}.) {item.question}
										</strong>
									</p>

									<Select>
										<SelectTrigger>
											<SelectValue placeholder='Choose the correct answer' />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{item.choices.map((answer) => {
													return (
														<SelectItem value={answer} key={answer}>
															{answer}
														</SelectItem>
													)
												})}
											</SelectGroup>
										</SelectContent>
									</Select>
								</li>
							)
						})}
					</ul>

					{questionnaire && <Button type='submit'>Submit</Button>}
				</form>
			)}
		</div>
	)
}

export { UploadPDF }
