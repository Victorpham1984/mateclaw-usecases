import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/admin-auth";
import { readDrafts, buildDraftsPayload, draftToUseCase } from "@/lib/drafts";
import { readCases } from "@/lib/cases-db";
import { updateFileViaGitHub } from "@/lib/github-file";
import { updateCasesViaGitHub } from "@/lib/github";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    let drafts = readDrafts();
    const draft = drafts.find((d) => d.id === id && d.status === "draft");
    if (!draft) {
      return NextResponse.json({ error: "Draft not found or already published" }, { status: 404 });
    }

    let cases = readCases();
    const uc = draftToUseCase(draft, cases);
    cases.push(uc);

    // Update cases
    await updateCasesViaGitHub(cases, `[Publish] ${draft.title}`);

    // Mark draft as published
    draft.status = "published";
    draft.publishedAt = new Date().toISOString();
    await updateFileViaGitHub(
      "data/drafts.json",
      buildDraftsPayload(drafts),
      `[Drafts] Published ${id}`
    );

    return NextResponse.json({ case: uc });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
