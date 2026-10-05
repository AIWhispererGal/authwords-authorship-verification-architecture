import type { Submission } from "@/lib/demo-data";
import { mean, populationDeviation, sentenceLengths, words } from "@/lib/text-features";
export type View = "overview" | "submissions" | "profile" | "credentials" | "blueprint" | "how-it-works" | "why-not-detection" | "flip" | "settings";
export const viewNames: Record<View, string> = { overview: "Overview", submissions: "My submissions", profile: "Writing profile", credentials: "Credentials", blueprint: "System blueprint", "how-it-works": "How it works", "why-not-detection": "Why not detection?", flip: "Flip the assignment", settings: "Privacy & settings" };
export const viewHref = (view: View) => view === "overview" ? "/" : `/?view=${view}`;
export async function api<T>(url: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(url, { method, headers: body === undefined ? undefined : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data as T;
}
export function downloadFile(content: string, filename: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a"); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportSubmissions(rows: Submission[]) {
  const quote = (value: string | number | null) => { let text = String(value ?? ""); if (/^[=+\-@\t\r]/.test(text)) text = "'" + text; return `"${text.replaceAll('"', '""')}"`; };
  const csv = [["Title", "Course", "Source", "Status", "Illustrative score (not calibrated)", "Words", "Date"], ...rows.map(s => [s.title, s.course, s.source, s.status, s.score, s.wordCount, s.submittedAt])].map(row => row.map(quote).join(",")).join("\r\n");
  downloadFile(csv, "authwords-demo-submissions.csv", "text/csv;charset=utf-8");
}
export function formatDate(value: string, long = false) { return new Date(value).toLocaleDateString("en-US", { month: long ? "long" : "short", day: "numeric", ...(long ? { year: "numeric" as const } : {}) }); }
// Coarse, browser-only metrics. Shares its tokenizer with the public demo so both measure alike.
export function deriveMetrics(text: string) {
  const wordList = words(text);
  const lengths = sentenceLengths(text);
  const average = mean(lengths);
  return { wordCount: wordList.length, avgSentenceLength: Math.max(1, average), lexicalDiversity: new Set(wordList).size / Math.max(wordList.length, 1), punctuationRate: (text.match(/[,;:!?—.]/g) || []).length / Math.max(wordList.length, 1), sentenceVariation: populationDeviation(lengths) / Math.max(average, 1) };
}
