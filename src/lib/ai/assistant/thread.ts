"use server";

import database, { Question } from "@/lib/database";
import { openAiClient } from "../client";

export async function verifyAnswer(
  threadId: string,
  question: string,
  answer: string
) {
  const content = `Based on the PDF document attached and this question,
\`\`\`${question}\`\`\` check if this answer is correct \`\`\`${answer}\`\`\` ,
make sure to only return the json markup using the \`free_text_result.json\` format.`;

  await openAiClient.beta.threads.messages.create(threadId, {
    role: "user",
    content,
  });

  const [, result] = await run(threadId);

  return result as {
    question: string;
    user_answer: string;
    correct: boolean;
    correct_answer: string;
  };
}

export async function generateQuestions(vectorStorageId: string) {
  const assistantId = database.data.assistant;

  if (!assistantId) {
    throw new Error("Assistant is not set.");
  }

  // Create a thread
  const thread = await openAiClient.beta.threads.create({
    tool_resources: {
      file_search: {
        vector_store_ids: [vectorStorageId],
      },
    },
  });

  // Add the message to the thread with the file ID
  await openAiClient.beta.threads.messages.create(thread.id, {
    role: "user",
    content: `generate 5 questions based on the PDF file attached, make sure to only return the json markup`,
  });

  return await run<Array<Question>>(thread.id);
}

async function run<T>(threadId: string) {
  const assistantId = database.getAssistant()!;

  // Run the assistant
  const run = await openAiClient.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
    response_format: { type: "text" },
  });

  let runStatus = await openAiClient.beta.threads.runs.retrieve(
    threadId,
    run.id
  );

  while (runStatus.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    runStatus = await openAiClient.beta.threads.runs.retrieve(threadId, run.id);

    if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
      break;
    }
  }

  const messages = await openAiClient.beta.threads.messages.list(threadId);

  return [
    threadId,
    JSON.parse(
      (
        messages.data[0].content[0] as { text: { value: string } }
      ).text.value.replace(/```json\s*|```/g, "")
    ) as T,
  ] as [string, T];
}
