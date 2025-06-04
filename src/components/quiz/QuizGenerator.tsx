'use client'

import { useGenerateQuiz } from "@/hooks/useGenerateQuiz"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"

export default function QuizGenerator() {
  const [inputText, setInputText] = useState('')

  const {
    mutate: generateQuiz,
    isPending: isLoading,
    data: quizzes,
  } = useGenerateQuiz({
    showMessage: true,
    onSuccess: () => toast.success("Successfully generated a quiz"),
    onError: (err) => toast.error(`Error: ${err}`),
  })

  const handleGenerate = () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text.")
      return
    }
    generateQuiz({ text: inputText })
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto mt-8 p-4 border rounded shadow">
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter text to generate quiz..."
        className="w-full border p-2 rounded resize-none"
        rows={6}
      />
      <Button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Quiz"}
      </Button>

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
