import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { submissions, workspaces } from "@/db/schema";
import { currentWorkspace, readSmallJson, sameOrigin } from "@/lib/workspace";

const input = z.object({
  title: z.string().trim().min(3).max(160), course: z.string().trim().min(1).max(100),
  mode: z.enum(["essay", "discussion", "prompt", "review"]),
  features: z.object({ wordCount: z.number().int().min(50).max(100000), avgSentenceLength: z.number().min(1).max(10000), lexicalDiversity: z.number().min(0).max(1), punctuationRate: z.number().min(0).max(10), sentenceVariation: z.number().min(0).max(100) }).strict(),
}).strict();

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  try {
    const workspace = await currentWorkspace();
    if (!workspace) return NextResponse.json({ error: "Open your workspace first." }, { status: 401 });
    const parsed = input.safeParse(await readSmallJson(request));
    if (!parsed.success) return NextResponse.json({ error: "Use a title, an assignment type, and at least 50 words. Raw text is not accepted by this API." }, { status: 400 });
    const { title, course, mode, features } = parsed.data;
    // A transparent synthetic heuristic, NOT a trained or calibrated authorship model.
    const distance = Math.abs(features.avgSentenceLength - 18.5) * .16 + Math.abs(features.lexicalDiversity - .68) * 9 + Math.abs(features.sentenceVariation - .45) * 2;
    const flags: string[] = [];
    if (features.wordCount < 100) flags.push("SHORT_SAMPLE");
    if (mode === "prompt") flags.push("PROMPT_BASELINE_REQUIRED");
    if (distance > 4.5) flags.push("STYLE_VARIATION");
    const score = flags.includes("SHORT_SAMPLE") || mode === "prompt" ? null : Math.round(Math.max(80, Math.min(99.6, 99.3 - distance)) * 10) / 10;
    const status = score === null ? "Insufficient evidence" : score < 95 ? "Needs context" : "Verified";
    const result = await db.transaction(async tx => {
      const [latest] = await tx.select().from(workspaces).where(eq(workspaces.id, workspace.id)).for("update");
      if (!latest?.consent) return null;
      const [saved] = await tx.insert(submissions).values({ id: randomUUID(), workspaceId: workspace.id, title, course, mode, source: "Manual", wordCount: features.wordCount, score, status, flags, features }).returning();
      return saved;
    });
    if (!result) return NextResponse.json({ error: "Verification is paused. Enable opt-in in Privacy & settings first." }, { status: 403 });
    const { workspaceId: _id, ...safe } = result;
    return NextResponse.json({ submission: safe, demo: true, note: "Illustrative heuristic only. No raw text was transmitted or stored." }, { status: 201 });
  } catch { return NextResponse.json({ error: "The demo could not be saved. Please check your input and try again." }, { status: 400 }); }
}
