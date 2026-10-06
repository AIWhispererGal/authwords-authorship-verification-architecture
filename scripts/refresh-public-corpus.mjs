// Maintainer-only importer. The app never downloads upstream texts at runtime.
// Run: node scripts/refresh-public-corpus.mjs
// Review changes to the generated fixture, especially editions and excerpt boundaries.
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

// Each collection has one baseline author with three reference excerpts, a held-out
// same-author passage, an other-human control, a frozen AI-generated fixture, and a
// short fragment cut from the holdout. Openings must match the start of exactly one
// paragraph of the reflowed source text.
const collections = [
  {
    id: "austen", name: "The Austen collection", authorId: "jane-austen", controlAuthorId: "mary-shelley",
    kind: "A novelist", question: "Would this passage fit Jane Austen’s writing history?",
    baselineIntro: "Three different books. One published author. Choose which excerpts contribute.",
    baseline: [
      { id: "austen-sense", title: "Sense and Sensibility", year: 1811, edition: "English text, chapter 1", ebook: 161, paragraphs: 3, opening: "The family of Dashwood had long been settled in Sussex." },
      { id: "austen-pride", title: "Pride and Prejudice", year: 1813, edition: "English text, chapter I; text-only archive edition #42671, novel text only", ebook: 42671, paragraphs: 16, opening: "It is a truth universally acknowledged" },
      { id: "austen-mansfield", title: "Mansfield Park", year: 1814, edition: "English text, chapter 1", ebook: 141, paragraphs: 3, opening: "About thirty years ago Miss Maria Ward" },
    ],
    holdout: { id: "austen-emma", title: "Emma", year: 1815, edition: "English text, volume I, chapter I; first published December 1815, title page dated 1816", ebook: 158, paragraphs: 6, opening: "Emma Woodhouse, handsome, clever, and rich" },
    control: { id: "shelley-frankenstein", title: "Frankenstein", year: 1818, edition: "1818 edition, volume I, letter I", ebook: 41445, paragraphs: 3, opening: "You will rejoice to hear that no disaster has accompanied" },
    fragmentId: "austen-fragment", fragmentTitle: "Emma · opening sentence",
    synthetic: {
      id: "synthetic-social-scene", title: "An evening at the country house",
      generationPrompt: "Write about 250 words of original, modern English prose about a social gathering, first impressions, and courtship. Use neutral explanatory language. Do not quote an existing book or imitate a named author.",
      text: `The gathering at the country house offered a useful opportunity to observe the relationship between personal ambition and social expectation. Each guest arrived with a different objective, yet all understood the importance of making a favorable impression. The hostess welcomed everyone warmly and encouraged conversation among people who might not otherwise have met. In this setting, even an ordinary exchange could influence a future friendship or a possible marriage.

Clara initially believed that a person's manners provided a reliable guide to character. A confident introduction suggested intelligence, while a thoughtful compliment appeared to demonstrate kindness. As the evening continued, however, she noticed that these signals were not always consistent. One guest spoke generously about a neighbor but refused a small request for assistance. Another remained quiet throughout dinner and later helped the servants without drawing attention to himself.

These observations led Clara to reconsider her assumptions. Social success, she realized, did not necessarily reflect moral worth. The qualities that made someone appealing in a crowded room could differ from the qualities that sustained a lasting relationship. Rather than accepting the first explanation that came to mind, she began to ask what evidence supported it and what other interpretation might be possible.

By the end of the visit, Clara had not reached a final judgment about every person she had encountered. Instead, she had developed a more patient approach to understanding them. The experience illustrates a broader principle: thoughtful evaluation depends on context, repeated observation, and a willingness to revise an initial impression. In both friendship and courtship, certainty can be less valuable than careful attention.`,
    },
    scenarios: {
      sameAuthor: { title: "A new chapter, the same author", summary: "Emma is held out of Austen’s baseline. See how a new work compares.", truth: "Published attribution: Jane Austen" },
      otherHuman: { title: "Human writing, a different author", summary: "Mary Shelley is not Jane Austen. Different authorship is not the same as AI-generated.", truth: "Published attribution: Mary Shelley", flags: ["GENRE_AND_VOICE_SHIFT"] },
      aiFixture: { title: "A frozen, openly labeled AI sample", summary: "One original synthetic passage, not a proxy for every model or writing style." },
      tooShort: { title: "Sometimes the honest answer is less", summary: "Even a genuine Austen passage can be too short to support comparison.", truth: "Published attribution: Jane Austen; truncated holdout" },
    },
  },
  {
    id: "mill", name: "The Mill collection", authorId: "john-stuart-mill", controlAuthorId: "william-james",
    kind: "A philosopher", question: "Would this passage fit John Stuart Mill’s writing history?",
    baselineIntro: "Three essays across a decade. One philosopher. Choose which excerpts contribute.",
    baseline: [
      { id: "mill-liberty", title: "On Liberty", year: 1859, edition: "English text, chapter I", ebook: 34901, paragraphs: 2, opening: "The subject of this Essay is not the so-called Liberty of the Will" },
      { id: "mill-utilitarianism", title: "Utilitarianism", year: 1863, edition: "English text, chapter I", ebook: 11224, paragraphs: 2, opening: "There are few circumstances among those which make up the present condition of human knowledge" },
      { id: "mill-subjection", title: "The Subjection of Women", year: 1869, edition: "English text, chapter I", ebook: 27083, paragraphs: 2, opening: "The object of this Essay is to explain as clearly as I am able" },
    ],
    holdout: { id: "mill-autobiography", title: "Autobiography", year: 1873, edition: "English text, chapter I; published posthumously", ebook: 10378, paragraphs: 2, opening: "It seems proper that I should prefix to the following biographical sketch" },
    control: { id: "james-pragmatism", title: "Pragmatism", year: 1907, edition: "English text, lecture I", ebook: 5116, paragraphs: 5, opening: "In the preface to that admirable collection of essays" },
    fragmentId: "mill-fragment", fragmentTitle: "Autobiography · opening sentence",
    synthetic: {
      id: "synthetic-liberty-essay", title: "On the limits of persuasion",
      generationPrompt: "Write about 250 words of original, modern English prose arguing about individual liberty, public opinion, and the general welfare. Use neutral explanatory language. Do not quote an existing book or imitate a named author.",
      text: `Most people agree that a society should protect the freedom of its members, but they disagree about what that protection requires. One view holds that freedom is mainly a matter of law: as long as no statute forbids an action, the person who performs it is free. Another view argues that social pressure can restrict behavior as effectively as any law. A person who fears ridicule or exclusion may abandon a belief without ever being formally prohibited from holding it.

This second concern deserves careful attention. When a majority shares an opinion, it rarely needs to compel agreement. Disagreement simply becomes costly, and many individuals conclude that silence is the safer choice. The result is a community that appears unanimous while actually containing a wide range of private doubts. Such a community loses the benefit of open disagreement, which is the main way that errors are discovered and corrected.

It does not follow that every form of social influence is harmful. Praise, criticism, and example are ordinary parts of living together, and no one could reasonably demand to be free from them. The relevant question is whether a particular pressure aims to persuade or to punish. Persuasion offers reasons and leaves the decision with the listener. Punishment removes the decision by attaching penalties to one of the answers.

A useful test, then, is to ask what happens to the person who declines to be convinced. If the consequence is only continued disagreement, liberty remains intact. If the consequence is loss of standing, employment, or safety, the pressure has become coercion, whatever name it is given. Protecting the general welfare includes protecting the conditions under which people can change their minds freely.`,
    },
    scenarios: {
      sameAuthor: { title: "A later work, the same philosopher", summary: "The Autobiography is held out of Mill’s baseline. See how a memoir compares with his essays.", truth: "Published attribution: John Stuart Mill" },
      otherHuman: { title: "Human writing, a different philosopher", summary: "William James lectured a generation later and an ocean away. Different authorship is not the same as AI-generated.", truth: "Published attribution: William James", flags: ["GENRE_AND_VOICE_SHIFT"] },
      aiFixture: { title: "A frozen, openly labeled AI sample", summary: "One original synthetic essay on liberty, not a proxy for every model or writing style." },
      tooShort: { title: "Sometimes the honest answer is less", summary: "Even a genuine Mill sentence can be too short to support comparison.", truth: "Published attribution: John Stuart Mill; truncated holdout" },
    },
  },
  {
    id: "darwin", name: "The Darwin collection", authorId: "charles-darwin", controlAuthorId: "alfred-russel-wallace",
    kind: "A naturalist", question: "Would this passage fit Charles Darwin’s writing history?",
    baselineIntro: "Three books across three decades. One naturalist. Choose which excerpts contribute.",
    baseline: [
      { id: "darwin-beagle", title: "The Voyage of the Beagle", year: 1839, edition: "English text, chapter XIII (Chiloe)", ebook: 944, paragraphs: 2, opening: "This island is about ninety miles long" },
      { id: "darwin-origin", title: "On the Origin of Species", year: 1859, edition: "English text, introduction; first edition", ebook: 1228, paragraphs: 3, opening: "When on board H.M.S." },
      { id: "darwin-descent", title: "The Descent of Man", year: 1871, edition: "English text, introduction", ebook: 2300, paragraphs: 3, opening: "The nature of the following work will be best understood" },
    ],
    holdout: { id: "darwin-worms", title: "The Formation of Vegetable Mould", year: 1881, edition: "English text, chapter I (Habits of worms)", ebook: 2355, paragraphs: 2, opening: "EARTH-WORMS are distributed throughout the world" },
    control: { id: "wallace-malay", title: "The Malay Archipelago", year: 1869, edition: "English text, volume I, chapter I", ebook: 2530, paragraphs: 3, opening: "From a look at a globe or a map of the Eastern hemisphere" },
    fragmentId: "darwin-fragment", fragmentTitle: "Vegetable Mould · opening sentence",
    synthetic: {
      id: "synthetic-garden-notes", title: "Notes from a garden plot",
      generationPrompt: "Write about 250 words of original, modern English prose in which an amateur observer records variation among plants in a garden and reasons carefully about its causes. Use neutral explanatory language. Do not quote an existing book or imitate a named author.",
      text: `Over three summers I kept a record of the bean plants growing along the south wall of a small garden. The seeds came from the same packet each year, and the soil was prepared in the same way, yet the plants never looked alike. Some climbed quickly and produced few pods. Others stayed short and set pods early. A few showed leaves with a faint purple edge that none of their neighbors shared.

At first I assumed that the differences came entirely from position. Plants nearer the wall received more reflected heat, and plants at the ends of the row had less competition for light. Those factors clearly mattered, but they did not explain everything. When I moved seedlings between positions in the second year, several kept the habits they had shown before the move. The purple-edged leaves, in particular, appeared again in the same family of plants regardless of where they stood.

This suggested that part of the variation was inherited rather than caused by the surroundings. To test the idea, I saved seed only from the earliest podding plants and sowed it in the third year. The new generation set pods, on average, about a week sooner than the original packet. The change was small, and I cannot rule out a difference in the weather, but the direction was consistent with selection.

I do not claim that a garden plot settles any large question. It does show that careful records, repeated across seasons, can separate the effects of place from the effects of descent. The habit of writing down what one actually sees, rather than what one expects, is the most useful tool an observer has.`,
    },
    scenarios: {
      sameAuthor: { title: "A late work, the same naturalist", summary: "Darwin’s last book is held out of his baseline. See how it compares with three earlier ones.", truth: "Published attribution: Charles Darwin" },
      otherHuman: { title: "Human writing, a different naturalist", summary: "Alfred Russel Wallace reached natural selection independently. Different authorship is not the same as AI-generated.", truth: "Published attribution: Alfred Russel Wallace", flags: ["GENRE_AND_VOICE_SHIFT"] },
      aiFixture: { title: "A frozen, openly labeled AI sample", summary: "One original synthetic field note, not a proxy for every model or writing style." },
      tooShort: { title: "Sometimes the honest answer is less", summary: "Even a genuine Darwin sentence can be too short to support comparison.", truth: "Published attribution: Charles Darwin; truncated holdout" },
    },
  },
];

