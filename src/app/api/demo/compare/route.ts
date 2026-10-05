import { comparePublicScenario, defaultScenarioId, publicCorpus } from "@/lib/public-demo";

// Anonymous, read-only, finite fixture comparisons. No auth, DB, user text, or model API.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const allowed = new Set(["scenario", "baseline"]);
  if (url.search.length > 512 || [...url.searchParams.keys()].some(key => !allowed.has(key)) || [...allowed].some(key => url.searchParams.getAll(key).length > 1)) {
    return Response.json({ error: "Only a demo scenario and reference IDs are accepted. Do not send personal data or raw text." }, { status: 400 });
  }
  const scenario = url.searchParams.get("scenario") || defaultScenarioId;
  const ids = url.searchParams.has("baseline") ? url.searchParams.get("baseline")!.split(",") : publicCorpus.baselineIds;
  try {
    return Response.json(comparePublicScenario(scenario, ids), { headers: { "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return Response.json({ error: "Choose one of the four demo scenarios and one to three distinct Austen reference excerpts." }, { status: 400 });
  }
}
