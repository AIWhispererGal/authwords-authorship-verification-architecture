import type { Metadata } from "next";
import PublicDemo from "@/components/public-demo";
import { defaultScenarioId, publicCorpus } from "@/lib/public-demo";
import "./demo.css";

export const metadata: Metadata = {
  title: "Try AuthWords — No sign-in, no upload",
  description: "Explore authorship verification with locally stored public-domain Jane Austen excerpts, a Mary Shelley control, and a labeled AI fixture. No account or upload required.",
};

export default async function DemoPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const scenario = typeof query.sample === "string" && publicCorpus.scenarios.some(item => item.id === query.sample) ? query.sample : defaultScenarioId;
  const selected = typeof query.baseline === "string" ? query.baseline.split(",") : publicCorpus.baselineIds;
  const valid = selected.length > 0 && selected.length <= 3 && new Set(selected).size === selected.length && selected.every(id => publicCorpus.baselineIds.includes(id));
  return <PublicDemo initialScenarioId={scenario} initialBaselineIds={valid ? selected : publicCorpus.baselineIds}/>;
}
