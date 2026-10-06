import fixture from "@/data/public-demo/corpus.json";
import { mean, populationDeviation, sentenceLengths, textWindow, wordCount, words } from "@/lib/text-features";

export interface PublicExcerpt {
  id: string; authorId: string; title: string; year: number | null; edition: string; ebook: number | null;
  role: string; collectionId: string; sourceUrl: string | null; originalTextUrl: string | null; sourceNote: string; rights: string;
  text: string; wordCount: number; sha256: string; upstreamSha256: string | null;
  generationPrompt?: string; generator?: { kind: string; name: string; model: null; seed: null; reproducibility: string }; derivedFrom?: string;
}
export interface PublicAuthor {
  id: string; name: string; role: string; lifespan: string; birthYear: number; region: string; regionMeaning: string;
  language: string; languageMeaning: string; eslStatus: null; proficiency: null; educationLevel: null;
  biographyUrl: string; languageSourceUrl: string; description: string;
}
export interface DemoScenario {
  id: string; sampleId: string; label: string; title: string; summary: string; truth: string; contextFlags: string[];
}
export interface DemoCollection {
  id: string; name: string; kind: string; question: string; authorId: string; controlAuthorId: string;
  baselineIntro: string; baselineIds: string[]; scenarios: DemoScenario[];
}
export interface PublicCorpus {
  version: string; name: string; importedAt: string; purpose: string; processing: string; rightsScope: string;
  acknowledgement: string; sourcePolicyUrl: string; limits: string[]; authors: PublicAuthor[];
  defaultCollectionId: string; collections: DemoCollection[]; excerpts: PublicExcerpt[];
}
export const publicCorpus: PublicCorpus = fixture;
export const defaultCollectionId = publicCorpus.defaultCollectionId;
export const defaultScenarioId = "same-author";
export const minimumCandidateWords = 120;
export const comparisonWindow = 250;

export function getCollection(collectionId = defaultCollectionId): DemoCollection {
  const collection = publicCorpus.collections.find(item => item.id === collectionId);
  if (!collection) throw new Error("Unknown demo collection.");
  return collection;
}
export function getExcerpt(id: string): PublicExcerpt {
  const excerpt = publicCorpus.excerpts.find(item => item.id === id);
  if (!excerpt) throw new Error("Unknown demo excerpt.");
  return excerpt;
}
export function getAuthor(id: string): PublicAuthor | undefined { return publicCorpus.authors.find(item => item.id === id); }
export function baselineExcerptsOf(collectionId = defaultCollectionId): PublicExcerpt[] {
  return getCollection(collectionId).baselineIds.map(getExcerpt);
}
/** Authors shown in the context panel for a collection: the baseline author and the control author. */
export function collectionAuthors(collectionId = defaultCollectionId): PublicAuthor[] {
  const collection = getCollection(collectionId);
  return [collection.authorId, collection.controlAuthorId].map(getAuthor).filter((author): author is PublicAuthor => Boolean(author));
}

export const featureDefinitions = [
  { key: "sentenceLength", label: "Sentence length", unit: "words", floor: 4, detail: "Mean words per sentence, with common English abbreviations protected." },
  { key: "sentenceRhythm", label: "Sentence rhythm", unit: "CV", floor: .18, detail: "Standard deviation of sentence length divided by its mean." },
  { key: "wordLength", label: "Word length", unit: "letters", floor: .22, detail: "Mean letters per word; apostrophes do not count as letters." },
  { key: "functionWords", label: "Function words", unit: "%", floor: 4, detail: "Share of a fixed 34-word grammatical vocabulary, such as the, of, and, and but." },
  { key: "punctuation", label: "Punctuation", unit: "/100", floor: 3, detail: "Commas, semicolons, colons, and dashes per 100 words. Quotation glyphs are excluded." },
  { key: "vocabulary", label: "Vocabulary variety", unit: "%", floor: 5, detail: "Moving-average type/token ratio over 50-word windows, to reduce length dependence." },
] as const;
export type FeatureKey = typeof featureDefinitions[number]["key"];
export type FeatureValues = Record<FeatureKey, number>;
export interface FeatureComparison {
  key: FeatureKey; label: string; unit: string; baseline: number; sample: number; residual: number; scale: number; detail: string;
}
export interface DemoComparison {
  corpusVersion: string; engineVersion: string; collectionId: string; scenarioId: string; sampleId: string; baselineIds: string[];
  status: "illustrative" | "insufficient-evidence"; score: number | null; distance: number | null;
  probability: null; credentialEligible: false; demographicsUsed: false;
  sourceWordCount: number; baselineWordCount: number; windowWords: number; features: FeatureComparison[];
  flags: string[]; explanation: string; knownSource: string; limitations: string[];
}

const functionVocabulary = new Set("the a an and or but if of to in on at by for from with as is was were be been being it its that this these those which who not so than".split(" "));
export const publicWordCount = wordCount;
const round = (value: number) => Math.round(value * 1000) / 1000;

