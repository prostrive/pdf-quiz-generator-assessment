import database from "@/lib/database";
import Questionnaire from "@/components/form/questionnaire/questionnaire";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ file: string }>;
}) {
  const questionnaires = database.data.questionnaires;
  const questionnaire = questionnaires[(await params).file];

  if (Object.keys(questionnaires).length < 1) {
    redirect("/");
  }

  return (
    <div className="flex-1">
      {questionnaire && questionnaire.questions && (
        <Questionnaire
          score={questionnaire.result.score}
          isCompleted={questionnaire.completed}
          questions={questionnaire.questions}
          file={questionnaire.file}
        />
      )}
    </div>
  );
}
