import type { Submission } from "@/lib/demo-data";
export type View = "overview" | "submissions" | "profile" | "credentials" | "blueprint" | "how-it-works" | "settings";
export const viewNames: Record<View, string> = { overview: "Overview", submissions: "My submissions", profile: "Writing profile", credentials: "Credentials", blueprint: "System blueprint", "how-it-works": "How it works", settings: "Privacy & settings" };
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
export function deriveMetrics(text: string) {
  const words = text.toLowerCase().match(/[\p{L}\p{N}'’\-]+/gu) || [];
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const lengths = sentences.map(s => (s.match(/[\p{L}\p{N}'’\-]+/gu) || []).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / Math.max(lengths.length, 1);
  const variance = lengths.reduce((sum, length) => sum + (length - mean) ** 2, 0) / Math.max(lengths.length, 1);
  return { wordCount: words.length, avgSentenceLength: Math.max(1, mean), lexicalDiversity: new Set(words).size / Math.max(words.length, 1), punctuationRate: (text.match(/[,;:!?—.]/g) || []).length / Math.max(words.length, 1), sentenceVariation: Math.sqrt(variance) / Math.max(mean, 1) };
}
