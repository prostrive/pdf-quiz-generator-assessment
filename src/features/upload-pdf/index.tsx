"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Brain, CheckCircle, FileText, Upload } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { HowItWorks } from "@/features/upload-pdf/components/how-it-works";

type Props = {
  file: File | null;
  setFile: Dispatch<SetStateAction<File | null>>;
  generateQuiz: (file: File | null) => Promise<void>;
  loading: boolean;
};

export function UploadPDF({ file, setFile, generateQuiz, loading }: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      toast.success("File selected", {
        description: `${selectedFile.name} is ready for processing`,
      });
    } else {
      toast.error("Invalid file", {
        description: "Please select a valid PDF file",
      });
      setFile(null);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-600 to-zinc-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <Brain className="relative h-16 w-16 text-zinc-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-300 bg-clip-text text-transparent mb-4">
            PDF Quiz Generator
          </h1>
        </div>

        {/* Upload Card */}
        <Card className="shadow-2xl border-0 bg-zinc-800 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-zinc-300" />
            </div>
            <CardTitle className="text-2xl text-zinc-100">
              Upload Your PDF
            </CardTitle>
            <CardDescription className="text-lg text-zinc-300">
              Select a PDF document to generate personalized quiz questions
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label
                htmlFor="upload"
                className={cn(
                  "h-20 text-base border-2 border-dashed text-zinc-300 border-zinc-700 hover:border-zinc-200 transition-all flex justify-center hover:cursor-pointer",
                  file &&
                    "group-hover:opacity-50 duration-500 delay-100 group-hover:cursor-pointer"
                )}
              >
                {file ? (
                  <div className="flex items-center justify-center text-green-600 w-full group-hover:cursor-pointer">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                ) : (
                  "Choose PDF File or Drag Here"
                )}
              </Label>
              <div className="relative group">
                <Input
                  id="upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  hidden
                />
              </div>
            </div>

            <Button
              onClick={() => generateQuiz(file)}
              disabled={!file || loading}
              className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02]"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-3" />
                  Generate Quiz
                </>
              )}
            </Button>
            {/* How it works */}
            <HowItWorks />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
