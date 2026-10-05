import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { workspaces, submissions, credentials } from "@/db/schema";
import { makeSeedSubmissions, type WorkspaceData, type SubmissionStatus } from "@/lib/demo-data";
import { signDemoCredential } from "@/lib/credentials";

export async function currentWorkspace() {
  const cookieStore = await cookies();
  const id = cookieStore.get("aw_workspace")?.value;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
  return workspace || null;
}

export async function initializeWorkspace() {
  const existing = await currentWorkspace();
  if (existing) return existing;
  const id = randomUUID();
  const rows = makeSeedSubmissions().map(s => ({ ...s, id: randomUUID(), workspaceId: id, submittedAt: new Date(s.submittedAt) }));
  const signed = await Promise.all(rows.filter(s => s.status === "Verified").slice(0, 18).map(async (s) => ({
    ...await signDemoCredential(), workspaceId: id, submissionId: s.id,
  })));
  const workspace = await db.transaction(async tx => {
    const [created] = await tx.insert(workspaces).values({ id }).returning();
    await tx.insert(submissions).values(rows);
    await tx.insert(credentials).values(signed);
    return created;
  });
  (await cookies()).set("aw_workspace", id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7, path: "/" });
  return workspace;
}

export async function workspaceData(workspace: typeof workspaces.$inferSelect): Promise<WorkspaceData> {
  const [rows, certs] = await Promise.all([
    db.select().from(submissions).where(eq(submissions.workspaceId, workspace.id)).orderBy(desc(submissions.submittedAt)),
    db.select({ id: credentials.id, submissionId: credentials.submissionId, revoked: credentials.revoked, createdAt: credentials.createdAt }).from(credentials).where(eq(credentials.workspaceId, workspace.id)).orderBy(desc(credentials.createdAt)),
  ]);
  return {
    consent: workspace.consent, sources: workspace.sources, consentUpdatedAt: workspace.consentUpdatedAt.toISOString(), demo: true,
    submissions: rows.map(({ workspaceId: _workspaceId, ...s }) => ({ ...s, status: s.status as SubmissionStatus, submittedAt: s.submittedAt.toISOString() })),
    credentials: certs.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })),
  };
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(request.url).origin;
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  return !origin || origin === expected || (forwardedHost !== null && origin === `${forwardedProto}://${forwardedHost}`);
}

export async function readSmallJson(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new Error("JSON required");
  if (Number(request.headers.get("content-length") || 0) > 16_384) throw new Error("Request too large");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Body required");
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > 16_384) { await reader.cancel(); throw new Error("Request too large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

export async function ownSubmission(workspaceId: string, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [submission] = await db.select().from(submissions).where(and(eq(submissions.id, id), eq(submissions.workspaceId, workspaceId)));
  return submission || null;
}
