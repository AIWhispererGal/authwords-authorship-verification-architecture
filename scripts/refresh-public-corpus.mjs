// Maintainer-only importer. The app never downloads upstream texts at runtime.
// Run: node scripts/refresh-public-corpus.mjs
// Review changes to the generated fixture, especially editions and excerpt boundaries.
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const definitions = [
  { id: "austen-sense", authorId: "jane-austen", title: "Sense and Sensibility", year: 1811, edition: "English text, chapter 1", ebook: 161, role: "baseline", paragraphs: 3, opening: "The family of Dashwood had long been settled in Sussex." },
  { id: "austen-pride", authorId: "jane-austen", title: "Pride and Prejudice", year: 1813, edition: "English text, chapter I; text-only archive edition #42671, novel text only", ebook: 42671, role: "baseline", paragraphs: 16, opening: "It is a truth universally acknowledged" },
  { id: "austen-mansfield", authorId: "jane-austen", title: "Mansfield Park", year: 1814, edition: "English text, chapter 1", ebook: 141, role: "baseline", paragraphs: 3, opening: "About thirty years ago Miss Maria Ward" },
  { id: "austen-emma", authorId: "jane-austen", title: "Emma", year: 1815, edition: "English text, volume I, chapter I; first published December 1815, title page dated 1816", ebook: 158, role: "holdout", paragraphs: 6, opening: "Emma Woodhouse, handsome, clever, and rich" },
  { id: "shelley-frankenstein", authorId: "mary-shelley", title: "Frankenstein", year: 1818, edition: "1818 edition, volume I, letter I", ebook: 41445, role: "other-human", paragraphs: 3, opening: "You will rejoice to hear that no disaster has accompanied" },
];
const hash = text => createHash("sha256").update(text, "utf8").digest("hex");
const normalize = text => text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
const wordCount = text => (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || []).length;
const excerpts = [];
for (const definition of definitions) {
  const textUrl = `https://www.gutenberg.org/cache/epub/${definition.ebook}/pg${definition.ebook}.txt`;
  const response = await fetch(textUrl, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${definition.title}: HTTP ${response.status}`);
  const raw = await response.text();
  const normal = normalize(raw);
  const start = normal.indexOf(definition.opening);
  if (start < 0) throw new Error(`Opening missing for ${definition.title}. Inspect the upstream edition rather than substituting text.`);
  if (normal.indexOf(definition.opening, start + definition.opening.length) >= 0) throw new Error(`Ambiguous opening for ${definition.title}`);
  const paragraphs = normal.slice(start).split(/\n\s*\n/).slice(0, definition.paragraphs).map(p => p.replace(/\s+/g, " ").trim());
  const text = paragraphs.join("\n\n");
  if (/PROJECT GUTENBERG|Transcriber|\[Illustration/i.test(text)) throw new Error(`Editorial matter in ${definition.title}: review the excerpt.`);
  const { opening: _opening, paragraphs: paragraphCount, ...meta } = definition;
  excerpts.push({ ...meta, sourceUrl: `https://www.gutenberg.org/ebooks/${definition.ebook}`, originalTextUrl: textUrl,
    sourceNote: `Opening ${paragraphCount} paragraphs of the specified section. Only whitespace reflowed; spelling, punctuation, and emphasis markers retained. No introductory/editorial material included.`,
    rights: "Public domain in the USA; check local law elsewhere. Original English text, not a modern translation.",
    text, wordCount: wordCount(text), sha256: hash(text), upstreamSha256: hash(raw),
  });
  console.log(`${definition.title}: ${wordCount(text)} words, ${paragraphCount} paragraphs, ${hash(text).slice(0, 12)}`);
}

// Original model-generated negative fixture, frozen here rather than generated at runtime.
// Deliberately not falsely attributed to an archive, a human author, or a named model.
const syntheticText = `The gathering at the country house offered a useful opportunity to observe the relationship between personal ambition and social expectation. Each guest arrived with a different objective, yet all understood the importance of making a favorable impression. The hostess welcomed everyone warmly and encouraged conversation among people who might not otherwise have met. In this setting, even an ordinary exchange could influence a future friendship or a possible marriage.

Clara initially believed that a person's manners provided a reliable guide to character. A confident introduction suggested intelligence, while a thoughtful compliment appeared to demonstrate kindness. As the evening continued, however, she noticed that these signals were not always consistent. One guest spoke generously about a neighbor but refused a small request for assistance. Another remained quiet throughout dinner and later helped the servants without drawing attention to himself.

These observations led Clara to reconsider her assumptions. Social success, she realized, did not necessarily reflect moral worth. The qualities that made someone appealing in a crowded room could differ from the qualities that sustained a lasting relationship. Rather than accepting the first explanation that came to mind, she began to ask what evidence supported it and what other interpretation might be possible.

By the end of the visit, Clara had not reached a final judgment about every person she had encountered. Instead, she had developed a more patient approach to understanding them. The experience illustrates a broader principle: thoughtful evaluation depends on context, repeated observation, and a willingness to revise an initial impression. In both friendship and courtship, certainty can be less valuable than careful attention.`;
excerpts.push({ id: "synthetic-social-scene", authorId: "synthetic-ai", title: "An evening at the country house", year: null, edition: "Frozen AI-generated fixture v1", ebook: null, role: "synthetic",
  sourceUrl: null, originalTextUrl: null, sourceNote: "Generated by the implementation assistant for this demo. The exact model identifier is not available. No runtime inference service is called.",
  rights: "New synthetic text supplied with this demo; not a historical public-domain source or an archived human sample.",
  generationPrompt: "Write about 250 words of original, modern English prose about a social gathering, first impressions, and courtship. Use neutral explanatory language. Do not quote an existing book or imitate a named author.",
  generator: { kind: "AI", name: "Implementation assistant", model: null, seed: null, reproducibility: "Frozen output and SHA-256 hash, not reproducible model sampling." },
  text: syntheticText, wordCount: wordCount(syntheticText), sha256: hash(syntheticText), upstreamSha256: null,
});
const emma = excerpts.find(e => e.id === "austen-emma");
const fragment = emma.text.split("\n\n")[0];
excerpts.push({ ...emma, id: "austen-fragment", title: "Emma · opening sentence", role: "short", sourceNote: "First paragraph of the Emma holdout. Intentional overlap between two test cases; neither enters the baseline.", text: fragment, wordCount: wordCount(fragment), sha256: hash(fragment), derivedFrom: emma.id });

