// PATCH /api/research/youtube/[channelId] - Approve/reject/later a channel
// Fixed: accepts full channel data in request body (no /tmp cache dependency)

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, createAuthResponse } from "@/lib/pipeline/auth";
import { addSourceViaGitHub } from "@/lib/youtube-data";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const { channelId } = await params;
  const body = await request.json();
  const { action, channelData } = body;

  if (!action || !["approve", "reject", "later"].includes(action)) {
    return NextResponse.json(
      { error: 'Invalid action. Must be "approve", "reject", or "later"' },
      { status: 400 }
    );
  }

  // For reject/later, just acknowledge (no persistent state needed)
  if (action !== "approve") {
    return NextResponse.json({ success: true, action });
  }

  // ── Approve flow ──────────────────────────────────────────
  if (!channelData) {
    return NextResponse.json(
      { error: "Channel data required for approval" },
      { status: 400 }
    );
  }

  try {
    // Add source directly via GitHub API (Vercel-safe, no EROFS)
    const source = await addSourceViaGitHub(
      {
        name: channelData.channelName,
        type: "channel",
        youtube_id: channelId,
        url: channelData.channelUrl || `https://youtube.com/channel/${channelId}`,
        description: `[Research] ${channelData.aiReasoning || ""} (Score: ${channelData.aiScore}/100)`,
        enabled: true,
      },
      `[Research] Add source: ${channelData.channelName} (score: ${channelData.aiScore})`
    );

    return NextResponse.json({
      success: true,
      action: "approve",
      source,
    });
  } catch (err: any) {
    console.error("Failed to add source:", err);

    // Specific error for duplicates
    if (err.message?.includes("already exists")) {
      return NextResponse.json(
        { error: `Channel already exists as a source` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: `Failed to add source: ${err.message}` },
      { status: 500 }
    );
  }
}
