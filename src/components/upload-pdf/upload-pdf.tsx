import { Button } from "@/components/ui/button"
import type { ChangeEvent, FormEvent } from "react"

type UploadPDFProps = {
  handleGenerateQuiz: (e: FormEvent) => Promise<string | number | undefined>
  handleFileChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => Promise<string | number | undefined>
}

function UploadPDF({ handleGenerateQuiz, handleFileChange }: UploadPDFProps) {
  return (
    <form
      onSubmit={handleGenerateQuiz}
      className="flex flex-col gap-1 w-full justify-center max-w-[400]"
    >
      <label htmlFor="upload-pdf">Upload PDF</label>
      <input
        className="border-gray-400 border-2 rounded-md p-1 cursor-pointer"
        type="file"
        name="upload-pdf"
        id="upload-pdf"
        accept="application/pdf"
        onChange={handleFileChange}
      />
      <Button type="submit">Generate Quiz</Button>
    </form>
  )
}

export { UploadPDF }
