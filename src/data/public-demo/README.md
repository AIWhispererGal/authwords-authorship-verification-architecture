# The Austen public-demo corpus

This is a small, version-controlled evaluation fixture, not training data or a validated authorship benchmark. It is available without authentication at `/demo`; `/api/demo/corpus` exports the complete JSON manifest. Normal application execution never contacts an upstream archive or a model provider.

## Contents and split

| ID | Attributed source | Published | Role |
| --- | --- | --- | --- |
| `austen-sense` | Jane Austen, *Sense and Sensibility*, chapter 1 | 1811 | Reference |
| `austen-pride` | Jane Austen, *Pride and Prejudice*, chapter I | 1813 | Reference |
| `austen-mansfield` | Jane Austen, *Mansfield Park*, chapter 1 | 1814 | Reference |
| `austen-emma` | Jane Austen, *Emma*, volume I, chapter I | Dec. 1815; title page 1816 | Held-out same-author case |
| `shelley-frankenstein` | Mary Shelley, *Frankenstein*, 1818 edition, letter I | 1818 | Other-human control |
| `synthetic-social-scene` | Original implementation-assistant output | Not a historical publication | Labeled synthetic control |
| `austen-fragment` | First paragraph of the *Emma* holdout | Same source as holdout | Short-sample abstention |

Published attribution is a documented source label, **not** a stylometric finding, supervised identity attestation, or assurance of exclusive individual composition. The Emma fragment intentionally overlaps the Emma test case; neither is allowed in the reference set. No duplicate reference IDs are accepted. The synthetic output is frozen, not randomly regenerated on each visit. Its prompt, generator provenance, unavailable exact model/seed, and hash are included in the manifest.

## Rights and provenance

References (not source branding or endorsement):

- [Sense and Sensibility — Project Gutenberg #161](https://www.gutenberg.org/ebooks/161)
- [Pride and Prejudice — #42671](https://www.gutenberg.org/ebooks/42671)
- [Mansfield Park — #141](https://www.gutenberg.org/ebooks/141)
- [Emma — #158](https://www.gutenberg.org/ebooks/158)
- [Frankenstein, 1818 edition — #41445](https://www.gutenberg.org/ebooks/41445)
- [Archive license/reuse policy](https://www.gutenberg.org/policy/license.html)
- [Jane Austen biography — BBC History](https://www.bbc.co.uk/history/historic_figures/austen_jane.shtml)
- [Mary Shelley biography — Academy of American Poets](https://poets.org/poet/mary-shelley)

The historical source works are cataloged as public domain in the United States. Check local law elsewhere; do not represent this as universal copyright clearance. These are excerpts of English literary text, not modern translations, introductions, artwork, or new editorial commentary. The importer uses a clean text-only Pride and Prejudice source rather than the illustrated #1342 edition. It strips archive wrappers by explicitly locating a novel-body opening and rejects unexpected editorial/caption content. Whitespace is reflowed; source spelling, punctuation, and emphasis markers are preserved. Source and transformed-excerpt hashes are both stored. References to the archive are acknowledgements, not product branding or endorsement.

Do not automatically add Asimov or a modern translation of Frege just because the author is familiar. Rights must be checked for the particular work, edition, translation, and intended jurisdiction.

## Context and demographics

Documented metadata includes source-text language, birthplace, birth year/lifespan, genre/edition, and publication year. Birthplace is **not** a native-language label. ESL status, language proficiency, and student education level are null, not inferred. No ethnicity, nationality-based prior, gender inference, or sensitive-trait scoring is implemented.

The UI lets visitors inspect Austen or Shelley context, but no context value is passed into the numerical comparison. This prevents a plausible-looking historical biography from masquerading as a validated demographic model. Two historical English-language novelists are not a representative cohort and cannot substantiate modern student, ESL, or demographic-fairness claims. Publication order alone is not a measured four-year learning trajectory.

## Reproducibility and method

The runtime uses `src/lib/public-demo.ts`. Source labels, scenario labels, dates, and biography are not inputs to `comparePublicTexts`; that function accepts only reference strings and a candidate string.

1. Require at least two references and 120 candidate words; otherwise abstain. These are demo engineering guards, not validated scientific sufficiency thresholds.
2. Use equal leading windows of up to 250 words across selected references and candidate. These may end in a partial sentence; this limitation is part of the simple extraction, not a syntactic parser.
3. Calculate six features: mean sentence length, sentence-length coefficient of variation, mean word length, fixed function-word frequency, punctuation frequency, and moving-average 50-word type/token ratio.
4. For each dimension, compute absolute candidate distance from the reference mean, divided by `sqrt(sample_variance + fixed_floor^2)`.
5. Give dimensions equal weight and display `round(100 / (1 + mean_distance))` as an **observable style index**, never a probability or AI verdict.

The six feature values, normalization scales, fixed floors, formula, corpus version, engine version, and source hashes are available in result exports. Outputs explicitly include `probability: null`, `credentialEligible: false`, and `demographicsUsed: false`. Ground-truth labels and contextual flags are separate from the numerical result. No threshold proves identity or triggers a credential.

Longer excerpts remain in the fixture for source inspection, while the matched-window calculation reduces length imbalance. Modern synthetic diction, dialogue mix, genre, editorial differences, and small sample size remain confounds. Public books may also be present in language-model training corpora; this is not a contamination-free AI benchmark. Do not choose or tune fixtures to manufacture a preferred score ranking.

## Refreshing deliberately

Run `node scripts/refresh-public-corpus.mjs` only as a maintainer. This retrieves the listed texts, verifies unique opening anchors and excludes known editorial material, writes the small fixture, records import time, and calculates SHA-256 hashes. It is **not** part of startup or a background sync. Review the diff; upstream punctuation/edition changes can affect toy metrics. Bump the corpus version for a reviewed content change and engine version for a method change. Keep previous test reports clearly versioned.

Run `node scripts/public-demo-smoke.mjs` with the application running. The tests verify fixture hashes and roles, source-only API allowlists, deterministic outputs, abstention, actual server recomputation, no auth cookies, no runtime third-party requests, deep links, source dialogs, exports, context noninterference, and mobile layout.

## Privacy boundary

This fixture intentionally contains readable **public** literature. That exception does not authorize raw student-data storage or egress. The public demo does not create workspaces, query the database, accept text uploads, ask for real demographic data, or write user records. The separate student workspace and institutional production design retain their existing boundaries.
