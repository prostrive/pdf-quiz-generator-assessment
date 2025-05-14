"use server";

import { verifyAnswer } from "@/lib/ai/assistant/thread";
import database from "@/lib/database";
import { revalidatePath } from "next/cache";

export default async function answerQuestionnaire(
  prevState: null,
  formData: FormData
) {
  const fileId = formData.get("fileId") as string;
  const questionnaire = database.data.questionnaires[fileId];
  let score = 0;

  if (!questionnaire.questions) {
    throw new Error("Cannot find the questionnaire");
  }

  const { questions, threadId } = questionnaire;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const selectedAnswer = formData.get(`${fileId}:${i}`) as string | null;
    let isCorrect = question.answer === selectedAnswer;

    if (question.type === "free_text") {
      const result = await verifyAnswer(
        threadId,
        question.question,
        selectedAnswer as string
      );

      isCorrect = result.correct;
    }

    database.data.questionnaires[fileId].questions[i].isCorrect = isCorrect;
    database.data.questionnaires[fileId].questions[i].userAnswer =
      selectedAnswer;

    if (isCorrect) {
      score++;
    }
  }

  database.saveScore(fileId, score);

  revalidatePath("/");

  return null;
}
