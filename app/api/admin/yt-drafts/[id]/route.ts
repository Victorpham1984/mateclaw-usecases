import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, createAuthResponse } from "@/lib/pipeline/auth";
import {
  getDraftById,
  updateDraft,
  deleteDraft,
  readCategories,
  readSources,
  commitSingleFile,
} from "@/lib/youtube-data";

export const dynamic = "force-dynamic";

// GET /api/admin/yt-drafts/[id] - Get single draft
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const { id } = await params;
  const draft = getDraftById(id);

  if (!draft) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Enrich with category/source data
  const categories = readCategories();
  const sources = readSources();
  const cat = draft.category_id ? categories.find((c) => c.id === draft.category_id) : null;
  const src = draft.source_id ? sources.find((s) => s.id === draft.source_id) : null;

  return NextResponse.json({
    ...draft,
    yt_categories: cat ? { name: cat.name, icon: cat.icon, color: cat.color } : null,
    yt_sources: src ? { name: src.name } : null,
  });
}

// PATCH /api/admin/yt-drafts/[id] - Update draft (edit, approve, reject, publish)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const { id } = await params;
  const body = await request.json();
  const { action, ...updates } = body;

  let updateData: Record<string, any> = {};

  switch (action) {
    case "approve":
      updateData = {
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: "admin",
        ...updates,
      };
      break;

    case "reject":
      updateData = {
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: "admin",
        rejection_reason: updates.rejection_reason || "Rejected by admin",
      };
      break;

    case "publish":
      updateData = {
        status: "published",
        published_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString(),
        reviewed_by: "admin",
        ...updates,
      };
      break;

    case "edit":
      const allowedFields = [
        "title", "description", "detailed_content", "category_id",
        "tags", "difficulty", "suggested_category",
      ];
      for (const key of allowedFields) {
        if (key in updates) updateData[key] = updates[key];
      }
      break;

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = updateDraft(id, updateData);
  if (!updated) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  // Commit to GitHub
  const actionLabel = action === "publish" ? "Publish" : action === "approve" ? "Approve" : action === "reject" ? "Reject" : "Edit";
  await commitSingleFile(
    "youtube-drafts.json",
    `[YouTube Pipeline] ${actionLabel}: ${updated.title}`
  );

  return NextResponse.json({ success: true, data: updated });
}

// DELETE /api/admin/yt-drafts/[id] - Delete draft
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const { id } = await params;
  const draft = getDraftById(id);
  const deleted = deleteDraft(id);

  if (!deleted) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  // Commit to GitHub
  await commitSingleFile(
    "youtube-drafts.json",
    `[YouTube Pipeline] Delete: ${draft?.title || id}`
  );

  return NextResponse.json({ success: true });
}
