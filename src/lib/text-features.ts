// One tokenizer and sentence splitter shared by the browser-side metric extractor
// and the public-demo style index, so both surfaces measure text the same way.
// Pure functions only: no labels, biography, or network access.

const wordPattern = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
const abbreviations = /\b(Mr|Mrs|Ms|Dr|Rev|St|Prof)\./gi;

export function tokens(text: string): RegExpExecArray[] {
  return [...text.matchAll(wordPattern)] as RegExpExecArray[];
}

export function words(text: string): string[] {
  return tokens(text).map(match => match[0].toLowerCase().replaceAll("’", "'"));
}

export function wordCount(text: string): number {
  return tokens(text).length;
}

/** Word counts per sentence, with common English abbreviations protected from the splitter. */
export function sentenceLengths(text: string): number[] {
  const protectedText = text.replace(abbreviations, "$1․");
  return protectedText.split(/[.!?]+/).map(sentence => wordCount(sentence)).filter(length => length > 0);
}

export const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);

export function populationDeviation(values: number[]): number {
  const center = mean(values);
  return Math.sqrt(mean(values.map(value => (value - center) ** 2)));
}

/** Leading window of at most `limit` words, cut at a token boundary. */
export function textWindow(text: string, limit: number): string {
  const matches = tokens(text);
  if (matches.length <= limit) return text;
  return text.slice(0, matches[limit].index).trim();
}
