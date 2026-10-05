import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { workspaces } from "@/db/schema";
import { currentWorkspace, initializeWorkspace, readSmallJson, sameOrigin, workspaceData } from "@/lib/workspace";

export const dynamic = "force-dynamic";
export async function GET() {
  try { return NextResponse.json(await workspaceData(await initializeWorkspace()), { headers: { "Cache-Control": "private, no-store" } }); }
  catch { return NextResponse.json({ error: "Your workspace could not be loaded. Please try again." }, { status: 503 }); }
}
const settings = z.object({ consent: z.boolean().optional(), sources: z.array(z.enum(["discussions", "timed", "drafts", "reviews", "projects", "email"])).max(6).optional() }).strict();
export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  try {
    const workspace = await currentWorkspace();
    if (!workspace) return NextResponse.json({ error: "Open your workspace first." }, { status: 401 });
    const parsed = settings.safeParse(await readSmallJson(request));
    if (!parsed.success) return NextResponse.json({ error: "Invalid preferences." }, { status: 400 });
    const [updated] = await db.update(workspaces).set({ ...parsed.data, ...(parsed.data.consent !== undefined && parsed.data.consent !== workspace.consent ? { consentUpdatedAt: new Date() } : {}) }).where(eq(workspaces.id, workspace.id)).returning();
    return NextResponse.json(await workspaceData(updated));
  } catch { return NextResponse.json({ error: "Preferences could not be saved." }, { status: 400 }); }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  const workspace = await currentWorkspace();
  if (workspace) await db.delete(workspaces).where(eq(workspaces.id, workspace.id));
  (await cookies()).delete("aw_workspace");
  return NextResponse.json({ deleted: true });
}
