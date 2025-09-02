import { z } from 'zod';

export const pdfFileValidator = z.object({
    pdf: z
        .instanceof(File, { message: "No pdf file selected." })
        .refine((file) => file.type === 'application/pdf', {
        message: 'Invalid file type. Please upload a PDF file.'
    })
})