const fixture = {
  version: "austen-public-v1", name: "The Austen collection", importedAt: new Date().toISOString(),
  purpose: "Small, reproducible product evaluation. Not an authorship benchmark, a student dataset, or fairness validation.",
  processing: "Public literary excerpts are intentionally bundled as readable text. This public-only fixture does not authorize storing or exporting private student text.",
  rightsScope: "The five historical source works are listed as public domain in the USA. Check local law before reuse elsewhere. No universal copyright clearance is claimed.",
  acknowledgement: "Source reference: Project Gutenberg. References are attribution, not branding, sponsorship, or endorsement. Headers, license boilerplate, and editorial content are not part of the excerpt texts.",
  sourcePolicyUrl: "https://www.gutenberg.org/policy/license.html",
  limits: ["Only two historical English-language authors; not a representative demographic sample.", "Three baseline passages from three books cannot estimate a calibrated posterior or prove authorship.", "The Shelley comparison changes genre and narrative voice; this is a confound, not a clean accuracy benchmark.", "Historical publication years are not a measured student learning trajectory.", "A language model may have encountered these public books during training; this is not a contamination-free AI benchmark.", "One synthetic output cannot establish AI-detection accuracy. Similarity can be high for another author or low for the same author."],
  authors: [
    { id: "jane-austen", name: "Jane Austen", lifespan: "1775–1817", birthYear: 1775, region: "Steventon, Hampshire, England", regionMeaning: "Documented birthplace, not an inferred linguistic trait", language: "English", languageMeaning: "Language of the source texts, not an assessment of native-language status", eslStatus: null, proficiency: null, educationLevel: null, biographyUrl: "https://www.bbc.co.uk/history/historic_figures/austen_jane.shtml", languageSourceUrl: "https://www.gutenberg.org/ebooks/author/68", description: "English novelist. The baseline uses three separate books published in 1811, 1813, and 1814; Emma is held out." },
    { id: "mary-shelley", name: "Mary Shelley", lifespan: "1797–1851", birthYear: 1797, region: "London, England", regionMeaning: "Documented birthplace, not an inferred linguistic trait", language: "English", languageMeaning: "Language of the source text, not an assessment of native-language status", eslStatus: null, proficiency: null, educationLevel: null, biographyUrl: "https://poets.org/poet/mary-shelley", languageSourceUrl: "https://www.gutenberg.org/ebooks/41445", description: "English novelist. The 1818 edition of Frankenstein supplies a known other-author control with a different genre and narrative voice." },
  ],
  baselineIds: definitions.filter(d => d.role === "baseline").map(d => d.id),
  scenarios: [
    { id: "same-author", sampleId: "austen-emma", label: "Same author", title: "A new chapter, the same author", summary: "Emma is held out of Austen’s baseline. See how a new work compares.", truth: "Published attribution: Jane Austen", contextFlags: ["SMALL_REFERENCE_SET"] },
    { id: "other-human", sampleId: "shelley-frankenstein", label: "Other human", title: "Human writing, a different author", summary: "Mary Shelley is not Jane Austen. Different authorship is not the same as AI-generated.", truth: "Published attribution: Mary Shelley", contextFlags: ["SMALL_REFERENCE_SET", "GENRE_AND_VOICE_SHIFT"] },
    { id: "ai-fixture", sampleId: "synthetic-social-scene", label: "AI fixture", title: "A frozen, openly labeled AI sample", summary: "One original synthetic passage, not a proxy for every model or writing style.", truth: "Known AI-generated fixture; model identifier unavailable", contextFlags: ["SMALL_REFERENCE_SET", "MODERN_LANGUAGE_SHIFT", "SINGLE_SYNTHETIC_EXAMPLE"] },
    { id: "too-short", sampleId: "austen-fragment", label: "Too short", title: "Sometimes the honest answer is less", summary: "Even a genuine Austen passage can be too short to support comparison.", truth: "Published attribution: Jane Austen; truncated holdout", contextFlags: ["SHORT_SAMPLE", "SMALL_REFERENCE_SET"] },
  ],
  excerpts,
};
await mkdir("src/data/public-demo", { recursive: true });
await writeFile("src/data/public-demo/corpus.json", JSON.stringify(fixture, null, 2) + "\n");
console.log(`Wrote ${excerpts.length} excerpts to src/data/public-demo/corpus.json`);
