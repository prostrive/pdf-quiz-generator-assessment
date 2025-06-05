import { PreprocessedContent, PreprocessingOptions } from "@/types";

/**
 * Preprocess extracted PDF text for optimal quiz generation
 */
export function preprocessPDFContent(text: string, options: PreprocessingOptions = {}): PreprocessedContent {
  const { maxTokens = 3000, removeHeaders = true, removeExcessiveWhitespace = true, minParagraphLength = 20 } = options;
  const originalLength = text.length;
  let cleanedText = text;
  let removedSections = 0;

  // Step 1: Remove excessive whitespace
  if (removeExcessiveWhitespace) {
    cleanedText = cleanExcessiveWhitespace(cleanedText);
  }

  // Step 2: Remove likely headers and footers
  if (removeHeaders) {
    const result = removeHeadersAndFooters(cleanedText, minParagraphLength);
    cleanedText = result.text;
    removedSections += result.removedCount;
  }

  // Step 3: Limit content length for API efficiency
  cleanedText = limitContentLength(cleanedText, maxTokens);
  const cleanedLength = cleanedText.length;
  const estimatedTokens = estimateTokenCount(cleanedText);

  return {
    cleanedText,
    originalLength,
    cleanedLength,
    removedSections,
    estimatedTokens
  };
}

/**
 * Remove excessive whitespace and normalize text formatting
 */
function cleanExcessiveWhitespace(text: string): string {
  return (
    text
      // Replace multiple spaces with single space
      .replace(/[ \t]+/g, " ")
      // Replace multiple newlines with double newline (paragraph breaks)
      .replace(/\n{3,}/g, "\n\n")
      // Remove trailing whitespace from lines
      .replace(/[ \t]+$/gm, "")
      // Remove leading whitespace from lines (but preserve paragraph structure)
      .replace(/^[ \t]+/gm, "")
      // Trim overall text
      .trim()
  );
}

/**
 * Remove likely headers and footers based on repetition patterns
 */
function removeHeadersAndFooters(text: string, minParagraphLength: number): { text: string; removedCount: number } {
  const paragraphs = text.split("\n\n").filter(p => p.trim().length > 0);
  let removedCount = 0;

  // Remove very short paragraphs that are likely headers/footers
  const filteredParagraphs = paragraphs.filter(paragraph => {
    const cleaned = paragraph.trim();

    // Keep paragraphs that are long enough
    if (cleaned.length >= minParagraphLength) {
      return true;
    }

    // Remove paragraphs that look like page numbers
    if (/^\s*\d+\s*$/.test(cleaned)) {
      removedCount++;

      return false;
    }

    // Remove paragraphs that look like headers (all caps, short)
    if (/^[A-Z\s\d\-_]+$/.test(cleaned) && cleaned.length < 50) {
      removedCount++;

      return false;
    }

    // Remove paragraphs with only dates
    if (/^\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\s*$/.test(cleaned)) {
      removedCount++;

      return false;
    }

    // Remove paragraphs that are mostly special characters
    const specialCharRatio = (cleaned.match(/[^\w\s]/g) || []).length / cleaned.length;

    if (specialCharRatio > 0.5) {
      removedCount++;

      return false;
    }

    // Keep everything else (even if short, might be important content)
    return true;
  });

  // Detect and remove repeated content (common in headers/footers)
  const uniqueParagraphs = removeRepeatedContent(filteredParagraphs);
  removedCount += filteredParagraphs.length - uniqueParagraphs.length;

  return {
    text: uniqueParagraphs.join("\n\n"),
    removedCount
  };
}

/**
 * Remove paragraphs that appear multiple times (likely headers/footers)
 */
function removeRepeatedContent(paragraphs: string[]): string[] {
  const paragraphCounts = new Map<string, number>();

  // Count occurrences of each paragraph
  paragraphs.forEach(paragraph => {
    const normalized = paragraph.trim().toLowerCase();
    paragraphCounts.set(normalized, (paragraphCounts.get(normalized) || 0) + 1);
  });

  // Filter out paragraphs that appear more than once and are short
  return paragraphs.filter(paragraph => {
    const normalized = paragraph.trim().toLowerCase();
    const count = paragraphCounts.get(normalized) || 0;

    // If it appears multiple times and is short, it's likely a header/footer
    if (count > 1 && paragraph.trim().length < 100) {
      return false;
    }

    return true;
  });
}

/**
 * Limit content length to fit within API token limits
 */
function limitContentLength(text: string, maxTokens: number): string {
  // Rough estimate: 1 token ≈ 4 characters for English text
  const maxChars = maxTokens * 3.5; // Conservative estimate

  if (text.length <= maxChars) {
    return text;
  }

  // Try to cut at paragraph boundaries
  const paragraphs = text.split("\n\n");
  let truncatedText = "";

  for (const paragraph of paragraphs) {
    if ((truncatedText + paragraph).length > maxChars) {
      break;
    }

    truncatedText += (truncatedText ? "\n\n" : "") + paragraph;
  }

  // If we couldn't fit any complete paragraphs, just truncate
  if (!truncatedText) {
    truncatedText = text.substring(0, maxChars);

    // Try to cut at last sentence boundary
    const lastSentence = truncatedText.lastIndexOf(".");

    if (lastSentence > maxChars * 0.8) {
      truncatedText = truncatedText.substring(0, lastSentence + 1);
    }
  }

  return truncatedText;
}

/**
 * Estimate token count for OpenAI API
 * Rough approximation: 1 token ≈ 4 characters for English text
 */
function estimateTokenCount(text: string): number {
  // More accurate estimation considering:
  // - Words are typically 1-2 tokens
  // - Punctuation is usually 1 token
  // - Numbers can be 1-3 tokens
  const words = text.match(/\b\w+\b/g) || [];
  const punctuation = text.match(/[^\w\s]/g) || [];

  // Conservative estimate
  const estimatedTokens = Math.ceil(words.length * 1.3 + punctuation.length * 0.5);

  return estimatedTokens;
}

/**
 * Validate that preprocessed content is suitable for quiz generation
 */
export function validatePreprocessedContent(content: PreprocessedContent): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (content.cleanedLength < 200) {
    issues.push("Content too short for meaningful quiz generation");
  }

  if (content.estimatedTokens > 3500) {
    issues.push("Content may be too long for optimal API processing");
  }

  if (content.estimatedTokens < 50) {
    issues.push("Content may be too short for diverse question generation");
  }

  // Check if content has sufficient substance
  const words = content.cleanedText.match(/\b\w+\b/g) || [];

  if (words.length < 50) {
    issues.push("Insufficient word count for quiz generation");
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}
