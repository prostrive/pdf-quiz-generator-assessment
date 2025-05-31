import { z } from "zod";

export const uploadPDFSchema = z.object({
  pdf: z.instanceof(File).refine((file) => "application/pdf" === file.type, {
    message: "Invalid file type",
  }),
});