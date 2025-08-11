import { Loader2, FileText, Upload } from "lucide-react";
import { CardHeader, CardTitle, CardDescription, Button } from "../ui";
import React from "react";
import ErrorAlert from "../ui/error";

type Props = {
  isLoading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  onClearError?: () => void;
};

const UploadPDF = React.forwardRef<HTMLInputElement, Props>(
  ({ isLoading, onFileSelect, error, onClearError }, ref) => {
    const handleButtonClick = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.click();
      }
    };

    return (
      <>
        <CardHeader className="text-center p-0">
          <CardTitle className="text-2xl">Upload Your PDF</CardTitle>
          <CardDescription>
            Select a PDF document to generate quiz questions from its content
          </CardDescription>
        </CardHeader>

        <div className="max-w-md mx-auto space-y-4">
          {/* Error Alert */}
          {error && <ErrorAlert error={error} onClearError={onClearError} title="PDF Upload Error"/>}

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              error
                ? "border-red-300 bg-red-25"
                : isLoading
                ? "border-blue-300 bg-blue-50"
                : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
            }`}
          >
            <input
              ref={ref}
              type="file"
              accept=".pdf"
              onChange={onFileSelect}
              className="hidden"
              disabled={isLoading}
            />

            {isLoading ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Extracting Content...
                  </h3>
                  <p className="text-slate-600">
                    Please wait while we process your PDF
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <FileText
                  className={`h-12 w-12 mx-auto ${
                    error ? "text-red-400" : "text-slate-400"
                  }`}
                />
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    {error ? "Upload Failed" : "Choose PDF File"}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {error
                      ? "Please select a different PDF file to continue"
                      : "Maximum file size: 10MB • Maximum pages: 10"}
                  </p>
                  <Button
                    onClick={handleButtonClick}
                    className={
                      error
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }
                  >
                    <Upload className="h-4 w-4" />
                    {error ? "Select Different File" : "Select File"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
);

export default UploadPDF;
