'use client';

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/webpack';

export async function parsePdf(file: File): Promise<{
    success: boolean;
    message?: string;
    context?: string;
}> {
	if (typeof window === 'undefined') {
		// Prevents the function from being run on the server (SSR)
		return {
			success: false,
			message: 'parsePdf must be run in the browser.',
		};
	}

	// Set the workerSrc inside the function to avoid SSR issues
	/*
		I downgraded the PDFJS because of worker issues in the latest version.
		That's why we have a static file of the pdf worker.
	*/
	GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

	const arrayBuffer = await file.arrayBuffer();
	const pdf = await getDocument({ data: arrayBuffer }).promise;

	/*
		Check if the PDF exceeds 10 pages.
		If yes, return early with an error message.
	*/
	if (pdf.numPages > 10) {
		return {
			success: false,
			message: 'PDF has more than 10 Pages.',
		};
	}

	/*
		Extracting text from each page and concatenate it into a single string.
	*/
	let fullText = '';
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const text = await page.getTextContent();
		const pageText = text.items
		.map(item => ('str' in item ? item.str : ''))
		.join(' ');
		fullText += pageText + '\n';
	}

	return {
		success: true,
		context: fullText,
	}
}