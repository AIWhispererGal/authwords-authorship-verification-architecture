import { publicCorpus } from "@/lib/public-demo";

export const dynamic = "force-static";
export async function GET() {
  return new Response(JSON.stringify(publicCorpus, null, 2) + "\n", {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="authwords-${publicCorpus.version}.json"`,
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
