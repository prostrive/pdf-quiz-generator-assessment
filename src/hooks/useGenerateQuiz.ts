import { toast } from 'sonner'
import { type TextItem } from 'pdfjs-dist/types/src/display/api'
import { useState, type FormEvent, type ChangeEvent } from 'react'
import type { Questionnaire, FormValues } from '@/types'

import * as pdfjsLib from 'pdfjs-dist'
import { type UseFormReturn } from 'react-hook-form'

const useGenerateQuiz = ({ form }: { form: UseFormReturn<FormValues> }) => {
	const [fullText, setFullText] = useState('')
	const [questionnaire, setQuestionnaire] = useState<Questionnaire[] | null>(
		null
	)
	const [isLoading, setIsLoading] = useState(false)

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
		form.reset({
			answer1: '',
			answer2: '',
			answer3: '',
			answer4: '',
			answer5: ''
		})

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

	return {
		handleGenerateQuiz,
		handleFileChange,
		fullText,
		isLoading,
		questionnaire
	}
}

export { useGenerateQuiz }
