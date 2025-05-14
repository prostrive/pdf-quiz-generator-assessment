"use server";

import { createReadStream } from "fs";
import { openAiClient } from "../client";

/**
 * Create an assistant
 * that will help create and check answers
 *
 * @returns
 */
export async function createAssistant() {
  const instructions = `Make questions based on the attached PDF file in the thread, you have two types of questions \`free_text\` and \`multiple_choice\`,
\`free_text\` should always have an answer and \'multiple_choice\' should only have one answer, you also check user answers from a \`free_text\` question,
Follow the \'question.json\' and \'free_text_result.json\' when generating responses and finally make sure that you only return the json markup of the result`;

  const cwd = process.cwd();
  const freeTextResultFormat = createReadStream(`${cwd}/free_text_result.json`);
  const questionFormat = createReadStream(`${cwd}/question.json`);

  const freeTextResultFile = await openAiClient.files.create({
    file: freeTextResultFormat,
    purpose: "assistants",
  });

  const questionFormatFile = await openAiClient.files.create({
    file: questionFormat,
    purpose: "assistants",
  });

  const resourceVector = await openAiClient.vectorStores.create({
    name: "resource.json",
    file_ids: [freeTextResultFile.id, questionFormatFile.id],
  });

  return await openAiClient.beta.assistants.create({
    instructions,
    name: "Professor",
    tools: [{ type: "file_search" }],
    tool_resources: { file_search: { vector_store_ids: [resourceVector.id] } },
    model: "gpt-4o",
  });
}
