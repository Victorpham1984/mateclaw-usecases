import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, createAuthResponse } from "@/lib/pipeline/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// GET /api/admin/yt-drafts - List drafts with filters
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "draft";
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("yt_use_cases")
    .select("*, yt_categories(name, icon, color), yt_sources(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status !== "all") {
    query = query.eq("status", status);
  }
  if (category) {
    query = query.eq("category_id", category);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, total: count });
}
