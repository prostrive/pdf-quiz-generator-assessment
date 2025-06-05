import { makeOpenAIRequest } from "./openai";
import { createQuizGenerationPrompt, validateQuizPromptInputs } from "./quizPrompts";
import {
  Quiz,
  Question,
  QuizGenerationResponse,
  QuizGenerationOptions,
  ParsedQuizResponse,
  ParsedQuestionResponse
} from "@/types";

/**
 * Generate a quiz from PDF content using OpenAI
 * @param content - Preprocessed PDF text content
 * @param options - Quiz generation options
 * @returns Promise with quiz generation result
 */
export async function generateQuiz(
  content: string,
  options: QuizGenerationOptions = {}
): Promise<QuizGenerationResponse> {
  const {
    questionCount = 5,
    difficulty = "medium",
    includeExplanations = false,
    focusAreas = [],
    title = "Generated Quiz",
    model = "gpt-3.5-turbo",
    maxRetries = 3
  } = options;

  try {
    console.log("🎯 Starting quiz generation...", {
      contentLength: content.length,
      questionCount,
      difficulty,
      model
    });

    // Validate inputs
    const validation = validateQuizPromptInputs(content, {
      questionCount,
      difficulty,
      includeExplanations,
      focusAreas
    });

    if (!validation.isValid) {
      return {
        success: false,
        error: `Invalid quiz parameters: ${validation.issues.join(", ")}`
      };
    }

    // Generate prompt
    const prompt = createQuizGenerationPrompt(content, {
      questionCount,
      difficulty,
      includeExplanations,
      focusAreas
    });

    // Make API request with retries
    const response = await makeQuizGenerationRequest(prompt, model, maxRetries);

    // Parse and validate response
    const questions = parseQuizResponse(response);

    // Create quiz object
    const quiz: Quiz = {
      id: generateQuizId(),
      title,
      questions,
      createdAt: new Date()
    };

    console.log("✅ Quiz generation successful:", {
      quizId: quiz.id,
      questionCount: questions.length,
      title: quiz.title
    });

    return {
      success: true,
      quiz
    };
  } catch (error) {
    console.error("❌ Quiz generation failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error during quiz generation";

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Make OpenAI API request with retry logic
 * @param prompt - Generated prompt for quiz creation
 * @param model - OpenAI model to use
 * @param maxRetries - Maximum number of retry attempts
 * @returns Promise with API response
 */
async function makeQuizGenerationRequest(prompt: string, model: string, maxRetries: number): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Quiz generation attempt ${attempt}/${maxRetries}...`);
      const response = await makeOpenAIRequest(
        async client =>
          await client.chat.completions.create({
            model,
            messages: [
              {
                role: "system",
                content:
                  "You are an expert educational content creator. Generate high-quality multiple-choice questions based on the provided content. Return only valid JSON with no additional formatting or text."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_completion_tokens: 2000,
            response_format: { type: "json_object" }
          })
      );
      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content received from OpenAI API");
      }

      console.log(`✅ API request successful (attempt ${attempt})`);

      return content;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown API error");
      console.warn(`⚠️ Attempt ${attempt} failed:`, lastError.message);

      // Don't retry on certain errors
      if (isNonRetryableError(error)) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`⏳ Retrying in ${delay}ms...`);

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("All retry attempts failed");
}

/**
 * Parse OpenAI response and extract questions
 * @param response - Raw API response content
 * @returns Array of validated questions
 */
function parseQuizResponse(response: string): Question[] {
  try {
    const parsed: ParsedQuizResponse = JSON.parse(response);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid response format: missing or invalid questions array");
    }

    const questions: Question[] = parsed.questions.map((q: ParsedQuestionResponse, index: number) => {
      // Validate question structure
      if (!q.question || typeof q.question !== "string") {
        throw new Error(`Question ${index + 1}: Invalid or missing question text`);
      }

      if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${index + 1}: Must have exactly 4 options`);
      }

      if (typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Question ${index + 1}: correctAnswer must be 0, 1, 2, or 3`);
      }

      return {
        id: q.id || `q${index + 1}`,
        question: q.question.trim(),
        options: q.options.map((opt: string) => opt.trim()) as [string, string, string, string],
        correctAnswer: q.correctAnswer as 0 | 1 | 2 | 3,
        explanation: q.explanation && q.explanation.trim()
      } as Question;
    });

    if (questions.length === 0) {
      throw new Error("No valid questions found in response");
    }

    return questions;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON response from OpenAI API");
    }

    throw error;
  }
}

/**
 * Check if an error should not be retried
 * @param error - Error to check
 * @returns True if error should not be retried
 */
function isNonRetryableError(error: unknown): boolean {
  // Don't retry on authentication errors
  if ((error as { status?: number })?.status === 401 || (error as { status?: number })?.status === 403) {
    return true;
  }

  // Don't retry on invalid request errors
  if ((error as { status?: number })?.status === 400) {
    return true;
  }

  // Don't retry on content policy violations
  if (
    (error as { status?: number; type?: string })?.status === 429 &&
    (error as { status?: number; type?: string })?.type === "content_policy_violation"
  ) {
    return true;
  }

  return false;
}

/**
 * Generate a unique quiz ID
 * @returns Unique quiz identifier
 */
function generateQuizId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Test quiz generation with simple content
 * @returns Promise with test result
 */
export async function testQuizGeneration(): Promise<{
  success: boolean;
  error?: string;
  quiz?: Quiz;
}> {
  const testContent = `
    Mathematics is the study of numbers, shapes, and patterns.
    Addition is one of the basic arithmetic operations.
    When we add 2 + 2, the result is 4.
    Multiplication is repeated addition.
    The area of a rectangle is calculated by multiplying its length by its width.
    Geometry deals with shapes and their properties.
    A triangle has three sides and three angles.
    The sum of angles in a triangle is always 180 degrees.
  `;

  try {
    const result = await generateQuiz(testContent, {
      questionCount: 3,
      difficulty: "easy",
      title: "Math Test Quiz"
    });

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Test failed"
    };
  }
}
