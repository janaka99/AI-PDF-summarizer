import { z } from "zod";
import { MAX_FILE_SIZE } from "../constants";

export const FileUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Invalid file" })
    .refine((file) => file.type === "application/pdf", {
      message: "Only PDF files are accepted",
    })
    .refine(
      (file) => {
        return file.size <= MAX_FILE_SIZE;
      },
      { message: "File must be less than 10MB" }
    ),
});

export type FileUploadSchemaType = z.infer<typeof FileUploadSchema>;
