"use client";

import { parsePDF } from "@/lib/actions/pdf";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadPDFSchema } from "@/lib/validators";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { generateQuiz } from "@/lib/actions/quiz";
import { toast } from "sonner";
import { Question } from "@/types";
import { useEffect, useRef, useState } from "react";
import { Loader } from "lucide-react";

const PdfUpload = ({
  pdfFile,
  setPdfFile,
  onQuizGenerated,
}: {
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
  onQuizGenerated: (questions: Question[]) => void;
}) => {
  const form = useForm<z.infer<typeof uploadPDFSchema>>({
    resolver: zodResolver(uploadPDFSchema),
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!pdfFile && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [pdfFile]);

  const [loading, setLoading] = useState(false);

  const onSubmit = async (value: z.infer<typeof uploadPDFSchema>) => {
    setLoading(true);

    // Get the extracted text
    const pdfRes = await parsePDF(value);

    if (!pdfRes.success) {
      setLoading(false);
      toast.error(pdfRes.message);
      return;
    }

    // Generate the questions
    const quizRes = await generateQuiz(pdfRes.content!, {
      includeShortAnswers: true, // optional: instruct backend to mix question types
    });

    if (!quizRes.success) {
      setLoading(false);
      toast.error(quizRes.message);
      return;
    }

    setLoading(false);
    onQuizGenerated(quizRes.questions);
  };

  return (
    <Form {...form}>
      <form method="post" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="pdf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload a PDF</FormLabel>
              <FormControl>
                <Input
                  ref={inputRef}
                  placeholder="PDF"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    field.onChange(file);
                    if (file) setPdfFile(file);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-4" disabled={loading}>
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" /> Generating...
            </>
          ) : (
            "Generate Quiz"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default PdfUpload;
