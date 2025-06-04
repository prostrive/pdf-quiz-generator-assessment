export function cleanAITextOutput(raw: string): string {
  let cleaned = raw.trim();
 
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/, '');

  return cleaned.trim();
}