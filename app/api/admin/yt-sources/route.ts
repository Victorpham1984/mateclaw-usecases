import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, createAuthResponse } from "@/lib/pipeline/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// GET /api/admin/yt-sources - List sources
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("yt_sources")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST /api/admin/yt-sources - Create source
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const supabase = createAdminClient();
  const body = await request.json();

  if (!body.name || !body.youtube_id || !body.type) {
    return NextResponse.json(
      { error: "Missing required fields: name, youtube_id, type" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("yt_sources")
    .insert({
      name: body.name,
      type: body.type,
      youtube_id: body.youtube_id,
      url: body.url || null,
      description: body.description || null,
      enabled: body.enabled !== false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/admin/yt-sources - Update source
export async function PATCH(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const supabase = createAdminClient();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("yt_sources")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/yt-sources
export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await supabase.from("yt_sources").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
