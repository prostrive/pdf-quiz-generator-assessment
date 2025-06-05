import { QuizPromptOptions } from "@/types";

/**
 * Generate a structured prompt for quiz creation from PDF content
 * @param content - Preprocessed PDF text content
 * @param options - Quiz generation options
 * @returns Formatted prompt for OpenAI API
 */
export function createQuizGenerationPrompt(content: string, options: QuizPromptOptions = {}): string {
  const { questionCount = 5, difficulty = "medium", includeExplanations = false, focusAreas = [] } = options;
  const difficultyInstructions = getDifficultyInstructions(difficulty);
  const focusInstructions =
    focusAreas.length > 0 ? `\n\nFocus the questions on these specific areas: ${focusAreas.join(", ")}` : "";
  const explanationInstructions = includeExplanations
    ? `\n- Include a brief explanation for why each correct answer is right`
    : "";

  return `You are an expert educational content creator. Your task is to generate ${questionCount} high-quality multiple-choice questions based on the provided text content.

**CONTENT TO ANALYZE:**
${content}

**INSTRUCTIONS:**
- Create exactly ${questionCount} multiple-choice questions with 4 options each (A, B, C, D)
- Questions should be ${difficulty} difficulty level
- ${difficultyInstructions}
- Ensure questions test comprehension, not just memorization
- Make incorrect options plausible but clearly wrong
- Avoid questions that require external knowledge not in the content
- Questions should be diverse and cover different parts of the content${focusInstructions}${explanationInstructions}

**REQUIRED OUTPUT FORMAT (JSON only, no additional text):**
{
  "questions": [
    {
      "id": "q1",
      "question": "Clear, specific question text here?",
      "options": [
        "Option A text",
        "Option B text",
        "Option C text",
        "Option D text"
      ],
      "correctAnswer": 0,
      "explanation": "Brief explanation (if requested)"
    }
  ]
}

**IMPORTANT REQUIREMENTS:**
- Return ONLY valid JSON, no markdown formatting or extra text
- Use "correctAnswer" as index (0=A, 1=B, 2=C, 3=D)
- Each question must have exactly 4 options
- Question text should end with a question mark
- Keep options concise but descriptive
- Ensure grammatical correctness

Generate the quiz now:`;
}

/**
 * Get difficulty-specific instructions for quiz generation
 * @param difficulty - Difficulty level
 * @returns Instructions text for the specified difficulty
 */
function getDifficultyInstructions(difficulty: "easy" | "medium" | "hard"): string {
  switch (difficulty) {
    case "easy":
      return "Focus on basic concepts, definitions, and direct facts from the text. Questions should test recall and basic understanding.";

    case "medium":
      return "Include questions that test understanding, application, and some analysis. Mix factual recall with conceptual understanding.";

    case "hard":
      return "Create questions requiring analysis, synthesis, and critical thinking. Test deeper understanding and ability to connect concepts.";

    default:
      return "Create balanced questions testing various levels of understanding.";
  }
}

/**
 * Validate quiz generation prompt parameters
 * @param content - PDF content to validate
 * @param options - Quiz options to validate
 * @returns Validation result
 */
export function validateQuizPromptInputs(
  content: string,
  options: QuizPromptOptions = {}
): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const { questionCount = 5 } = options;

  // Validate content
  if (!content || content.trim().length === 0) {
    issues.push("Content cannot be empty");
  } else if (content.length < 200) {
    issues.push("Content is too short for meaningful quiz generation (minimum 200 characters)");
  } else if (content.length > 50000) {
    issues.push("Content is too long and may exceed API limits (maximum 50,000 characters)");
  }

  // Validate question count
  if (questionCount < 1) {
    issues.push("Question count must be at least 1");
  } else if (questionCount > 20) {
    issues.push("Question count should not exceed 20 for optimal performance");
  }

  // Validate word count for question generation
  const wordCount = content.split(/\s+/).length;
  const minWordsPerQuestion = 50; // Rough estimate

  if (wordCount < questionCount * minWordsPerQuestion) {
    issues.push(
      `Content may be too short for ${questionCount} questions. Consider reducing question count or providing more content.`
    );
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Create a simplified prompt for testing API connectivity
 * @returns Simple test prompt
 */
export function createTestPrompt(): string {
  return `Create 1 simple multiple-choice question about basic mathematics.

**REQUIRED OUTPUT FORMAT (JSON only):**
{
  "questions": [
    {
      "id": "test1",
      "question": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 1
    }
  ]
}`;
}

/**
 * Common quiz topics that can be suggested as focus areas
 */
export const SUGGESTED_FOCUS_AREAS = [
  "Key concepts and definitions",
  "Important facts and figures",
  "Processes and procedures",
  "Causes and effects",
  "Comparisons and contrasts",
  "Historical context",
  "Practical applications",
  "Problem-solving approaches"
] as const;

/**
 * Prompt templates for different content types
 */
export const CONTENT_TYPE_PROMPTS = {
  academic: "Focus on key concepts, theories, and academic understanding",
  technical: "Emphasize technical details, procedures, and practical applications",
  historical: "Highlight important dates, events, causes, and consequences",
  scientific: "Test understanding of processes, experiments, and scientific principles",
  business: "Focus on strategies, processes, and business concepts"
} as const;
