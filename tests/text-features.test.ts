import { test } from "node:test";
import assert from "node:assert/strict";
import { wordCount, words, sentenceLengths, textWindow } from "../src/lib/text-features";
import { deriveMetrics } from "../src/lib/client";
import { sampleText } from "../src/lib/demo-data";

test("tokenizer keeps contractions together and drops punctuation", () => {
  assert.deepEqual(words("Don’t stop—it's fine, isn't it?"), ["don't", "stop", "it's", "fine", "isn't", "it"]);
  assert.equal(wordCount("one two  three\n\nfour"), 4);
});

test("sentence splitter protects common abbreviations", () => {
  assert.deepEqual(sentenceLengths("Dr. Smith left. Mrs. Jones stayed!"), [3, 3]);
});

test("text windows cut on a token boundary", () => {
  assert.equal(textWindow("alpha beta gamma delta", 2), "alpha beta");
  assert.equal(textWindow("alpha beta", 5), "alpha beta");
});

test("browser metrics never include the text and stay within the API schema", () => {
  const metrics = deriveMetrics(sampleText);
  assert.ok(!("text" in metrics));
  assert.ok(metrics.wordCount >= 50 && metrics.wordCount <= 100000);
  assert.ok(metrics.lexicalDiversity > 0 && metrics.lexicalDiversity <= 1);
  assert.ok(metrics.avgSentenceLength >= 1);
  assert.ok(metrics.sentenceVariation >= 0 && metrics.sentenceVariation <= 100);
  assert.ok(metrics.punctuationRate >= 0 && metrics.punctuationRate <= 10);
});
