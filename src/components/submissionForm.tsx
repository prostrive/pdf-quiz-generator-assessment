"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from "react";
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl } from './ui/form';
import toast from "react-hot-toast";
import Quizzes from "./quizForm";
import { Question } from "@/lib/utils";
import { assertFileIsPdf } from "@/lib/pdfHandler";

function SubmissionForm() {
	const [fileID, setFileID] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
	const [isUploadDisabled, setIsUploadDisabled] = useState(false);

	 const form = useForm<z.infer<typeof assertFileIsPdf>>({
        resolver: zodResolver(assertFileIsPdf),
    });

	// Show file upload component by default
	const [showFileUploadCmponent, setShowFileUploadCmponent] = useState(true);
	// Hide Quizzes component by default
    const [showQuizComponent, setShowQuizComponent] = useState(false);

    // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
	const handleFileChange = async (target: z.infer<typeof assertFileIsPdf>) => {
		try {
			// Disable upload button and input to prevent spamming.
			setIsUploadDisabled(true);
			if (!target.pdf) {
				// Re-enable upload button and input on error
				setIsUploadDisabled(false);
				toast.error("Incorrect file. Only PDFs can be uploaded.");
				return;
			} else {
				// Lazy load? parsePdf due to server-side rendering issues
				const { pdfParser } = await import("@/lib/pdfHandler");
				const parseResult = await pdfParser(target.pdf);

				if (!parseResult.success) {
					// Re-enable upload button and input on error
					setIsUploadDisabled(false);
					toast.error(`PDF parse unsuccessful. ${parseResult.message}`);
					return;
				}

				const parseContext = parseResult.context || ""
;
				// Send file to /api/upload-file in formData file format
				const formData = new FormData();
				formData.append("pdftext", parseContext);
				toast.promise(
					fetch("/api/upload-file", {
						method: "POST",
						body: formData
					}).then( async (response) => {
						const data = await response.json();
						if (response.status === 200) {
							setFileID(data.fileID);
							setQuestions(data.questions);
							// Show the quiz component when questions are ready
							setShowQuizComponent(true);
							// Hide the file upload bar when questions are ready
							setShowFileUploadCmponent(false);

							return `PDF file uploaded successfully`;
						} else {
							throw new Error("Failed to upload PDF file");
						}
					}),
					{
						loading: `Uploading PDF file...`,
						success: (message) => message,
						error: (err) => err.message || "Failed to upload file"
					}
				);
			}
		} catch (error: any) {
			// Re-enable upload button and input on error
			setIsUploadDisabled(false);
			toast.error("General error. " + error)
		}
        
    }

  	return (
		<div className='flex flex-col gap-5'>
		<Form {...form}>
            <form onSubmit={form.handleSubmit(handleFileChange)}>
				{showFileUploadCmponent && <Card>
					<CardHeader>
						<CardTitle>Generate a Quiz from a PDF!</CardTitle>
						<CardDescription>Click the input box below to upload a PDF file</CardDescription>
					</CardHeader>
					<CardContent>
						<FormField
						control={form.control}
						name='pdf'
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input type='file' accept='application/pdf' placeholder='Upload PDF file' disabled={isUploadDisabled} onChange={(e) => {
										const file = e.target.files?.[0] || null;
										field.onChange(file);
									}}
									/>
								</FormControl>
							</FormItem>
						)}
						/>
                		<Button type='submit' className="mt-2" disabled={isUploadDisabled}>Generate Questions</Button>
					</CardContent>
				</Card>}
            </form>
        </Form>
		{showQuizComponent && <Quizzes questions={questions}/>}
		</div>
  	);
}

export default SubmissionForm;
