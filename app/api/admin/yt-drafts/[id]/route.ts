import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, createAuthResponse } from "@/lib/pipeline/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// GET /api/admin/yt-drafts/[id] - Get single draft
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("yt_use_cases")
    .select("*, yt_categories(name, icon, color), yt_sources(name)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH /api/admin/yt-drafts/[id] - Update draft (edit, approve, reject, publish)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const { id } = await params;
  const supabase = createAdminClient();
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

  const { data, error } = await supabase
    .from("yt_use_cases")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

// DELETE /api/admin/yt-drafts/[id] - Delete draft
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase.from("yt_use_cases").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
