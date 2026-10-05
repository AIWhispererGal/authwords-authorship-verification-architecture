export type SubmissionStatus = "Verified" | "Needs context" | "Insufficient evidence";
export interface Submission {
  id: string; title: string; course: string; source: string; mode: string;
  wordCount: number; score: number | null; status: SubmissionStatus; flags: string[];
  features: Record<string, number>; submittedAt: string; seeded: boolean; reviewRequested: boolean;
}
export interface Credential {
  id: string; submissionId: string; revoked: boolean; createdAt: string;
}
export interface WorkspaceData {
  consent: boolean; sources: string[]; consentUpdatedAt: string;
  submissions: Submission[]; credentials: Credential[]; demo: true;
}
export const sourceOptions = [
  { id: "discussions", title: "Discussion posts", description: "Your contributions to course conversations", count: 58 },
  { id: "timed", title: "In-class writing", description: "Timed, supervised writing with strong provenance", count: 24 },
  { id: "drafts", title: "Drafts & revisions", description: "The thinking that happens before your final draft", count: 36 },
  { id: "reviews", title: "Peer reviews", description: "Feedback you have written for your classmates", count: 24 },
  { id: "projects", title: "Group contributions", description: "Only individually attributable, consented contributions", count: 0 },
  { id: "email", title: "Academic email", description: "Off by default. Requires separate institutional authorization", count: 0 },
];

const seedRows: [string, string, string, number | null, number, string?][] = [
  ["The ethics of artificial intelligence", "PHIL 204 · Ethics & Technology", "Canvas", 99.2, 1842],
  ["Urban spaces & social identity", "SOC 210 · Urban Sociology", "Canvas", 98.6, 2156],
  ["Reflections on modern literature", "ENG 302 · Modern Literature", "Canvas", 97.8, 1620],
  ["Rethinking sustainable development", "ENV 201 · Environmental Studies", "Canvas", 99.1, 2408],
  ["Week 8 · Critical thinking", "PHIL 204 · Ethics & Technology", "Canvas", 91.4, 318, "discussion"],
  ["A language of belonging", "ENG 302 · Modern Literature", "Canvas", 98.8, 1724],
  ["Community and the public sphere", "SOC 210 · Urban Sociology", "Canvas", 98.2, 1960],
  ["Designing for a circular economy", "ENV 201 · Environmental Studies", "Canvas", 99.4, 2312],
  ["The responsibility of innovation", "PHIL 204 · Ethics & Technology", "Canvas", 98.7, 1880],
  ["Close reading: Virginia Woolf", "ENG 302 · Modern Literature", "Canvas", 97.9, 1412],
  ["Cities as living systems", "SOC 210 · Urban Sociology", "Canvas", 99.0, 2095],
  ["Climate policy and collective action", "ENV 201 · Environmental Studies", "Canvas", 98.5, 2274],
  ["Week 6 · The social contract", "PHIL 204 · Ethics & Technology", "Canvas", 98.3, 480, "discussion"],
  ["Narrative, memory, and identity", "ENG 302 · Modern Literature", "Canvas", 99.1, 1805],
  ["Field notes from the neighborhood", "SOC 210 · Urban Sociology", "Canvas", 97.6, 920],
  ["Energy transitions: a peer review", "ENV 201 · Environmental Studies", "Canvas", 98.6, 620, "review"],
  ["Human judgment in a digital world", "PHIL 204 · Ethics & Technology", "Canvas", 99.2, 1773],
  ["Poetry and the shape of meaning", "ENG 302 · Modern Literature", "Canvas", 98.4, 1560],
  ["Public spaces, shared futures", "SOC 210 · Urban Sociology", "Canvas", 98.1, 2194],
  ["A local approach to biodiversity", "ENV 201 · Environmental Studies", "Canvas", 99.0, 2016],
  ["Week 4 · What makes an argument?", "PHIL 204 · Ethics & Technology", "Canvas", 97.8, 540, "discussion"],
  ["The art of the unreliable narrator", "ENG 302 · Modern Literature", "Canvas", 98.9, 1980],
  ["Migration and the modern city", "SOC 210 · Urban Sociology", "Canvas", 98.5, 2238],
  ["Tracing our ecological footprint", "ENV 201 · Environmental Studies", "Canvas", 98.2, 1894],
  ["An introduction to moral reasoning", "PHIL 204 · Ethics & Technology", "Canvas", 98.7, 1210],
  ["Prompt journal: alternative futures", "ENG 302 · Modern Literature", "Manual", null, 86, "prompt"],
];

export function makeSeedSubmissions(): Submission[] {
  return seedRows.map(([title, course, source, score, wordCount, mode], i) => ({
    id: `preview-${i}`, title, course, source, score, wordCount, mode: mode || "essay",
    status: score === null ? "Insufficient evidence" : score < 95 ? "Needs context" : "Verified",
    flags: score === null ? ["PROMPT_BASELINE_REQUIRED", "SHORT_SAMPLE"] : score < 95 ? ["GENRE_SHIFT"] : [],
    features: { avgSentenceLength: 17.8 + (i % 4), lexicalDiversity: .64 + (i % 5) / 100, punctuationRate: .1, sentenceVariation: .43 },
    submittedAt: new Date(Date.UTC(2026, 4, 28 - i, 10, 30)).toISOString(),
    seeded: true, reviewRequested: false,
  }));
}
export const previewWorkspace: WorkspaceData = {
  consent: true, sources: ["discussions", "timed", "drafts", "reviews"],
  consentUpdatedAt: "2026-05-01T00:00:00.000Z", submissions: makeSeedSubmissions(),
  credentials: makeSeedSubmissions().filter(s => s.status === "Verified").slice(0, 18).map((s, i) => ({ id: `preview-credential-${i}`, submissionId: s.id, revoked: false, createdAt: s.submittedAt })), demo: true,
};
export const sampleText = "Learning changes the way we see familiar places. A city, for example, is more than a collection of buildings and roads. It is a conversation between the people who live there, shaped by their histories and their hopes. When I walk through my neighborhood, I notice the small choices that make a public space welcoming. There are benches beneath the trees, wide paths beside the library, and a garden maintained by local volunteers. These details suggest that thoughtful design begins with listening. We should ask who feels welcome, whose needs remain invisible, and how a place might evolve. No single solution can answer every question. Still, a shared commitment to curiosity can help a community discover better possibilities together. This is why I believe the most meaningful urban change begins not with a blueprint, but with a conversation.";
