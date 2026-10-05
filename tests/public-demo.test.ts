import { test } from "node:test";
import assert from "node:assert/strict";
import { comparePublicScenario, comparePublicTexts, extractPublicFeatures, publicCorpus, minimumCandidateWords } from "../src/lib/public-demo";

const scores = Object.fromEntries(publicCorpus.scenarios.map(s => [s.id, comparePublicScenario(s.id).score]));

test("the fixture is deterministic and the pinned scores still hold", () => {
  // These numbers are part of the demo's story: a style index cannot separate Austen from Shelley.
  assert.deepEqual(scores, { "same-author": 64, "other-human": 69, "ai-fixture": 38, "too-short": null });
  assert.deepEqual(comparePublicScenario("same-author"), comparePublicScenario("same-author"));
});

test("the other-human control scores at least as close as the held-out Austen chapter", () => {
  assert.ok(scores["other-human"]! >= scores["same-author"]!, "if this flips after a fixture refresh, update the demo copy that explains it");
});

test("every result refuses to be a probability or a credential", () => {
  for (const scenario of publicCorpus.scenarios) {
    const result = comparePublicScenario(scenario.id);
    assert.equal(result.probability, null);
    assert.equal(result.credentialEligible, false);
    assert.equal(result.demographicsUsed, false);
    assert.equal(result.knownSource, scenario.truth);
  }
});

test("short candidates and single-reference baselines abstain", () => {
  const short = comparePublicScenario("too-short");
  assert.equal(short.score, null);
  assert.equal(short.status, "insufficient-evidence");
  assert.ok(short.flags.includes("SHORT_SAMPLE"));
  const sparse = comparePublicScenario("same-author", [publicCorpus.baselineIds[0]]);
  assert.equal(sparse.score, null);
  assert.ok(sparse.flags.includes("SPARSE_BASELINE"));
});

test("only allowlisted scenario and reference ids are accepted", () => {
  assert.throws(() => comparePublicScenario("made-up"));
  assert.throws(() => comparePublicScenario("same-author", ["austen-emma"]));
  assert.throws(() => comparePublicScenario("same-author", ["austen-sense", "austen-sense"]));
  assert.throws(() => comparePublicScenario("same-author", []));
});

test("changing the selected references changes the computation", () => {
  const all = comparePublicScenario("same-author");
  const two = comparePublicScenario("same-author", publicCorpus.baselineIds.slice(0, 2));
  assert.notDeepEqual(all.features, two.features);
  assert.equal(all.windowWords, 250);
});

test("the score follows the published formula", () => {
  const result = comparePublicScenario("ai-fixture");
  const distance = result.features.reduce((sum, f) => sum + f.residual, 0) / result.features.length;
  assert.equal(result.score, Math.round(100 / (1 + distance)));
});

test("feature extraction ignores labels and sees only text", () => {
  const text = "Mr. Darcy walked in. He said nothing; the room, however, noticed. Why? Nobody knew.";
  const features = extractPublicFeatures(text);
  assert.equal(features.sentenceLength, 14 / 4, "Mr. must not split a sentence");
  assert.ok(features.punctuation > 0);
  assert.equal(Object.keys(features).length, 6);
});

test("comparePublicTexts enforces the minimum candidate length", () => {
  const long = publicCorpus.excerpts.find(e => e.id === "austen-sense")!.text;
  const shortText = long.split(" ").slice(0, minimumCandidateWords - 1).join(" ");
  assert.equal(comparePublicTexts([long, long], shortText).score, null);
  assert.notEqual(comparePublicTexts([long, long], long).score, null);
});
