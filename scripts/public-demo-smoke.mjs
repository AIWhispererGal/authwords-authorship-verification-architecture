import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { chromium, request, expect } from "@playwright/test";

const baseURL = process.env.TEST_BASE_URL || "http://localhost:3000";
const fixture = JSON.parse(await readFile(new URL("../src/data/public-demo/corpus.json", import.meta.url), "utf8"));
const http = await request.newContext({ baseURL });
let browser;
try {
  assert.equal(fixture.excerpts.length, 7);
  assert.equal(fixture.baselineIds.length, 3);
  assert.equal(new Set(fixture.baselineIds).size, 3);
  for (const excerpt of fixture.excerpts) {
    assert.equal(createHash("sha256").update(excerpt.text).digest("hex"), excerpt.sha256, `hash: ${excerpt.id}`);
    assert.equal((excerpt.text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || []).length, excerpt.wordCount, `words: ${excerpt.id}`);
    if (excerpt.ebook) assert.ok(excerpt.sourceUrl.startsWith("https://www.gutenberg.org/ebooks/"));
    assert.ok(!/PROJECT GUTENBERG|\[Illustration|Transcriber/i.test(excerpt.text));
  }
  for (const scenario of fixture.scenarios) assert.ok(!fixture.baselineIds.includes(scenario.sampleId), "holdouts cannot leak into the reference set");
  for (const author of fixture.authors) { assert.equal(author.eslStatus, null); assert.equal(author.proficiency, null); }
  assert.ok(fixture.excerpts.find(item => item.role === "synthetic").generationPrompt);
  const firstPage = await http.get("/demo");
  assert.equal(firstPage.status(), 200);
  assert.equal(firstPage.headers()["set-cookie"], undefined, "public entry must not initialize a workspace");
  const corpusResponse = await http.get("/api/demo/corpus");
  assert.equal(corpusResponse.status(), 200);
  assert.match(corpusResponse.headers()["content-disposition"], /attachment/);
  assert.deepEqual(await corpusResponse.json(), fixture);
  const reports = {};
  for (const scenario of fixture.scenarios) {
    const response = await http.get(`/api/demo/compare?scenario=${scenario.id}`);
    assert.equal(response.status(), 200);
    assert.equal(response.headers()["set-cookie"], undefined);
    const result = await response.json(); reports[scenario.id] = result;
    assert.equal(result.probability, null); assert.equal(result.demographicsUsed, false); assert.equal(result.credentialEligible, false);
    assert.deepEqual(await (await http.get(`/api/demo/compare?scenario=${scenario.id}`)).json(), result, "same fixture yields identical reports");
    if (scenario.id === "too-short") {
      assert.equal(result.score, null); assert.equal(result.status, "insufficient-evidence"); assert.ok(result.flags.includes("SHORT_SAMPLE"));
    } else {
      assert.equal(result.features.length, 6); assert.equal(result.windowWords, 250);
      const distance = result.features.reduce((sum, item) => sum + item.residual, 0) / 6;
      assert.equal(result.score, Math.round(100 / (1 + distance)));
    }
  }
  const oneReference = await (await http.get(`/api/demo/compare?scenario=same-author&baseline=${fixture.baselineIds[0]}`)).json();
  assert.equal(oneReference.score, null); assert.ok(oneReference.flags.includes("SPARSE_BASELINE"));
  const twoReferences = await (await http.get(`/api/demo/compare?scenario=same-author&baseline=${fixture.baselineIds.slice(0, 2).join(",")}`)).json();
  assert.notDeepEqual(twoReferences.features, reports["same-author"].features, "selected baseline must actually change the computation");
  for (const query of ["scenario=made-up", "scenario=same-author&text=private", "baseline=austen-emma", "baseline=austen-sense,austen-sense", "scenario=same-author&scenario=ai-fixture", "demographics=english"]) assert.equal((await http.get(`/api/demo/compare?${query}`)).status(), 400, query);
  assert.equal((await http.post("/api/demo/compare", { data: { text: "No arbitrary text input is accepted" } })).status(), 405);
  assert.equal((await http.storageState()).cookies.length, 0, "the public API must remain cookieless");
  console.log("PASS: local hashes, attribution, split integrity, anonymous APIs, deterministic real metrics, baseline recomputation, abstention, and strict ID-only boundaries.");

  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"], executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
  // Set PLAYWRIGHT_IGNORE_HTTPS_ERRORS=1 when a TLS-intercepting proxy sits between this runner and the target.
  const ignoreHTTPSErrors = process.env.PLAYWRIGHT_IGNORE_HTTPS_ERRORS === "1";
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, ignoreHTTPSErrors });
  const errors = [], requests = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", req => requests.push(req.url()));
  await page.goto(`${baseURL}/demo`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "A familiar author. A better question." })).toBeVisible();
  await expect(page.locator(".pd-score-ring strong")).toHaveText(String(reports["same-author"].score));
  assert.equal(await page.locator('input[type="file"]').count(), 0);
  assert.equal((await page.context().cookies()).length, 0);
  assert.ok(!requests.some(url => url.includes("/api/workspace") || url.includes("/api/submissions")));
  assert.ok(requests.every(url => new URL(url).origin === new URL(baseURL).origin), "no third-party runtime calls");
  await page.getByRole("button", { name: "AI fixture", exact: true }).click();
  await expect(page.getByText("PREVIOUS RESULT", { exact: true })).toBeVisible();
  const calculation = page.waitForResponse(res => res.url().includes("/api/demo/compare?scenario=ai-fixture"));
  await page.getByRole("button", { name: "Run comparison", exact: true }).click();
  assert.equal((await calculation).status(), 200);
  await expect(page.locator(".pd-score-ring strong")).toHaveText(String(reports["ai-fixture"].score));
  assert.match(page.url(), /sample=ai-fixture/);
  await page.getByRole("button", { name: "Inspect the signals" }).click();
  await expect(page.locator("#pd-feature-table tbody tr")).toHaveCount(6);
  await expect(page.locator(".pd-score-tile")).toHaveCount(4);
  await expect(page.locator(".pd-score-tile.active .eyebrow")).toHaveText("AI FIXTURE");
  await expect(page.locator(".pd-score-tile").nth(1).locator("strong")).toHaveText(String(reports["other-human"].score));
  await expect(page.getByText(/scores at least as close|edges out Shelley/)).toBeVisible();
  await page.getByRole("button", { name: "Mary Shelley", exact: true }).click();
  await expect(page.getByText("London, England", { exact: true })).toBeVisible();
  await expect(page.getByText("Not documented", { exact: true })).toBeVisible();
  await expect(page.locator(".pd-score-ring strong")).toHaveText(String(reports["ai-fixture"].score));
  const seedDownload = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download seed data", exact: true }).click();
  assert.equal((await seedDownload).suggestedFilename(), "authwords-austen-public-v1.json");
  const resultDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export result", exact: true }).click();
  assert.equal((await resultDownload).suggestedFilename(), "authwords-ai-fixture-comparison.json");
  await page.getByRole("button", { name: "Meet the source texts" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("A small collection. A clear paper trail.")).toBeVisible();
  await page.getByRole("button", { name: "Close sources", exact: true }).click();
  await page.getByRole("button", { name: "Read Sense and Sensibility reference", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("The family of Dashwood");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Too short", exact: true }).click();
  await page.getByRole("button", { name: "Run comparison", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Insufficient evidence", exact: true })).toBeVisible();
  await expect(page.locator(".pd-score-ring strong")).toHaveCount(0);
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await expect(page.locator(".pd-score-ring strong")).toHaveText(String(reports["same-author"].score));
  await page.getByRole("checkbox", { name: "Include Mansfield Park", exact: true }).uncheck();
  await page.getByRole("checkbox", { name: "Include Pride and Prejudice", exact: true }).uncheck();
  await page.getByRole("button", { name: "Run comparison", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Insufficient evidence", exact: true })).toBeVisible();
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Insufficient evidence", exact: true })).toBeVisible();
  assert.deepEqual(errors, []);
  assert.equal((await page.context().cookies()).length, 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
  console.log("PASS: preloaded result, live API comparison, metadata noninterference, source previews, exports, reset, and shareable state.");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, ignoreHTTPSErrors });
  await mobile.goto(`${baseURL}/demo?sample=other-human`, { waitUntil: "networkidle" });
  await expect(mobile.getByRole("button", { name: "Other human", exact: true })).toHaveAttribute("aria-pressed", "true");
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
  await mobile.getByRole("button", { name: "Inspect the signals" }).click();
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
  await mobile.getByRole("button", { name: "Meet the source texts" }).click();
  await expect(mobile.getByRole("dialog")).toBeVisible();
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
  console.log("PASS: mobile deep links, metrics, and source modal have no horizontal overflow.");
  console.log("ALL PUBLIC DEMO TESTS PASSED");
} finally {
  await http.dispose();
  if (browser) await browser.close();
}
