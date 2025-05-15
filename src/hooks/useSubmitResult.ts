import { toast } from "sonner"
import { useState } from "react"
import { FormSchema } from "@/lib/schema"
import type { Questionnaire, FormValues } from "@/types"
import { type UseFormReturn } from "react-hook-form"

type UseSubmitResultProps = {
  form: UseFormReturn<FormValues>
  fullText: string
  questionnaire?: Questionnaire[] | null
}

const useSubmitResult = ({
  fullText,
  form,
  questionnaire,
}: UseSubmitResultProps) => {
  const [score, setScore] = useState<number | null>(null)
  const [isOpenModal, setIsOpenModal] = useState(false)

  const handleSubmitResult = async () => {
    if (!FormSchema.safeParse(form.getValues()).success) {
      return toast.error("Please fill up the form.")
    }

    try {
      const response = await fetch("/api/submit-quiz", {
        method: "POST",
        body: JSON.stringify({
          data: {
            questions: questionnaire?.map((item) => item.question),
            answers: Object.values(form.getValues()).map((item) => item),
            context: fullText,
          },
        }),
      })
      const data = await response.json()
      const result = JSON.parse(data.result)

      if (!response.ok) {
        throw new Error(data.message)
      }

      const score = result.question.filter(
        (item: { correct: boolean }) => item.correct,
      ).length
      setScore(score)
      setIsOpenModal(true)
    } catch (err: unknown) {
      if (err instanceof Error) {
        return toast.error(err.message)
      }
      return toast.error("Something went wrong please try again later.")
    }
  }

  return { handleSubmitResult, score, isOpenModal, setIsOpenModal }
}

export { useSubmitResult }
