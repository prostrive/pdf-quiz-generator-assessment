import { readFileSync, writeFileSync } from "fs";
import { createAssistant } from "./ai/assistant/assistant";

/**
 * ================================================================
 * Makeshift database for storing OpenAI and questionnaire details.
 * ================================================================
 */

export type Choices = "A" | "B" | "C" | "D";

export type Question = {
  type: "free_text" | "multiple_choice";
  question: string;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: Choices;
  userAnswer: string | null;
  isCorrect: boolean;
  explanation: string;
};

export type UploadedFile = {
  id: string;
  vectorId: string;
  name: string;
  path: string;
};

export type DatabaseObject = {
  assistant: string | null;
  questionnaires: {
    [k: string]: {
      threadId: string;
      completed: boolean;
      result: { score: number };
      questions: Array<Question>;
      file: UploadedFile;
    };
  };
};

const dbPath = `${process.cwd()}/database.json`;

class DbObj {
  _dbPath = `${process.cwd()}/database.json`;
  data: DatabaseObject;

  constructor() {
    this.data = this._getData();
  }

  /**
   * Read, parses and validates the `database.json` file before using it
   * all across the application.
   */
  _getData() {
    try {
      const dbObj = JSON.parse(
        readFileSync(this._dbPath).toString()
      ) as DatabaseObject;

      if (!Object.hasOwn(dbObj, "assistant")) {
        throw new Error("Assistant property is not set in the JSON file.");
      }

      if (!Object.hasOwn(dbObj, "assistant")) {
        throw new Error("Questionnaires property is not set in the JSON file.");
      }

      return dbObj;
    } catch (e) {
      console.log(e);

      throw new Error("Unable to parse storage.");
    }
  }

  /**
   * Returns the current assistant id
   *
   * @returns string
   */
  getAssistant() {
    return this.data.assistant;
  }

  /**
   * Return the assistant id in the current database file,
   * if null creates a new assistant.
   *
   * @returns string
   */
  async getOrCreateAssistant() {
    try {
      if (this.data.assistant) {
        return this.data.assistant;
      }

      const response = await createAssistant();

      this.data.assistant = response.id;

      writeFileSync(dbPath, JSON.stringify(this.data));

      return this.data.assistant;
    } catch (e) {
      console.log(e);
      throw new Error("Failed to fetch or create assistant");
    }
  }

  /**
   *
   * @param fileId
   * @param questions
   * @returns
   */
  async addQuestionsToFile(
    threadId: string,
    file: UploadedFile,
    questions: Array<Question>
  ) {
    this.data.questionnaires[file.id] = {
      threadId,
      questions: questions.map((q) => ({
        ...q,
        userAnswer: null,
        isCorrect: false,
      })),
      file,
      completed: false,
      result: { score: 0 },
    };

    this.saveData();

    return this.data.questionnaires[file.id];
  }

  saveScore(fileId: string, score: number) {
    this.data.questionnaires[fileId].completed = true;
    this.data.questionnaires[fileId].result.score = score;

    this.saveData();
  }

  saveData() {
    writeFileSync(this._dbPath, JSON.stringify(this.data));
  }
}

const database = new DbObj();

export default database;
