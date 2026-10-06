import { comparePublicScenario, defaultCollectionId, defaultScenarioId, getCollection, publicCorpus } from "@/lib/public-demo";

// Anonymous, read-only, finite fixture comparisons. No auth, DB, user text, or model API.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const allowed = new Set(["collection", "scenario", "baseline"]);
  if (url.search.length > 512 || [...url.searchParams.keys()].some(key => !allowed.has(key)) || [...allowed].some(key => url.searchParams.getAll(key).length > 1)) {
    return Response.json({ error: "Only a demo collection, scenario, and reference IDs are accepted. Do not send personal data or raw text." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const collectionId = url.searchParams.get("collection") || defaultCollectionId;
  const scenario = url.searchParams.get("scenario") || defaultScenarioId;
  try {
    const ids = url.searchParams.has("baseline") ? url.searchParams.get("baseline")!.split(",") : getCollection(collectionId).baselineIds;
    // Netlify's CDN keys cached responses by path unless told to vary on the query string.
    // Without this header every scenario would be served the first cached result.
    return Response.json(comparePublicScenario(scenario, ids, collectionId), { headers: { "Cache-Control": "public, max-age=300", "Netlify-Vary": "query", "Vary": "Accept", "X-Content-Type-Options": "nosniff" } });
  } catch {
    const names = publicCorpus.collections.map(item => item.id).join(", ");
    return Response.json({ error: `Choose one of the collections (${names}), one of its four scenarios, and one to three of its distinct reference excerpts.` }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
