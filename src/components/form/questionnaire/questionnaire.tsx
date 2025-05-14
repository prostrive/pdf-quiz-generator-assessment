"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Question as QuestionType, UploadedFile } from "@/lib/database";
import { useActionState } from "react";
import answerQuestionnaire from "@/actions/answer";
import Question from "./component/question";
import { getScoreMessage } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Props = {
  questions: Array<QuestionType>;
  file: UploadedFile;
  isCompleted: boolean;
  score: number;
};

export default function Questionnaire({
  isCompleted,
  questions,
  file,
  score,
}: Props) {
  const [, action, isLoading] = useActionState(answerQuestionnaire, null);

  return (
    <div className="w-full">
      <form action={action}>
        <div className="grid gap-3">
          {isCompleted && (
            <Alert>
              <AlertTitle className="text-lg">
                {getScoreMessage(score)}
              </AlertTitle>
              <AlertDescription className="text-md">
                Your score: {score}/{questions.length}
              </AlertDescription>
            </Alert>
          )}
          <Input type="hidden" name="fileId" value={file.id} />
          {questions.map((question, i) => (
            <Question
              isCompleted={isCompleted}
              isLoading={isLoading}
              key={`${file.id}-q-${i}`}
              fileId={file.id}
              questionIndex={i}
              {...question}
            />
          ))}
          {!isCompleted && (
            <div className="flex flex-row justify-end">
              <Button disabled={isLoading} type="submit" className="w-3/12">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking answers...
                  </>
                ) : (
                  <>Submit</>
                )}
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
