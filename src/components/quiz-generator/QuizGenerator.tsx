import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { parsePDF } from "@/lib/parsePDF";
import { Questions } from "@/types";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

type Props = {
  setQuestions: Dispatch<SetStateAction<Questions | null>>;
};

export default function QuizGenerator({ setQuestions }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateQuiz = async () => {
    setLoading(true);
    toast.dismiss();

    if (!file) {
      toast.error("Please upload a PDF file before generating a quiz");
      setLoading(false);
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      setLoading(false);
      return;
    }

    try {
      const response = await parsePDF(file);
      if (!response.success) {
        toast.error(response.message || "Failed to parse PDF");
        setLoading(false);
        return;
      }
      const text = response.context;
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        body: JSON.stringify({ text: text }),
      });

      if (!res.ok) {
        toast.error("Something went wrong while generating the quiz");
        throw new Error(`Response status: ${res.status}`);
      }

      const data = await res.json();

      setQuestions(data.questions);
      toast.success("Quiz generated successfully!");
      setFile(null);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while generating the quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col justify-center gap-20 w-full h-screen">
      <div>
        <h1 className="text-4xl font-bold text-center mb-4">
          PDF Quiz Generator
        </h1>
        <p className="text-center">
          Generate Multiple Choice Question quizzes from your PDF file.
        </p>
      </div>
      <Card className="max-w-[560px] mx-auto">
        <CardHeader>
          <CardTitle>Upload your PDF</CardTitle>
          <CardDescription>
            Upload a PDF and get a quiz generated for you!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            className="mb-4 cursor-pointer"
            type="file"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
          />
          <Button
            className="cursor-pointer"
            disabled={loading}
            onClick={handleGenerateQuiz}
          >
            {loading ? "Generating quiz..." : "Generate Quiz"}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
