const useGenerateQuiz = () => {
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

	return { handleGenerateQuiz, handleFileChange }
}

export { useGenerateQuiz }
