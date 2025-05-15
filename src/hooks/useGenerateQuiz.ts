import { toast } from "sonner"
import { useState, type FormEvent, type ChangeEvent } from "react"
import type { Questionnaire, FormValues } from "@/types"

import { type UseFormReturn } from "react-hook-form"
import { uploadPDF } from "@/lib/actions/upload-pdf"

const useGenerateQuiz = ({ form }: { form: UseFormReturn<FormValues> }) => {
  const [fullText, setFullText] = useState("")
  const [questionnaire, setQuestionnaire] = useState<Questionnaire[] | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]

    if (selectedFile?.type !== "application/pdf") {
      return toast.error("Please upload a PDF file.")
    }

    setFile(selectedFile)
  }

  const handleGenerateQuiz = async (e: FormEvent) => {
    e.preventDefault()
    setQuestionnaire(null)
    setFile(null)
    form.reset({
      answer1: "",
      answer2: "",
      answer3: "",
      answer4: "",
      answer5: "",
    })

    try {
      setIsLoading(true)
      const { message, success, parsedText } = await uploadPDF(file)

      if (!success) {
        throw new Error(message)
      }

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        body: JSON.stringify({ text: parsedText }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      const questions = JSON.parse(data.result)

      setFullText(parsedText ?? "")
      setQuestionnaire(questions.questions)
    } catch (err) {
      if (err instanceof Error) {
        return toast.error(err.message)
      }
      return toast.error("Something went wrong please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    handleGenerateQuiz,
    handleFileChange,
    fullText,
    isLoading,
    questionnaire,
  }
}

export { useGenerateQuiz }
