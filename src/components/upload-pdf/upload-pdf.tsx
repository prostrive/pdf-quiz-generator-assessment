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
	DialogHeader,
	DialogTitle,
	DialogClose
} from '@/components/ui/dialog'
import * as pdfjsLib from 'pdfjs-dist'
import { FormSchema } from '@/lib/schema'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { scoreHeading } from '@/lib/utils'
import { toast } from 'sonner'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
	import.meta.url
).toString()

type Questionnaire = {
	question: string
	choices: string[]
}

type FormValues = {
	answer1: string
	answer2: string
	answer3: string
	answer4: string
	answer5: string
}

function UploadPDF() {
	const [fullText, setFullText] = useState('')
	const [questionnaire, setQuestionnaire] = useState<Questionnaire[] | null>(
		null
	)
	const [isLoading, setIsLoading] = useState(false)
	const form = useForm<UseFormReturn<FormValues>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			answer1: '',
			answer2: '',
			answer3: '',
			answer4: '',
			answer5: ''
		}
	})
	const [score, setScore] = useState<number | null>(null)
	const [isOpenModal, setIsOpenModal] = useState(false)

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0]

		if (selectedFile?.type !== 'application/pdf') {
			return toast.error('Please upload a PDF file.')
		}

		const arrayBuffer = await selectedFile.arrayBuffer()
		const typedArray = new Uint8Array(arrayBuffer)
		const pdf = await pdfjsLib.getDocument(typedArray).promise
		const totalPages = pdf.numPages

		if (totalPages >= 10) {
			return toast.error('PDF file must be 10 pages below.')
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
	}

	const handleGenerateQuiz = async (e: FormEvent) => {
		e.preventDefault()
		setQuestionnaire(null)

		try {
			if (!fullText) {
				return toast.error('Please upload a PDF file.')
			}

			setIsLoading(true)
			const response = await fetch('/api/generate-quiz', {
				method: 'POST',
				body: JSON.stringify({ text: fullText })
			})
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.message)
			}

			const questions = JSON.parse(data.result)

			setQuestionnaire(questions.questions)
		} catch (err) {
			if (err instanceof Error) {
				return toast.error(err.message)
			}
			return toast.error('Something went wrong please try again later.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleSubmitResult = async () => {
		if (!FormSchema.safeParse(form.getValues()).success) {
			return toast.error('Please fill up the form.')
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

			if (!response.ok) {
				throw new Error(data.message)
			}

			const score = result.question.filter(
				(item: { correct: boolean }) => item.correct
			).length
			setScore(score)
			setIsOpenModal(true)
		} catch (err: unknown) {
			if (err instanceof Error) {
				return toast.error(err.message)
			}
			return toast.error('Something went wrong please try again later.')
		}
	}

	return (
		<div className='w-full flex flex-col items-center justify-center'>
			<form
				onSubmit={handleGenerateQuiz}
				className='flex flex-col gap-1 w-full justify-center max-w-[400]'
			>
				<label htmlFor='upload-pdf'>Upload PDF</label>
				<input
					className='border-gray-400 border-2 rounded-md p-1 cursor-pointer'
					type='file'
					name='upload-pdf'
					id='upload-pdf'
					accept='application/pdf'
					onChange={handleFileChange}
				/>
				<Button type='submit'>Generate Quiz</Button>
			</form>

			<Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
				<DialogContent>
					<DialogClose />
					<DialogHeader>
						<DialogTitle className='text-2xl'>
							{scoreHeading(score ?? 0)}
						</DialogTitle>
					</DialogHeader>

					<p className='text-sm'>{score}/5</p>
				</DialogContent>
			</Dialog>

			<Form {...form}>
				<form
					className='flex flex-col gap-6 pt-10 w-full items-center justify-center h-full max-w-[800]'
					onSubmit={form.handleSubmit(handleSubmitResult)}
				>
					{isLoading ? (
						<div className='border-4 border-black animate-spin h-10 w-10 rounded-full border-t-transparent' />
					) : (
						<ul className='flex flex-col gap-6'>
							{questionnaire?.map((item, idx) => {
								const itemNumber = idx + 1
								return (
									<li className='flex flex-col gap-2' key={item.question}>
										<FormField
											control={form.control}
											name={`answer${itemNumber}` as keyof FormValues}
											render={({ field }) => (
												<FormItem>
													<FormLabel className='w-full'>
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
					)}

					{questionnaire && (
						<Button disabled={form.formState.isSubmitting} type='submit'>
							Submit
						</Button>
					)}
				</form>
			</Form>
		</div>
	)
}

export { UploadPDF, type Questionnaire, type FormValues }
