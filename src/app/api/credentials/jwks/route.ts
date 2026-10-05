import { publicJwks } from "@/lib/credentials";
export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json(await publicJwks(), { headers: { "Cache-Control": "public, max-age=300" } });
}
