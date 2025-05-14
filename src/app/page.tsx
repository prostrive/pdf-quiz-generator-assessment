import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function Home() {
  return (
    <div className="flex-1">
      <Alert>
        <AlertTitle>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Welcome!
          </h3>
        </AlertTitle>
        <AlertDescription>
          To proceed, upload a PDF file or select a questionnaire.
        </AlertDescription>
      </Alert>
    </div>
  );
}
