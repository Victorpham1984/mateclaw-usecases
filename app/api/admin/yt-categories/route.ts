import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, createAuthResponse } from "@/lib/pipeline/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// GET /api/admin/yt-categories - List categories
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("yt_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also get use case count per category
  const { data: counts } = await supabase
    .from("yt_use_cases")
    .select("category_id")
    .in("status", ["draft", "approved", "published"]);

  const countMap: Record<string, number> = {};
  (counts || []).forEach((c: any) => {
    if (c.category_id) {
      countMap[c.category_id] = (countMap[c.category_id] || 0) + 1;
    }
  });

  const enriched = (data || []).map((cat: any) => ({
    ...cat,
    use_case_count: countMap[cat.id] || 0,
  }));

  return NextResponse.json(enriched);
}

// POST /api/admin/yt-categories - Create category
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const supabase = createAdminClient();
  const body = await request.json();

  const slug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { data, error } = await supabase
    .from("yt_categories")
    .insert({
      name: body.name,
      slug,
      description: body.description || null,
      icon: body.icon || "📁",
      color: body.color || "#60a5fa",
      status: body.status || "active",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/admin/yt-categories - Update category
export async function PATCH(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const supabase = createAdminClient();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // If merging into another category
  if (updates.merge_into) {
    await supabase
      .from("yt_use_cases")
      .update({ category_id: updates.merge_into })
      .eq("category_id", id);

    await supabase
      .from("yt_categories")
      .update({ status: "archived" })
      .eq("id", id);

    return NextResponse.json({ success: true, merged: true });
  }

  const { data, error } = await supabase
    .from("yt_categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
