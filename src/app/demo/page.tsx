import type { Metadata } from "next";
import PublicDemo from "@/components/public-demo";
import { defaultCollectionId, defaultScenarioId, getCollection, publicCorpus } from "@/lib/public-demo";
import "./demo.css";

export const metadata: Metadata = {
  title: "Try AuthWords — No sign-in, no upload",
  description: "Explore authorship verification with locally stored public-domain excerpts from Jane Austen, John Stuart Mill, and Charles Darwin, each with an other-author control and a labeled AI fixture. No account or upload required.",
};

export default async function DemoPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const collectionId = typeof query.collection === "string" && publicCorpus.collections.some(item => item.id === query.collection) ? query.collection : defaultCollectionId;
  const collection = getCollection(collectionId);
  const scenario = typeof query.sample === "string" && collection.scenarios.some(item => item.id === query.sample) ? query.sample : defaultScenarioId;
  const selected = typeof query.baseline === "string" ? query.baseline.split(",") : collection.baselineIds;
  const valid = selected.length > 0 && selected.length <= 3 && new Set(selected).size === selected.length && selected.every(id => collection.baselineIds.includes(id));
  return <PublicDemo initialCollectionId={collectionId} initialScenarioId={scenario} initialBaselineIds={valid ? selected : collection.baselineIds}/>;
}
