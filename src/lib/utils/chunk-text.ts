/**
 * Splits a long text into smaller chunks, preserving paragraph boundaries,
 * and ensuring each chunk does not exceed the specified maximum size.
 *
 * @param {string} text - The input text to be chunked.
 * @param {number} [maxChunkSize=3000] - The maximum number of characters allowed in each chunk.
 * @returns {string[]} - An array of text chunks that are within the max chunk size.
 */
export function chunkText(text: string, maxChunkSize: number = 3000): string[] {
  const paragraphs = text.split(/\n\s*\n/); // Split by double newlines
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxChunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        chunks.push(paragraph);
        currentChunk = paragraph;
      }
    } else {
      currentChunk += "\n\n" + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
