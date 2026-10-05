import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { credentials, workspaces } from "@/db/schema";
import { signDemoCredential } from "@/lib/credentials";
import { currentWorkspace, ownSubmission, readSmallJson, sameOrigin } from "@/lib/workspace";
const mintInput = z.object({ submissionId: z.string().uuid() }).strict();
const revokeInput = z.object({ id: z.string().regex(/^[A-Za-z0-9_-]{32}$/), revoked: z.literal(true) }).strict();

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  try {
    const workspace = await currentWorkspace();
    if (!workspace) return NextResponse.json({ error: "Workspace not found." }, { status: 401 });
    const parsed = mintInput.safeParse(await readSmallJson(request));
    if (!parsed.success) return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    const submission = await ownSubmission(workspace.id, parsed.data.submissionId);
    if (!submission || submission.status !== "Verified") return NextResponse.json({ error: "Only verified demo submissions are eligible." }, { status: 400 });
    const signed = await signDemoCredential();
    const result = await db.transaction(async tx => {
      const [latest] = await tx.select().from(workspaces).where(eq(workspaces.id, workspace.id)).for("update");
      if (!latest?.consent) return null;
      const [existing] = await tx.select().from(credentials).where(eq(credentials.submissionId, submission.id));
      if (existing) return existing;
      const [created] = await tx.insert(credentials).values({ ...signed, workspaceId: workspace.id, submissionId: submission.id }).returning();
      return created;
    });
    if (!result) return NextResponse.json({ error: "Opt in before minting a demo credential." }, { status: 403 });
    if (result.revoked) return NextResponse.json({ error: "This credential was revoked and cannot be reactivated." }, { status: 409 });
    return NextResponse.json({ id: result.id, submissionId: result.submissionId, revoked: result.revoked, createdAt: result.createdAt, url: `/verify/${result.id}` });
  } catch { return NextResponse.json({ error: "Credential could not be created." }, { status: 400 }); }
}
export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  try {
    const workspace = await currentWorkspace();
    if (!workspace) return NextResponse.json({ error: "Workspace not found." }, { status: 401 });
    const parsed = revokeInput.safeParse(await readSmallJson(request));
    if (!parsed.success) return NextResponse.json({ error: "Invalid credential." }, { status: 400 });
    const [updated] = await db.update(credentials).set({ revoked: true }).where(and(eq(credentials.id, parsed.data.id), eq(credentials.workspaceId, workspace.id))).returning({ id: credentials.id });
    if (!updated) return NextResponse.json({ error: "Credential not found." }, { status: 404 });
    return NextResponse.json({ revoked: true });
  } catch { return NextResponse.json({ error: "Credential could not be revoked." }, { status: 400 }); }
}
