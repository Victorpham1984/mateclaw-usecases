import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/admin-auth";
import { readDrafts, buildDraftsPayload, updateDraftFields } from "@/lib/drafts";
import { updateFileViaGitHub } from "@/lib/github-file";

// PATCH: Update draft fields (including AI-generated content)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const updates = await req.json();
    let drafts = readDrafts();
    const draft = drafts.find((d) => d.id === id);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    // Allow updating all editable fields
    const allowed: Record<string, boolean> = {
      title: true, description: true, category: true, tags: true,
      summary: true, prompt: true, transcript: true, transcriptSource: true,
      aiGenerated: true, difficulty: true, timeEstimate: true,
    };
    const filtered: Record<string, any> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (allowed[k]) filtered[k] = v;
    }
    drafts = updateDraftFields(drafts, id, filtered as any);
    await updateFileViaGitHub(
      "data/drafts.json",
      buildDraftsPayload(drafts),
      `[Drafts] Update ${id}`
    );
    return NextResponse.json({ draft: drafts.find((d) => d.id === id) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove draft
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    let drafts = readDrafts();
    drafts = drafts.filter((d) => d.id !== id);
    await updateFileViaGitHub(
      "data/drafts.json",
      buildDraftsPayload(drafts),
      `[Drafts] Delete ${id}`
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
