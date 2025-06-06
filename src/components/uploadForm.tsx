'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

import { parsePDF } from '@/lib/pdfHandler';
import { generateQuiz } from '@/lib/aiHandler';
import { pdfSchema, Question } from '@/lib/utils';

import { Input } from './ui/input';
import { Button } from './ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from './ui/form';

type PdfUploadProps = {
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
  quizGenerated: (questions: Question[]) => void;
};

/**
 * Component for uploading PDF files and generating quizzes from their content
 */
export default function PdfUpload({
  pdfFile,
  setPdfFile,
  quizGenerated,
}: PdfUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof pdfSchema>>({
    resolver: zodResolver(pdfSchema),
    mode: 'onChange',
  });

  /**
   * Clears the file input when the pdfFile is reset externally
   */
  useEffect(() => {
    if (!pdfFile && inputRef.current) {
      inputRef.current.value = '';
      form.reset({ pdf: undefined });
    }
  }, [pdfFile, form]);

  /**
   * Handles the PDF upload and quiz generation process
   */
  const handleUpload = async (values: z.infer<typeof pdfSchema>) => {
    if (!values.pdf) {
      toast.error('Please select a PDF file');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Parse PDF content
      const parseResult = await parsePDF(values);

      // Step 2: Generate quiz from parsed content
      const quizResult = await generateQuiz(parseResult.content!);

      // Step 3: Notify parent component of generated quiz
      quizGenerated(quizResult.questions);
      toast.success('Quiz generated successfully!');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate quiz'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpload)} className='space-y-4'>
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
                  placeholder='Select PDF file'
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    field.onChange(file);
                    setPdfFile(file);
                  }}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type='submit'
          className='w-1/3 self-center'
          disabled={isLoading || !form.watch('pdf')}
        >
          {isLoading ? (
            <span className='flex items-center'>
              <Loader className='w-4 h-4 animate-spin mr-2' />
              Generating Quiz...
            </span>
          ) : (
            'Generate Quiz'
          )}
        </Button>
      </form>
    </Form>
  );
}
