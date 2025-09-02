'use client'

import { pdfFileValidator } from "@/lib/validators/pdfFile.validator";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader } from "lucide-react";
import { parsePDF } from "@/lib/services/client/parsePDF.service";
import { ParsePDFResponse } from "@/lib/types/pdfDetails.type";
import { getQuizDetails } from "@/lib/services/client/getQuizDetails.service";
import { QuizDetails } from "@/lib/types/quizDetails.type";

type PDFUploadFormProps = {
    quizDetails: (quizDetails: QuizDetails[]) => void;
}

export default function PDFUploadForm({
    quizDetails
}: PDFUploadFormProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const inputFileRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<z.infer<typeof pdfFileValidator>>({
        resolver: zodResolver(pdfFileValidator),
        defaultValues: {
            pdf: undefined,
        }
    });

    const handleUploadPDF = async (value: z.infer<typeof pdfFileValidator>) => {
        setIsLoading(true);
        try {
            const parsedPDFFile: ParsePDFResponse = await parsePDF(value);

            if (!parsedPDFFile.success) {
                throw new Error(parsedPDFFile.message);
            }

            const quizResponse: QuizDetails[] = await getQuizDetails(parsedPDFFile.extractedText!);
            if (!quizResponse || quizResponse.length === 0) {
                throw new Error('No quiz data generated.');
            }

            quizDetails(quizResponse)
            toast.success('Quiz generated successfully!');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to upload PDF File');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleUploadPDF, (error) => {
                        if (error.pdf) {
                            toast.error(error.pdf.message as string);
                        }
                    })}
                    className="w-full flex flex-col gap-4"
                >
                    <FormField
                        control={form.control}
                        name="pdf"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                            <FormLabel>Upload PDF File</FormLabel>
                            <FormControl>
                                <Input
                                placeholder="Select PDF File"
                                ref={inputFileRef}
                                type="file"
                                accept="application/pdf"
                                onChange={(event) => {
                                    const file = event.target.files?.[0] || null;
                                    field.onChange(file);
                                }}
                                disabled={isLoading}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                    >
                    {isLoading ? (
                        <span className="flex items-center">
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Generating Quiz...
                        </span>
                    ) : (
                        "Generate Quiz"
                    )}
                    </Button>
                </form>
            </Form>
        </div>
    )
}