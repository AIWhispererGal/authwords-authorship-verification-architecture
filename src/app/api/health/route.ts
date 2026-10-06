import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Reports only an error code and name on failure, never the connection string or a stack.
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch (failure) {
    const error = failure instanceof Error ? failure : new Error(String(failure));
    const cause = (error as Error & { cause?: { code?: string; message?: string } }).cause;
    const code = (error as Error & { code?: string }).code || cause?.code;
    const reason = (cause?.message || error.message).replace(/postgres(ql)?:\/\/\S+/gi, "[redacted]").slice(0, 200);
    return Response.json({ ok: false, configured: Boolean(process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL), error: { name: error.name, code: code ?? null, reason } }, { status: 500 });
  }
}
