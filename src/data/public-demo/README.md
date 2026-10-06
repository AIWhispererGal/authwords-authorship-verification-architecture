# The public collections

This is a small, version-controlled evaluation fixture, not training data or a validated authorship benchmark. It is available without authentication at `/demo`; `/api/demo/corpus` exports the complete JSON manifest. Normal application execution never contacts an upstream archive or a model provider.

## Collections and splits

Each collection pairs one baseline author with a real other-author control. Three reference excerpts form the baseline; a fourth work by the same author is held out; a labeled synthetic passage and a short fragment of the holdout complete the four scenarios.

### The Austen collection (a novelist)

| ID | Attributed source | Published | Role |
| --- | --- | --- | --- |
| `austen-sense` | Jane Austen, *Sense and Sensibility*, chapter 1 | 1811 | Reference |
| `austen-pride` | Jane Austen, *Pride and Prejudice*, chapter I | 1813 | Reference |
| `austen-mansfield` | Jane Austen, *Mansfield Park*, chapter 1 | 1814 | Reference |
| `austen-emma` | Jane Austen, *Emma*, volume I, chapter I | Dec. 1815; title page 1816 | Held-out same-author case |
| `shelley-frankenstein` | Mary Shelley, *Frankenstein*, 1818 edition, letter I | 1818 | Other-human control |
| `synthetic-social-scene` | Original implementation-assistant output | Not a historical publication | Labeled synthetic control |
| `austen-fragment` | First sentence of the *Emma* holdout | Same source as holdout | Short-sample abstention |

### The Mill collection (a philosopher)

| ID | Attributed source | Published | Role |
| --- | --- | --- | --- |
| `mill-liberty` | John Stuart Mill, *On Liberty*, chapter I | 1859 | Reference |
| `mill-utilitarianism` | John Stuart Mill, *Utilitarianism*, chapter I | 1863 | Reference |
| `mill-subjection` | John Stuart Mill, *The Subjection of Women*, chapter I | 1869 | Reference |
| `mill-autobiography` | John Stuart Mill, *Autobiography*, chapter I | 1873, posthumous | Held-out same-author case |
| `james-pragmatism` | William James, *Pragmatism*, lecture I | 1907 | Other-human control |
| `synthetic-liberty-essay` | Original implementation-assistant output | Not a historical publication | Labeled synthetic control |
| `mill-fragment` | First sentence of the *Autobiography* holdout | Same source as holdout | Short-sample abstention |

### The Darwin collection (a naturalist)

| ID | Attributed source | Published | Role |
| --- | --- | --- | --- |
| `darwin-beagle` | Charles Darwin, *The Voyage of the Beagle*, chapter XIII | 1839 | Reference |
| `darwin-origin` | Charles Darwin, *On the Origin of Species*, introduction, first edition | 1859 | Reference |
| `darwin-descent` | Charles Darwin, *The Descent of Man*, introduction | 1871 | Reference |
| `darwin-worms` | Charles Darwin, *The Formation of Vegetable Mould*, chapter I | 1881 | Held-out same-author case |
| `wallace-malay` | Alfred Russel Wallace, *The Malay Archipelago*, volume I, chapter I | 1869 | Other-human control |
| `synthetic-garden-notes` | Original implementation-assistant output | Not a historical publication | Labeled synthetic control |
| `darwin-fragment` | First sentence of the *Vegetable Mould* holdout | Same source as holdout | Short-sample abstention |

Published attribution is a documented source label, **not** a stylometric finding, supervised identity attestation, or assurance of exclusive individual composition. Each fragment intentionally overlaps its holdout; neither is allowed in the reference set. No duplicate reference IDs are accepted, and a reference from one collection is rejected by another. The synthetic outputs are frozen, not randomly regenerated on each visit. Their prompts, generator provenance, unavailable exact model/seed, and hashes are included in the manifest.

## Rights and provenance

References (not source branding or endorsement):

