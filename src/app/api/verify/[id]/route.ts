import { verifyDemoCredential } from "@/lib/credentials";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await verifyDemoCredential((await params).id);
  return Response.json(result || { valid: false, error: "Credential not found" }, { status: result ? 200 : 404, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" } });
}
