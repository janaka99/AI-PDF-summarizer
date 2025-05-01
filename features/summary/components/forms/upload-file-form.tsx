"use client";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  FileUploadSchema,
  FileUploadSchemaType,
} from "../../schemas/summary-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { CheckCircle, FileText, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/utils/uploadthing";
import { toast } from "sonner";
import { generatePDFSummaryAction } from "../../actions/summary-action";
import { useAuth, useClerk } from "@clerk/nextjs";
import Container from "@/components/common/container";
import { useRouter } from "next/navigation";

export default function UploadFileForm() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState("");

  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const router = useRouter();

  const { startUpload } = useUploadThing("pdfUploader", {
    onUploadError: (ee) => {
      toast("Error", {
        description: "Error occured while uploading",
      });
    },
  });

  const form = useForm<FileUploadSchemaType>({
    resolver: zodResolver(FileUploadSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) {
      openSignIn({
        signUpForceRedirectUrl: "/dashboard",
      });
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      form.setValue("file", file, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: FileUploadSchemaType) => {
    if (!isSignedIn) {
      openSignIn({
        signUpForceRedirectUrl: "/dashboard",
      });
      return;
    }
    setIsUploading(true);
    try {
      toast("Uploading...", {
        description: "Processing PDF",
      });
      const res = await startUpload([data.file]);
      if (!res) {
        toast("Something Went Wrong", {
          description: "Please Try again",
        });
        return;
      }
      toast("Success", {
        description: "File has been successfully uploaded and now processing",
      });
      const summary = await generatePDFSummaryAction(res);
      if (summary.error) {
        toast("Something Went Wrong", {
          description: "Please Try again",
        });
      }
      if (summary.data) {
        // @ts-ignore
        setSummary(summary.data);
        toast("Success", {
          description: "Summary has been generated",
        });
        router.push(`/dashboard/${summary.data}/view`);
        return;
      }
      toast("Something Went Wrong", {
        description: "Please Try again",
      });
    } catch (error) {
      toast("Something Went Wrong", {
        description: "Please Try again",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    form.resetField("file");
  };

  return (
    <Container className="mb-20">
      <Card className="w-full mx-auto">
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="file"
                render={({
                  field: { ref, value, onChange, ...fieldProps },
                }) => (
                  <FormItem>
                    <FormControl>
                      {!fileName ? (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md border-gray-300 bg-gray-50">
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <div className="text-center">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() =>
                                document.getElementById("file-upload")?.click()
                              }
                            >
                              Select PDF File
                            </Button>
                            <Input
                              id="file-upload"
                              type="file"
                              accept=".pdf,application/pdf"
                              className="hidden"
                              onChange={handleFileChange}
                              {...fieldProps}
                              ref={ref}
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            PDF files only (max 10MB)
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 border rounded-md bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-6 h-6 text-blue-500" />
                            <span className="text-sm font-medium truncate max-w-[180px]">
                              {fileName}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearFile}
                          >
                            <XCircle className="w-5 h-5 text-gray-500" />
                          </Button>
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={!fileName || isUploading || !form.formState.isValid}
              >
                {isUploading ? "Uploading..." : "Upload PDF"}
                {isUploading ? (
                  <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <CheckCircle className="ml-2 h-4 w-4" />
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        {
          <div className="">
            {summary && (
              <div
                className="mt-4 p-4 border rounded-md bg-gray-50"
                dangerouslySetInnerHTML={{ __html: summary }}
              ></div>
            )}
          </div>
        }
      </Card>
    </Container>
  );
}