- [Sense and Sensibility — Project Gutenberg #161](https://www.gutenberg.org/ebooks/161), [Pride and Prejudice — #42671](https://www.gutenberg.org/ebooks/42671), [Mansfield Park — #141](https://www.gutenberg.org/ebooks/141), [Emma — #158](https://www.gutenberg.org/ebooks/158), [Frankenstein, 1818 edition — #41445](https://www.gutenberg.org/ebooks/41445)
- [On Liberty — #34901](https://www.gutenberg.org/ebooks/34901), [Utilitarianism — #11224](https://www.gutenberg.org/ebooks/11224), [The Subjection of Women — #27083](https://www.gutenberg.org/ebooks/27083), [Autobiography — #10378](https://www.gutenberg.org/ebooks/10378), [Pragmatism — #5116](https://www.gutenberg.org/ebooks/5116)
- [The Voyage of the Beagle — #944](https://www.gutenberg.org/ebooks/944), [On the Origin of Species — #1228](https://www.gutenberg.org/ebooks/1228), [The Descent of Man — #2300](https://www.gutenberg.org/ebooks/2300), [The Formation of Vegetable Mould — #2355](https://www.gutenberg.org/ebooks/2355), [The Malay Archipelago — #2530](https://www.gutenberg.org/ebooks/2530)
- [Archive license/reuse policy](https://www.gutenberg.org/policy/license.html)
- Biographies: [Jane Austen — BBC History](https://www.bbc.co.uk/history/historic_figures/austen_jane.shtml), [Mary Shelley — Academy of American Poets](https://poets.org/poet/mary-shelley), [John Stuart Mill — Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/entries/mill/), [William James — Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/entries/james/), [Charles Darwin — Darwin Correspondence Project](https://www.darwinproject.ac.uk/about-darwin), [Alfred Russel Wallace — Natural History Museum](https://www.nhm.ac.uk/discover/alfred-russel-wallace.html)

The historical source works are cataloged as public domain in the United States. Check local law elsewhere; do not represent this as universal copyright clearance. These are excerpts of English literary, philosophical, and scientific text, not modern translations, introductions, artwork, or new editorial commentary. The importer reflows each paragraph, locates a unique paragraph that starts with the documented opening, and rejects archive headers, transcriber notes, illustrations, and footnote markers. Whitespace is reflowed; source spelling, punctuation, and emphasis markers are preserved. Source and transformed-excerpt hashes are both stored. References to the archive are acknowledgements, not product branding or endorsement.

Do not automatically add a modern author or a translation just because the name is familiar. Rights must be checked for the particular work, edition, translation, and intended jurisdiction.

## Context and demographics

Documented metadata includes source-text language, birthplace, birth year/lifespan, genre/edition, and publication year. Birthplace is **not** a native-language label. ESL status, language proficiency, and student education level are null, not inferred. No ethnicity, nationality-based prior, gender inference, or sensitive-trait scoring is implemented.

The UI lets visitors inspect each collection's two authors, but no context value is passed into the numerical comparison. Six historical English-language authors are not a representative cohort and cannot substantiate modern student, ESL, or demographic-fairness claims. Publication order alone is not a measured learning trajectory.

## Reproducibility and method

The runtime uses `src/lib/public-demo.ts`. Source labels, scenario labels, dates, and biography are not inputs to `comparePublicTexts`; that function accepts only reference strings and a candidate string.

1. Require at least two references and 120 candidate words; otherwise abstain. These are demo engineering guards, not validated scientific sufficiency thresholds.
2. Use equal leading windows of up to 250 words across selected references and candidate. These may end in a partial sentence; this limitation is part of the simple extraction, not a syntactic parser.
3. Calculate six features: mean sentence length, sentence-length coefficient of variation, mean word length, fixed function-word frequency, punctuation frequency, and moving-average 50-word type/token ratio.
4. For each dimension, compute absolute candidate distance from the reference mean, divided by `sqrt(sample_variance + fixed_floor^2)`.
5. Give dimensions equal weight and display `round(100 / (1 + mean_distance))` as an **observable style index**, never a probability or AI verdict.

With the default references the index places Shelley at least as close to Austen as Austen's own holdout, places Wallace closer to Darwin than Darwin's own last book, and gives Mill's memoir a small edge over William James. Unit tests in `tests/public-demo.test.ts` pin all three outcomes so a refresh cannot change the story silently. Outputs explicitly include `probability: null`, `credentialEligible: false`, and `demographicsUsed: false`. Ground-truth labels and contextual flags are separate from the numerical result. No threshold proves identity or triggers a credential.

## Refreshing deliberately

Run `node scripts/refresh-public-corpus.mjs` only as a maintainer. This retrieves the listed texts, verifies unique opening paragraphs, excludes known editorial material, writes the fixture, records import time, and calculates SHA-256 hashes. It is **not** part of startup or a background sync. Review the diff; upstream punctuation/edition changes can affect toy metrics. Bump the corpus version for a reviewed content change and engine version for a method change. Keep previous test reports clearly versioned.

Run `node scripts/public-demo-smoke.mjs` with the application running. The tests verify fixture hashes and roles, source-only API allowlists, deterministic outputs per collection, abstention, actual server recomputation, no auth cookies, no runtime third-party requests, deep links, collection switching, source dialogs, exports, context noninterference, and mobile layout.

## Privacy boundary

This fixture intentionally contains readable **public** literature. That exception does not authorize raw student-data storage or egress. The public demo does not create workspaces, query the database, accept text uploads, ask for real demographic data, or write user records. The separate student workspace and institutional production design retain their existing boundaries.
