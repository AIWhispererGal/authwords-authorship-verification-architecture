import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { currentWorkspace, ownSubmission, sameOrigin } from "@/lib/workspace";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  const workspace = await currentWorkspace();
  if (!workspace) return NextResponse.json({ error: "Workspace not found." }, { status: 401 });
  const { id } = await params;
  const own = await ownSubmission(workspace.id, id);
  if (!own) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  const [updated] = await db.update(submissions).set({ reviewRequested: true }).where(and(eq(submissions.id, id), eq(submissions.workspaceId, workspace.id))).returning();
  return NextResponse.json({ reviewRequested: updated.reviewRequested, note: "Review request saved in this demo. No instructor notification was sent." });
}
