'use client'

import { useGenerateQuiz } from "@/hooks/useGenerateQuiz"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { extractPdfText } from "@/helpers"
import { Input } from "../ui/input"
import Quiz from "./Quiz"

export default function QuizGenerator() {
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Handle file input change and extract text from PDF
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)

    try {
      const { text } = await extractPdfText(file)
      setInputText(text)
    } catch (error) {
      toast.error(`Error extracting text from PDF: ${String(error)}`)
      handleReset()
    } finally {
      setIsProcessing(false)
    }
  }

  // Quiz generation hook
  const {
    mutate: generateQuiz,
    isPending: isLoading,
    data: quizzes,
  } = useGenerateQuiz({
    showMessage: true,
    onSuccess: function () {
      toast.success("Successfully generated a quiz")
    },
    onError: function (err) {
      toast.error(`Error: ${err}`)
      handleReset()
    },
  })

  // Handle quiz generation button click
  function handleGenerate() {
    generateQuiz({ text: inputText })
  }

  // Reset input and file input
  function handleReset() {
    setInputText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4 w-xl max-w-xl mx-auto mt-8 p-4 border rounded shadow">
      <div className="flex space-x-2">
        <Button onClick={handleGenerate} disabled={isLoading || isProcessing || inputText.length === 0}>
          {isLoading ? "Generating..." : isProcessing ? "Processing PDF..." : "Generate Quiz"}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>
      <Input
        accept=".pdf"
        id="pdf-upload"
        type="file"
        onChange={handleFile}
        disabled={isProcessing}
        ref={fileInputRef}
      />
      {quizzes && <Quiz quiz={quizzes} />}
    </div>
  )
}
