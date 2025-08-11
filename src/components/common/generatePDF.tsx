import { Brain, FileText, Loader2 } from "lucide-react";
import {
  CardDescription,
  CardHeader,
  CardTitle,
  Card,
  CardContent,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui";
import React, { useEffect } from "react";
import ErrorAlert from "../ui/error";

type Props = {
  isLoading: boolean;
  file: File;
  onGenerate?: () => void;
  error?: string;
  onClearError?: () => void;
};

const GeneratePDF = React.forwardRef<HTMLCanvasElement, Props>(
  ({ isLoading, file, onGenerate, error, onClearError }, canvasRef) => {
    const renderFirstPage = async (file: File) => {
      if (!canvasRef || typeof canvasRef === "function" || !canvasRef.current)
        return;

      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

        const page = await pdf.getPage(1);
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) return;

        const viewport = page.getViewport({ scale: 0.75, dontFlip: false });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (error) {
        console.error("Error rendering first page:", error);
      }
    };

    useEffect(() => {
      if (
        file &&
        canvasRef &&
        typeof canvasRef !== "function" &&
        canvasRef.current
      ) {
        renderFirstPage(file);
      }
    }, [file, canvasRef]);

    return (
      <div>
        <CardHeader className="text-center pb-6 pt-2">
          <CardTitle className="text-2xl">PDF Processed Successfully</CardTitle>
          <CardDescription>
            Ready to generate quiz questions from your document
          </CardDescription>
        </CardHeader>

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-center">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <FileText className="h-4 w-4 mr-2" />
              {file?.name}
            </Badge>
          </div>

          {/* Error Alert */}
          {error && <ErrorAlert error={error} onClearError={onClearError} title="Quiz Generation Error"/>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-center text-slate-800 mb-2">
                  Content Preview
                </h4>
                <div className="flex justify-center">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto border border-gray-200 rounded"
                    style={{ display: "block" }}
                  />
                </div>
              </CardContent>
            </Card>

            <CardContent className="p-4 flex items-start justify-center">
              <div className="text-center">
                {isLoading ? (
                  <div className="space-y-4">
                    <Loader2 className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Generating Quiz...
                      </h3>
                      <p className="text-slate-600">
                        AI is analyzing your document and creating questions
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Brain className="h-12 w-12 text-blue-500 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        Ready to Generate
                      </h3>
                      <p className="text-slate-600 mb-4">
                        We'll create 5 multiple-choice questions based on your
                        PDF content
                      </p>
                      <Button
                        onClick={onGenerate}
                        className="bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <Brain className="h-4 w-4" />
                        Generate Quiz
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    );
  }
);

GeneratePDF.displayName = "GeneratePDF";

export default GeneratePDF;
