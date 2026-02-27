import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, createAuthResponse } from "@/lib/pipeline/auth";
import {
  readSources,
  addSourceViaGitHub,
  updateSourceViaGitHub,
  deleteSourceViaGitHub,
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

// POST /api/admin/yt-sources - Create source (via GitHub API)
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  try {
    const body = await request.json();

    if (!body.name || !body.youtube_id || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields: name, youtube_id, type" },
        { status: 400 }
      );
    }

    const source = await addSourceViaGitHub(
      {
        name: body.name,
        type: body.type,
        youtube_id: body.youtube_id,
        url: body.url || null,
        description: body.description || null,
        enabled: body.enabled !== false,
      },
      `[YouTube Pipeline] Add source: ${body.name}`
    );

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error("Failed to add source:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add source" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/yt-sources - Update source (via GitHub API)
export async function PATCH(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const updated = await updateSourceViaGitHub(id, updates);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update source:", error);
    const msg = error instanceof Error ? error.message : "Failed to update source";
    const status = msg.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

// DELETE /api/admin/yt-sources
export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const deleted = await deleteSourceViaGitHub(id);
    if (!deleted) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete source:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete source" },
      { status: 500 }
    );
  }
}
