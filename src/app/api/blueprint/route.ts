import { blueprintMarkdown } from "@/lib/blueprint";

export const dynamic = "force-static";
export async function GET() {
  return new Response(blueprintMarkdown(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="authwords-production-blueprint.md"',
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
