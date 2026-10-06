import { test } from "node:test";
import assert from "node:assert/strict";
import { comparePublicScenario, comparePublicTexts, extractPublicFeatures, getCollection, getExcerpt, publicCorpus, minimumCandidateWords } from "../src/lib/public-demo";

const scoresFor = (collectionId: string) => Object.fromEntries(getCollection(collectionId).scenarios.map(s => [s.id, comparePublicScenario(s.id, undefined, collectionId).score]));

test("the fixture is deterministic and the pinned scores still hold for every collection", () => {
  // These numbers are part of the demo's story. The copy reads them live, but a fixture refresh
  // must not change them silently: bump the corpus version and update these on purpose.
  assert.deepEqual(scoresFor("austen"), { "same-author": 64, "other-human": 69, "ai-fixture": 38, "too-short": null });
  assert.deepEqual(scoresFor("mill"), { "same-author": 61, "other-human": 53, "ai-fixture": 47, "too-short": null });
  assert.deepEqual(scoresFor("darwin"), { "same-author": 60, "other-human": 64, "ai-fixture": 54, "too-short": null });
  assert.deepEqual(comparePublicScenario("same-author"), comparePublicScenario("same-author"));
  assert.equal(comparePublicScenario("same-author").collectionId, publicCorpus.defaultCollectionId);
});

test("the style index gets two of three collections wrong, which the demo copy depends on", () => {
  const austen = scoresFor("austen"), darwin = scoresFor("darwin"), mill = scoresFor("mill");
  assert.ok(austen["other-human"]! >= austen["same-author"]!, "Shelley should score at least as close as Emma");
  assert.ok(darwin["other-human"]! >= darwin["same-author"]!, "Wallace should score at least as close as Darwin's holdout");
  assert.ok(mill["same-author"]! > mill["other-human"]!, "Mill's memoir should edge out James");
});

test("every collection is internally consistent", () => {
  assert.equal(publicCorpus.collections.length, 3);
  for (const collection of publicCorpus.collections) {
    assert.equal(collection.baselineIds.length, 3);
    assert.equal(new Set(collection.baselineIds).size, 3);
    for (const id of collection.baselineIds) assert.equal(getExcerpt(id).authorId, collection.authorId);
    for (const scenario of collection.scenarios) assert.ok(!collection.baselineIds.includes(scenario.sampleId), "holdouts cannot leak into the reference set");
    assert.equal(getExcerpt(collection.scenarios[0].sampleId).authorId, collection.authorId);
    assert.equal(getExcerpt(collection.scenarios[1].sampleId).authorId, collection.controlAuthorId);
    assert.equal(getExcerpt(collection.scenarios[2].sampleId).role, "synthetic");
    assert.ok(getExcerpt(collection.scenarios[3].sampleId).wordCount < minimumCandidateWords);
  }
});

test("every result refuses to be a probability or a credential", () => {
  for (const collection of publicCorpus.collections) for (const scenario of collection.scenarios) {
    const result = comparePublicScenario(scenario.id, undefined, collection.id);
    assert.equal(result.probability, null);
    assert.equal(result.credentialEligible, false);
    assert.equal(result.demographicsUsed, false);
    assert.equal(result.knownSource, scenario.truth);
  }
});

test("short candidates and single-reference baselines abstain", () => {
  const short = comparePublicScenario("too-short", undefined, "mill");
  assert.equal(short.score, null);
  assert.equal(short.status, "insufficient-evidence");
  assert.ok(short.flags.includes("SHORT_SAMPLE"));
  const sparse = comparePublicScenario("same-author", [getCollection("austen").baselineIds[0]]);
  assert.equal(sparse.score, null);
  assert.ok(sparse.flags.includes("SPARSE_BASELINE"));
});

test("only allowlisted collection, scenario, and reference ids are accepted", () => {
  assert.throws(() => comparePublicScenario("made-up"));
  assert.throws(() => comparePublicScenario("same-author", undefined, "made-up"));
  assert.throws(() => comparePublicScenario("same-author", ["austen-emma"]));
  assert.throws(() => comparePublicScenario("same-author", ["mill-liberty"]), "a reference from another collection is rejected");
  assert.throws(() => comparePublicScenario("same-author", ["austen-sense", "austen-sense"]));
  assert.throws(() => comparePublicScenario("same-author", []));
});

test("changing the selected references changes the computation", () => {
  const all = comparePublicScenario("same-author", undefined, "darwin");
  const two = comparePublicScenario("same-author", getCollection("darwin").baselineIds.slice(0, 2), "darwin");
  assert.notDeepEqual(all.features, two.features);
  assert.equal(all.windowWords, 250);
});

test("the score follows the published formula", () => {
  const result = comparePublicScenario("ai-fixture", undefined, "mill");
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
  const long = getExcerpt("austen-sense").text;
  const shortText = long.split(" ").slice(0, minimumCandidateWords - 1).join(" ");
  assert.equal(comparePublicTexts([long, long], shortText).score, null);
  assert.notEqual(comparePublicTexts([long, long], long).score, null);
});
