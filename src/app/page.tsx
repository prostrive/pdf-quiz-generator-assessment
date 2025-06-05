import { UploadInterface } from "@/components/UploadInterface";

export default function Home() {
  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">PDF Quiz Generator</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload a PDF document and generate interactive quizzes using AI. Perfect for studying, training, or knowledge
          assessment.
        </p>
      </div>
      <UploadInterface />
    </>
  );
}
