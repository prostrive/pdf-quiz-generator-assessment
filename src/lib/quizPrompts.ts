import { QuizPromptOptions } from "@/types";

/**
 * Generate a structured prompt for quiz creation from PDF content
 * @param content - Preprocessed PDF text content
 * @param options - Quiz generation options
 * @returns Formatted prompt for OpenAI API
 */
export function createQuizGenerationPrompt(content: string, options: QuizPromptOptions = {}): string {
  const {
    questionCount = 5,
    difficulty = "medium",
    includeExplanations = false,
    focusAreas = [],
    questionTypes = ["multiple-choice"],
    shortAnswerRatio = 0
  } = options;
  const difficultyInstructions = getDifficultyInstructions(difficulty);
  const focusInstructions =
    focusAreas.length > 0 ? `\n\nFocus the questions on these specific areas: ${focusAreas.join(", ")}` : "";
  const explanationInstructions = includeExplanations
    ? `\n- Include a brief explanation for why each correct answer is right`
    : "";

  // Calculate question distribution
  const hasMultipleChoice = questionTypes.includes("multiple-choice");
  const hasShortAnswer = questionTypes.includes("short-answer");

  let questionDistribution = "";
  let questionTypeOrder = "";

  if (hasMultipleChoice && hasShortAnswer) {
    const shortAnswerCount = Math.round(questionCount * shortAnswerRatio);
    const multipleChoiceCount = questionCount - shortAnswerCount;
    questionDistribution = `
- Generate EXACTLY ${multipleChoiceCount} multiple-choice questions (each with exactly 4 options)
- Generate EXACTLY ${shortAnswerCount} short-answer questions (requiring brief text responses)
- TOTAL: ${questionCount} questions`;

    // Create explicit ordering
    const questionOrder = [];

    for (let i = 0; i < questionCount; i++) {
      if (i < shortAnswerCount) {
        questionOrder.push(`Question ${i + 1}: short-answer type`);
      } else {
        questionOrder.push(`Question ${i + 1}: multiple-choice type`);
      }
    }

    questionTypeOrder = `\n\nEXACT QUESTION TYPE ORDER:\n${questionOrder.join("\n")}`;
  } else if (hasShortAnswer) {
    questionDistribution = `- Generate EXACTLY ${questionCount} short-answer questions (requiring brief text responses)`;
    questionTypeOrder = `\n\nALL ${questionCount} questions must be short-answer type.`;
  } else {
    questionDistribution = `- Generate EXACTLY ${questionCount} multiple-choice questions (each with exactly 4 options)`;
    questionTypeOrder = `\n\nALL ${questionCount} questions must be multiple-choice type.`;
  }

  return `You are an expert educational content creator. Your task is to generate ${questionCount} high-quality questions based on the provided text content.

**CONTENT TO ANALYZE:**
${content}

**INSTRUCTIONS:**
${questionDistribution}${questionTypeOrder}
- Questions should be ${difficulty} difficulty level
- ${difficultyInstructions}
- Ensure questions test comprehension, not just memorization
- Make incorrect options plausible but clearly wrong (for multiple-choice)
- Avoid questions that require external knowledge not in the content
- Questions should be diverse and cover different parts of the content${focusInstructions}${explanationInstructions}

**REQUIRED OUTPUT FORMAT (JSON only, no additional text):**
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "Clear, specific question text here?",
      "options": [
        "First option text without letter prefix",
        "Second option text without letter prefix",
        "Third option text without letter prefix",
        "Fourth option text without letter prefix"
      ],
      "correctAnswer": 0,
      "explanation": "Brief explanation (if requested)"
    },
    {
      "id": "q2",
      "type": "short-answer",
      "question": "What is the main concept discussed in the second paragraph?",
      "correctAnswer": "The primary answer expected",
      "acceptableAnswers": ["Alternative acceptable answer 1", "Alternative acceptable answer 2"],
      "maxLength": 100,
      "explanation": "Brief explanation (if requested)"
    }
  ]
}

**IMPORTANT REQUIREMENTS:**
- Return ONLY valid JSON, no markdown formatting or extra text
- STRICTLY follow the question type distribution specified above
- For multiple-choice: Use "type": "multiple-choice" and "correctAnswer" as index (0=first option, 1=second option, 2=third option, 3=fourth option)
- For short-answer: Use "type": "short-answer" and "correctAnswer" as the expected text answer
- Include "acceptableAnswers" array for short-answer questions with alternative valid responses
- Each multiple-choice question must have exactly 4 options
- Question text should end with a question mark
- Keep options concise but descriptive (for multiple-choice)
- Do NOT include letter prefixes (A, B, C, D) in option text - provide clean option text only
- For short-answer questions, set reasonable "maxLength" (50-200 characters typically)
- Ensure grammatical correctness
- DO NOT deviate from the specified question types and counts

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
