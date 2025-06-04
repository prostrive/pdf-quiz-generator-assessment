'use client'

import { useGenerateQuiz } from "@/hooks/useGenerateQuiz"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { extractPdfText } from "@/helpers"
import { Input } from "../ui/input"

export default function QuizGenerator() {
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileName, setFileName] = useState("")

  // Handle file input change and extract text from PDF
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    try {
      const { text } = await extractPdfText(file)
      setInputText(text)
      setFileName(file.name)
    } catch (error) {
      toast.error(`Error extracting text from PDF: ${String(error)}`)
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
    onSuccess: () => toast.success("Successfully generated a quiz"),
    onError: (err) => toast.error(`Error: ${err}`),
  })

  // Handle quiz generation button click
  const handleGenerate = () => {
    generateQuiz({ text: inputText })
  }

  return (
    <div className="space-y-4 w-xl max-w-xl mx-auto mt-8 p-4 border rounded shadow">
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter text to generate quiz..."
        className="w-full border p-2 rounded resize-none"
        rows={6}
      />
      <Button onClick={handleGenerate} disabled={isLoading || isProcessing || inputText.length == 0 }>
        {isLoading ? "Generating..." : isProcessing ? "Processing PDF..." : "Generate Quiz"}
      </Button>
      <Input
        accept=".pdf"
        id="pdf-upload"
        type="file"
        onChange={handleFile}
        disabled={isProcessing}
      />
      {fileName && (
        <div className="text-sm text-gray-500">
          Uploaded file: <span className="font-medium">{fileName}</span>
        </div>
      )}
      {quizzes && (
        <div className="mt-6 space-y-2">
          <h2 className="text-lg font-semibold">Generated Quiz:</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            {JSON.stringify(quizzes, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}