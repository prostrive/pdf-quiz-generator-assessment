"use client";

import { parsePDF } from "@/actions/pdf";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/ui/forms";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadPDFSchema } from "@/lib/validators";
import { Input } from "@/components/ui/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { generateQuiz, generateMockQuiz } from "@/actions/quiz";
import { toast } from "sonner";
import { Question } from "@/types";
import { useEffect, useRef, useState } from "react";
import { FileText, Loader, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pdfFile && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [pdfFile]);

  const onSubmit = async (value: z.infer<typeof uploadPDFSchema>) => {
    setLoading(true);

    // Use mock data for testing
    const quizRes = await generateMockQuiz();

    if (!quizRes.success) {
      setLoading(false);
      toast.error(quizRes.message);
      return;
    }

    setLoading(false);
    onQuizGenerated(quizRes.questions);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file?.type === "application/pdf") {
      form.setValue("pdf", file);
      setPdfFile(file);
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  return (
    <Form {...form}>
      <form
        method="post"
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md mx-auto"
      >
        <FormField
          control={form.control}
          name="pdf"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold mb-4 block">
                Upload PDF to Generate Quiz
              </FormLabel>
              <FormControl>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25",
                    "hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                >
                  <Input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      field.onChange(file);
                      if (file) setPdfFile(file);
                    }}
                  />
                  <div className="flex flex-col items-center gap-2">
                    {pdfFile ? (
                      <>
                        <FileText className="w-12 h-12 text-primary" />
                        <p className="font-medium">{pdfFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-muted-foreground" />
                        <p className="font-medium">Drag & drop your PDF here</p>
                        <p className="text-sm text-muted-foreground">
                          or click to browse
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full mt-6 h-12 text-lg font-medium"
          disabled={loading || !pdfFile}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin mr-2" /> Generating
              Quiz...
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
