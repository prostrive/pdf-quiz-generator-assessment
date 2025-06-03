"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// @ts-ignore
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.entry";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import {
  generateQuizFromPdfText,
  QuizQuestion,
} from "@/actions/generateQuestions";
import { extractKeySections } from "@/lib/utils";

const fileSchema = z.object({
  file: z
    .custom<FileList>((v) => v instanceof FileList && v.length > 0, {
      message: "File is required",
    })
    .refine((v) => v.item(0)?.type === "application/pdf", {
      message: "File must be a PDF",
    })
    .refine((v) => v.item(0)?.size! <= 10 * 1024 * 1024, {
      message: "File must be 10MB or less",
    }),
});

type FileSchema = z.infer<typeof fileSchema>;

interface Props {
  onGenerate: (quiz: QuizQuestion[]) => void;
}

export default function UploadForm({ onGenerate }: Props) {
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FileSchema>({
    resolver: zodResolver(fileSchema),
  });

  const onSubmit = async (values: FileSchema) => {
    const file = values.file.item(0);

    if (!file) {
      setFormError("Select PDF File");
      return;
    }

    setIsLoading(true);
    setFormError("");

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    if (pdf.numPages > 10) {
      setFormError("PDF must not exceed 10 pages");
      return;
    }

    // Extract text from all pages
    const textPromises: Promise<string>[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      textPromises.push(Promise.resolve(pageText));
    }

    const pageTexts = await Promise.all(textPromises);
    const pdfText = extractKeySections(pageTexts);

    const quiz = await generateQuizFromPdfText(pdfText);

    if (!quiz) {
      setFormError(
        "Quiz generation failed. Try a different file or make sure the content is readable."
      );

      return;
    }

    onGenerate(quiz);

    setIsLoading(false);
  };

  if (isLoading)
    return (
      <div className="flex gap-3 items-center">
        <p className="text-2xl">Generating Quiz</p>
        <div className="flex flex-row pl-1 text-4xl">
          <div className="animate-[bounce_0.7s_ease-in-out_-0.3s_infinite] p-[2px] ">
            .
          </div>
          <div className="animate-[bounce_0.7s_ease-in-out_-0.2s_infinite] p-[2px] ">
            .
          </div>
          <div className="animate-[bounce_0.7s_ease-in-out_-0.1s_infinite] p-[2px] ">
            .
          </div>
        </div>
      </div>
    );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choose PDF to generate quiz</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => field.onChange(e.target.files)}
                />
              </FormControl>
              <FormMessage />
              {formError && <p className="text-sm text-red-500">{formError}</p>}
            </FormItem>
          )}
        />

        <Button type="submit">Generate</Button>
      </form>
    </Form>
  );
}