// This function deliberately accepts text only: no author labels, biography, or AI flag.
export function extractPublicFeatures(text: string): FeatureValues {
  const wordList = words(text);
  const lengths = sentenceLengths(text);
  const average = mean(lengths);
  const deviation = populationDeviation(lengths);
  const windowSize = Math.min(50, wordList.length);
  const lexicalWindows: number[] = [];
  for (let index = 0; index <= wordList.length - windowSize && windowSize > 0; index++) lexicalWindows.push(new Set(wordList.slice(index, index + windowSize)).size / windowSize);
  return {
    sentenceLength: average,
    sentenceRhythm: average ? deviation / average : 0,
    wordLength: mean(wordList.map(word => (word.match(/\p{L}/gu) || []).length)),
    functionWords: wordList.filter(word => functionVocabulary.has(word)).length / Math.max(wordList.length, 1) * 100,
    punctuation: (text.match(/[,;:—–]|--/g) || []).length / Math.max(wordList.length, 1) * 100,
    vocabulary: mean(lexicalWindows) * 100,
  };
}

// A transparent normalized-distance display, NOT an ML classifier or a posterior.
// All six dimensions have equal weight. Floors are fixed engineering choices, not fitted thresholds.
export function comparePublicTexts(baselineTexts: string[], sampleText: string) {
  const sourceWordCount = publicWordCount(sampleText);
  if (baselineTexts.length < 2 || sourceWordCount < minimumCandidateWords || baselineTexts.some(text => publicWordCount(text) < minimumCandidateWords)) {
    return { score: null, distance: null, features: [] as FeatureComparison[], windowWords: 0 };
  }
  const windowWords = Math.min(comparisonWindow, sourceWordCount, ...baselineTexts.map(publicWordCount));
  const reference = baselineTexts.map(text => extractPublicFeatures(textWindow(text, windowWords)));
  const sample = extractPublicFeatures(textWindow(sampleText, windowWords));
  const features = featureDefinitions.map(definition => {
    const values = reference.map(value => value[definition.key]);
    const center = mean(values);
    const variance = values.reduce((sum, value) => sum + (value - center) ** 2, 0) / Math.max(values.length - 1, 1);
    const scale = Math.sqrt(variance + definition.floor ** 2);
    const residual = Math.abs(sample[definition.key] - center) / scale;
    return { key: definition.key, label: definition.label, unit: definition.unit, baseline: round(center), sample: round(sample[definition.key]), residual: round(residual), scale: round(scale), detail: definition.detail };
  });
  const distance = mean(features.map(feature => feature.residual));
  return { score: Math.round(100 / (1 + distance)), distance: round(distance), features, windowWords };
}

export function comparePublicScenario(scenarioId = defaultScenarioId, baselineIds?: string[], collectionId = defaultCollectionId): DemoComparison {
  const collection = getCollection(collectionId);
  const scenario = collection.scenarios.find(item => item.id === scenarioId);
  if (!scenario) throw new Error("Unknown demo scenario.");
  const ids = baselineIds ?? collection.baselineIds;
  if (ids.length < 1 || ids.length > collection.baselineIds.length || new Set(ids).size !== ids.length || ids.some(id => !collection.baselineIds.includes(id))) throw new Error("Select one to three distinct reference excerpts.");
  const sample = getExcerpt(scenario.sampleId);
  const baseline = collection.baselineIds.filter(id => ids.includes(id)).map(getExcerpt);
  const result = comparePublicTexts(baseline.map(excerpt => excerpt.text), sample.text);
  const flags = [...scenario.contextFlags];
  if (baseline.length < 2) flags.push("SPARSE_BASELINE");
  const authorName = getAuthor(collection.authorId)?.name ?? "the baseline author";
  return {
    corpusVersion: publicCorpus.version, engineVersion: "observable-style-v1", collectionId: collection.id, scenarioId, sampleId: sample.id,
    baselineIds: baseline.map(excerpt => excerpt.id), status: result.score === null ? "insufficient-evidence" : "illustrative",
    ...result, probability: null, credentialEligible: false, demographicsUsed: false,
    sourceWordCount: sample.wordCount, baselineWordCount: baseline.reduce((sum, excerpt) => sum + excerpt.wordCount, 0), flags,
    explanation: result.score === null ? (sample.wordCount < minimumCandidateWords ? `This passage has ${sample.wordCount} words; the illustrative comparison needs at least ${minimumCandidateWords}. Knowing the published author does not create enough textual evidence.` : "At least two reference excerpts are needed to estimate even this simple range of variation. Restore a second source to compare.") : `A closer style index means these six observable features sit nearer this small reference set. It is not the probability that ${authorName} wrote the passage, and it does not determine whether AI was involved.`,
    knownSource: scenario.truth, limitations: publicCorpus.limits,
  };
}