const authors = [
  { id: "jane-austen", name: "Jane Austen", role: "English novelist", lifespan: "1775–1817", birthYear: 1775, region: "Steventon, Hampshire, England", language: "English", biographyUrl: "https://www.bbc.co.uk/history/historic_figures/austen_jane.shtml", languageSourceUrl: "https://www.gutenberg.org/ebooks/author/68", description: "English novelist. The baseline uses three separate books published in 1811, 1813, and 1814; Emma is held out." },
  { id: "mary-shelley", name: "Mary Shelley", role: "English novelist", lifespan: "1797–1851", birthYear: 1797, region: "London, England", language: "English", biographyUrl: "https://poets.org/poet/mary-shelley", languageSourceUrl: "https://www.gutenberg.org/ebooks/41445", description: "English novelist. The 1818 edition of Frankenstein supplies a known other-author control with a different genre and narrative voice." },
  { id: "john-stuart-mill", name: "John Stuart Mill", role: "English philosopher", lifespan: "1806–1873", birthYear: 1806, region: "London, England", language: "English", biographyUrl: "https://plato.stanford.edu/entries/mill/", languageSourceUrl: "https://www.gutenberg.org/ebooks/34901", description: "English philosopher and political economist. The baseline uses three essays from 1859, 1863, and 1869; the posthumous Autobiography is held out." },
  { id: "william-james", name: "William James", role: "American philosopher", lifespan: "1842–1910", birthYear: 1842, region: "New York City, New York, United States", language: "English", biographyUrl: "https://plato.stanford.edu/entries/james/", languageSourceUrl: "https://www.gutenberg.org/ebooks/5116", description: "American philosopher and psychologist. The opening lecture of Pragmatism supplies a known other-author control from a later generation and a spoken register." },
  { id: "charles-darwin", name: "Charles Darwin", role: "English naturalist", lifespan: "1809–1882", birthYear: 1809, region: "Shrewsbury, Shropshire, England", language: "English", biographyUrl: "https://www.darwinproject.ac.uk/about-darwin", languageSourceUrl: "https://www.gutenberg.org/ebooks/1228", description: "English naturalist. The baseline uses three books from 1839, 1859, and 1871; his last book, on earthworms, is held out." },
  { id: "alfred-russel-wallace", name: "Alfred Russel Wallace", role: "British naturalist", lifespan: "1823–1913", birthYear: 1823, region: "Llanbadoc, Monmouthshire, Wales", language: "English", biographyUrl: "https://www.nhm.ac.uk/discover/alfred-russel-wallace.html", languageSourceUrl: "https://www.gutenberg.org/ebooks/2530", description: "British naturalist and co-discoverer of natural selection. The opening of The Malay Archipelago supplies a known other-author control in a travel register." },
].map(author => ({ ...author, regionMeaning: "Documented birthplace, not an inferred linguistic trait", languageMeaning: "Language of the source texts, not an assessment of native-language status", eslStatus: null, proficiency: null, educationLevel: null }));

