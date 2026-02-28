import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/admin-auth";
import { readDrafts, buildDraftsPayload, draftToUseCase } from "@/lib/drafts";
import { readCases } from "@/lib/cases-db";
import { updateFileViaGitHub } from "@/lib/github-file";
import { updateCasesViaGitHub } from "@/lib/github";

// GET: List all drafts
export async function GET() {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const drafts = readDrafts().filter((d) => d.status === "draft");
  return NextResponse.json({ drafts });
}

// POST: Bulk publish drafts
export async function POST(req: NextRequest) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { draftIds } = await req.json();
    if (!draftIds || !Array.isArray(draftIds) || draftIds.length === 0) {
      return NextResponse.json({ error: "draftIds array required" }, { status: 400 });
    }

    let drafts = readDrafts();
    let cases = readCases();
    const published: string[] = [];
    const idsSet = new Set(draftIds);

    for (const draft of drafts) {
      if (idsSet.has(draft.id) && draft.status === "draft") {
        const uc = draftToUseCase(draft, cases);
        cases.push(uc);
        draft.status = "published";
        draft.publishedAt = new Date().toISOString();
        published.push(draft.id);
      }
    }

    if (published.length > 0) {
      // Update cases.json
      await updateCasesViaGitHub(
        cases,
        `[Publish] ${published.length} draft(s) → cases`
      );
      // Update drafts.json (mark as published)
      await updateFileViaGitHub(
        "data/drafts.json",
        buildDraftsPayload(drafts),
        `[Drafts] Mark ${published.length} as published`
      );
    }

    return NextResponse.json({ published: published.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
