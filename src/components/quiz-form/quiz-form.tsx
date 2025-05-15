"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { FormSchema } from "@/lib/schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { scoreHeading } from "@/lib/utils"
import { useGenerateQuiz } from "@/hooks/useGenerateQuiz"
import { useSubmitResult } from "@/hooks/useSubmitResult"
import { QuestionnaireForm } from "@/components/questionnaire/questionnaire"
import { UploadPDF } from "@/components/upload-pdf/upload-pdf"

function QuizForm() {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      answer1: "",
      answer2: "",
      answer3: "",
      answer4: "",
      answer5: "",
    },
  })
  const {
    handleGenerateQuiz,
    handleFileChange,
    fullText,
    isLoading,
    questionnaire,
  } = useGenerateQuiz({ form })
  const { handleSubmitResult, score, isOpenModal, setIsOpenModal } =
    useSubmitResult({ fullText, form, questionnaire })

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <UploadPDF
        handleGenerateQuiz={handleGenerateQuiz}
        handleFileChange={handleFileChange}
      />

      <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
        <DialogContent>
          <DialogClose />
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {scoreHeading(score ?? 0)}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm">{score}/5</p>
        </DialogContent>
      </Dialog>

      <QuestionnaireForm
        form={form}
        handleSubmitResult={handleSubmitResult}
        isLoading={isLoading}
        questionnaire={questionnaire}
      />
    </div>
  )
}

export { QuizForm }