const hash = text => createHash("sha256").update(text, "utf8").digest("hex");
const wordCount = text => (text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || []).length;
const editorial = /PROJECT GUTENBERG|Transcriber|\[Illustration|\[Footnote|\[\d+\]|\{\d+\}/i;
const rights = "Public domain in the USA; check local law elsewhere. Original English text, not a modern translation.";
const sourceNote = count => `Opening ${count} paragraphs of the specified section. Only whitespace reflowed; spelling, punctuation, and emphasis markers retained. No introductory/editorial material included.`;

const cache = new Map();
async function paragraphsOf(ebook) {
  if (cache.has(ebook)) return cache.get(ebook);
  const textUrl = `https://www.gutenberg.org/cache/epub/${ebook}/pg${ebook}.txt`;
  const response = await fetch(textUrl, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`#${ebook}: HTTP ${response.status}`);
  const raw = await response.text();
  // Reflow each paragraph so hard-wrapped lines never split an opening phrase.
  const paragraphs = raw.replace(/\r\n/g, "\n").split(/\n\s*\n/).map(p => p.replace(/\s+/g, " ").trim()).filter(Boolean);
  const entry = { textUrl, paragraphs, upstreamSha256: hash(raw) };
  cache.set(ebook, entry);
  return entry;
}

async function importExcerpt(definition, authorId, role) {
  const { textUrl, paragraphs, upstreamSha256 } = await paragraphsOf(definition.ebook);
  const starts = paragraphs.map((p, i) => p.startsWith(definition.opening) ? i : -1).filter(i => i >= 0);
  if (starts.length === 0) throw new Error(`Opening missing for ${definition.title}. Inspect the upstream edition rather than substituting text.`);
  if (starts.length > 1) throw new Error(`Ambiguous opening for ${definition.title}: ${starts.length} paragraphs start with it.`);
  const text = paragraphs.slice(starts[0], starts[0] + definition.paragraphs).join("\n\n");
  if (editorial.test(text)) throw new Error(`Editorial matter in ${definition.title}: review the excerpt.`);
  const { opening: _opening, paragraphs: paragraphCount, ...meta } = definition;
  console.log(`${definition.title}: ${wordCount(text)} words, ${paragraphCount} paragraphs, ${hash(text).slice(0, 12)}`);
  return { ...meta, authorId, role, sourceUrl: `https://www.gutenberg.org/ebooks/${definition.ebook}`, originalTextUrl: textUrl, sourceNote: sourceNote(paragraphCount), rights, text, wordCount: wordCount(text), sha256: hash(text), upstreamSha256 };
}

// Leading sentences of the holdout until at least 40 words: a genuine passage that is
// still far below the comparison minimum.
function fragmentOf(holdout, id, title) {
  const sentences = holdout.text.split("\n\n")[0].match(/[^.!?]+[.!?]+["’”]?/g) || [holdout.text];
  let fragment = "";
  for (const sentence of sentences) { fragment += sentence; if (wordCount(fragment) >= 40) break; }
  fragment = fragment.trim();
  return { ...holdout, id, title, role: "short", sourceNote: `Opening sentence(s) of the ${holdout.title} holdout. Intentional overlap between two test cases; neither enters the baseline.`, text: fragment, wordCount: wordCount(fragment), sha256: hash(fragment), derivedFrom: holdout.id };
}

function syntheticOf(definition, collectionId) {
  const text = definition.text;
  return { id: definition.id, authorId: "synthetic-ai", title: definition.title, year: null, edition: "Frozen AI-generated fixture v1", ebook: null, role: "synthetic", collectionId,
    sourceUrl: null, originalTextUrl: null, sourceNote: "Generated by the implementation assistant for this demo. The exact model identifier is not available. No runtime inference service is called.",
    rights: "New synthetic text supplied with this demo; not a historical public-domain source or an archived human sample.",
    generationPrompt: definition.generationPrompt, generator: { kind: "AI", name: "Implementation assistant", model: null, seed: null, reproducibility: "Frozen output and SHA-256 hash, not reproducible model sampling." },
    text, wordCount: wordCount(text), sha256: hash(text), upstreamSha256: null };
}

const excerpts = [];
const manifest = [];
for (const collection of collections) {
  const baseline = [];
  for (const definition of collection.baseline) baseline.push(await importExcerpt(definition, collection.authorId, "baseline"));
  const holdout = await importExcerpt(collection.holdout, collection.authorId, "holdout");
  const control = await importExcerpt(collection.control, collection.controlAuthorId, "other-human");
  const synthetic = syntheticOf(collection.synthetic, collection.id);
  const fragment = fragmentOf(holdout, collection.fragmentId, collection.fragmentTitle);
  for (const item of [...baseline, holdout, control, fragment]) excerpts.push({ ...item, collectionId: collection.id });
  excerpts.push(synthetic);
  const s = collection.scenarios;
  manifest.push({
    id: collection.id, name: collection.name, kind: collection.kind, question: collection.question, authorId: collection.authorId, controlAuthorId: collection.controlAuthorId,
    baselineIntro: collection.baselineIntro, baselineIds: baseline.map(item => item.id),
    scenarios: [
      { id: "same-author", sampleId: holdout.id, label: "Same author", title: s.sameAuthor.title, summary: s.sameAuthor.summary, truth: s.sameAuthor.truth, contextFlags: ["SMALL_REFERENCE_SET", ...(s.sameAuthor.flags || [])] },
      { id: "other-human", sampleId: control.id, label: "Other human", title: s.otherHuman.title, summary: s.otherHuman.summary, truth: s.otherHuman.truth, contextFlags: ["SMALL_REFERENCE_SET", ...(s.otherHuman.flags || [])] },
      { id: "ai-fixture", sampleId: synthetic.id, label: "AI fixture", title: s.aiFixture.title, summary: s.aiFixture.summary, truth: "Known AI-generated fixture; model identifier unavailable", contextFlags: ["SMALL_REFERENCE_SET", "MODERN_LANGUAGE_SHIFT", "SINGLE_SYNTHETIC_EXAMPLE"] },
      { id: "too-short", sampleId: fragment.id, label: "Too short", title: s.tooShort.title, summary: s.tooShort.summary, truth: s.tooShort.truth, contextFlags: ["SHORT_SAMPLE", "SMALL_REFERENCE_SET"] },
    ],
  });
}

const fixture = {
  version: "public-v2", name: "The public collections", importedAt: new Date().toISOString(),
  purpose: "Small, reproducible product evaluation. Not an authorship benchmark, a student dataset, or fairness validation.",
  processing: "Public literary excerpts are intentionally bundled as readable text. This public-only fixture does not authorize storing or exporting private student text.",
  rightsScope: "The historical source works are listed as public domain in the USA. Check local law before reuse elsewhere. No universal copyright clearance is claimed.",
  acknowledgement: "Source reference: Project Gutenberg. References are attribution, not branding, sponsorship, or endorsement. Headers, license boilerplate, and editorial content are not part of the excerpt texts.",
  sourcePolicyUrl: "https://www.gutenberg.org/policy/license.html",
  limits: [
    "Six historical English-language authors in three pairs; not a representative demographic sample.",
    "Three baseline passages from three books cannot estimate a calibrated posterior or prove authorship.",
    "Each other-human control changes genre or register as well as author; this is a confound, not a clean accuracy benchmark.",
    "Historical publication years are not a measured student learning trajectory.",
    "A language model may have encountered these public books during training; this is not a contamination-free AI benchmark.",
    "One synthetic output per collection cannot establish AI-detection accuracy. Similarity can be high for another author or low for the same author.",
  ],
  authors, defaultCollectionId: "austen", collections: manifest, excerpts,
};
await mkdir("src/data/public-demo", { recursive: true });
await writeFile("src/data/public-demo/corpus.json", JSON.stringify(fixture, null, 2) + "\n");
console.log(`Wrote ${excerpts.length} excerpts in ${manifest.length} collections to src/data/public-demo/corpus.json`);
