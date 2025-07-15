"use client";


import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { pdfFormSchema, Question } from '@/lib/utils';
import { generatePdfQuiz } from '@/lib/generateQuiz';
import { useMessage } from '@/lib/message';

import { Input } from './ui/input';
import { Button } from './ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from './ui/form';

type UploadPdfFormProps = {
    setQuestions: (questions: Question[]) => void;
}

export default function UploadPdfForm({ setQuestions }: UploadPdfFormProps) {
    const [isLoading, setIsLoading] = useState(false); // Tracks if quiz generation is in progress
    const inputRef = useRef<HTMLInputElement>(null);
    const { notifyError, notifySuccess } = useMessage();

    const form = useForm<z.infer<typeof pdfFormSchema>>({
        resolver: zodResolver(pdfFormSchema),
    });

    const handleUpload = async (values: z.infer<typeof pdfFormSchema>) => {
        if(!values.pdf) {
            notifyError('Please select a PDF file.');
            return;
        }

        try {
            setIsLoading(true);

            // Dynamically import parsePdf to avoid SSR issues
            const { parsePdf } = await import("@/lib/parsePdf");
            const parseResult = await parsePdf(values.pdf);

            if(!parseResult.success) {
                notifyError(`${parseResult.message}`);
                setIsLoading(false);
                return;
            }

            const quizResult = await generatePdfQuiz(parseResult.context);

            if(!quizResult || !quizResult.success) {
                // Handle failure if result is undefined or not successful
                notifyError(`Internal Server Error. ${quizResult?.message || 'No error message provided.'}`);
                setIsLoading(false);
                return;
            }

            // If success, update parent with questions and notify
            setQuestions(quizResult?.questions);
            notifySuccess('Quiz Generated!');
            setIsLoading(false);
        } catch (error: unknown) {
            // We use 'unknown' here for safer error handling
            if (error instanceof Error) {
                notifyError(`Internal Server Error. ${error.message}`);
            } else {
                // Fallback in case the thrown error is a string or unexpected object
                notifyError('An unknown error occurred.');
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpload)}>
                <FormField
                control={form.control}
                name='pdf'
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Upload a PDF</FormLabel>
                        <FormControl>
                            <Input
                            ref={inputRef}
                            type='file'
                            accept='application/pdf'
                            placeholder='Upload PDF file'
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                field.onChange(file);
                            }}
                            />
                        </FormControl>
                    </FormItem>
                )}
                />

                <Button
                    type='submit'
                    disabled={isLoading || !form.watch('pdf')}
                    className="mt-2"
                >
                    {isLoading ? (
                        'Generating Quiz...'
                    ) : (
                        'Generate a Quiz'
                    )}
                </Button>
            </form>
        </Form>
  );
}