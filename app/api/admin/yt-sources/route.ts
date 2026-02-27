import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, createAuthResponse } from "@/lib/pipeline/auth";
import {
  readSources,
  addSource,
  updateSource,
  deleteSource,
  commitSingleFile,
} from "@/lib/youtube-data";

export const dynamic = "force-dynamic";

// GET /api/admin/yt-sources - List sources
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const sources = readSources();
  // Sort by created_at desc
  sources.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(sources);
}

// POST /api/admin/yt-sources - Create source
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const body = await request.json();

  if (!body.name || !body.youtube_id || !body.type) {
    return NextResponse.json(
      { error: "Missing required fields: name, youtube_id, type" },
      { status: 400 }
    );
  }

  const source = addSource({
    name: body.name,
    type: body.type,
    youtube_id: body.youtube_id,
    url: body.url || null,
    description: body.description || null,
    enabled: body.enabled !== false,
  });

  // Commit to GitHub
  await commitSingleFile(
    "youtube-sources.json",
    `[YouTube Pipeline] Add source: ${source.name}`
  );

  return NextResponse.json(source, { status: 201 });
}

// PATCH /api/admin/yt-sources - Update source
export async function PATCH(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const updated = updateSource(id, updates);
  if (!updated) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  // Commit to GitHub
  await commitSingleFile(
    "youtube-sources.json",
    `[YouTube Pipeline] Update source: ${updated.name}`
  );

  return NextResponse.json(updated);
}

// DELETE /api/admin/yt-sources
export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const deleted = deleteSource(id);
  if (!deleted) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  // Commit to GitHub
  await commitSingleFile(
    "youtube-sources.json",
    `[YouTube Pipeline] Delete source: ${id}`
  );

  return NextResponse.json({ success: true });
}
