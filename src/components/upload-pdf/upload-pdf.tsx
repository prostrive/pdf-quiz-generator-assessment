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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogClose
} from '@/components/ui/dialog'
import * as pdfjsLib from 'pdfjs-dist'
import { FormSchema } from '@/lib/schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
	import.meta.url
).toString()

type Questionnaire = {
	question: string
	choices: string[]
}

function UploadPDF() {
	const [error, setError] = useState({ error: false, message: '' })
	const [fullText, setFullText] = useState('')
	const [questionnaire, setQuestionnaire] = useState<Questionnaire[] | null>(
		null
	)
	const [isLoading, setIsLoading] = useState(false)
	const form = useForm({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			answer1: '',
			answer2: '',
			answer3: '',
			answer4: '',
			answer5: ''
		}
	})
	const [score, setScore] = useState('')
	const [isOpenModal, setIsOpenModal] = useState(false)

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

		setError({ error: false, message: '' })

		try {
			if (!fullText) {
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

	const handleSubmitResult = async () => {
		if (!FormSchema.safeParse(form.getValues()).success) {
			return setError({ error: true, message: 'Please fill up the form' })
		}

		try {
			const response = await fetch('/api/submit-quiz', {
				method: 'POST',
				body: JSON.stringify({
					data: {
						questions: questionnaire?.map((item) => item.question),
						answers: Object.values(form.getValues()).map((item) => item),
						context: fullText
					}
				})
			})
			const data = await response.json()
			const result = JSON.parse(data.result)

			const score = result.question.filter((item) => item.correct).length
			setScore(score)
			setIsOpenModal(true)
		} catch (err) {
			console.error(err.message)
			return setError({ error: true, message: err.message })
		}
	}

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

			<Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
				<DialogContent>
					<DialogClose />
					<DialogHeader>
						<DialogTitle>Your Score</DialogTitle>
						<DialogDescription>{score}/5</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>

			{isLoading ? (
				<div>Loading...</div>
			) : (
				<Form {...form}>
					<form
						className='flex flex-col gap-6 pt-4'
						onSubmit={form.handleSubmit(handleSubmitResult)}
					>
						<ul className='flex flex-col gap-2'>
							{questionnaire?.map((item, idx) => {
								const itemNumber = idx + 1
								return (
									<li className='flex flex-col gap-2' key={item.question}>
										<FormField
											control={form.control}
											name={`answer${itemNumber}`}
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{itemNumber}.) {item.question}
													</FormLabel>
													<Select
														onValueChange={field.onChange}
														value={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder='Choose the correct answer' />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectGroup>
																{item.choices?.map((answer) => (
																	<SelectItem value={answer} key={answer}>
																		{answer}
																	</SelectItem>
																))}
															</SelectGroup>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									</li>
								)
							})}
						</ul>

						{questionnaire && <Button type='submit'>Submit</Button>}
					</form>
				</Form>
			)}
		</div>
	)
}

export { UploadPDF }
