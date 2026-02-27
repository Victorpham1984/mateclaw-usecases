// PATCH /api/research/youtube/[channelId] - Approve/reject/later a channel
// Actions: approve, reject, later

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, createAuthResponse } from "@/lib/pipeline/auth";
import {
  updateChannelStatus,
  findChannelInResearch,
} from "@/lib/research/research-data";
import {
  addSource,
  commitSingleFile,
} from "@/lib/youtube-data";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const { channelId } = await params;
  const body = await request.json();
  const { action, researchId } = body;

  if (!action || !["approve", "reject", "later"].includes(action)) {
    return NextResponse.json(
      { error: 'Invalid action. Must be "approve", "reject", or "later"' },
      { status: 400 }
    );
  }

  // Find the channel in research cache
  const found = findChannelInResearch(channelId);
  if (!found) {
    return NextResponse.json(
      { error: "Channel not found in research cache" },
      { status: 404 }
    );
  }

  const { research, channel } = found;
  const targetResearchId = researchId || research.id;

  // Update channel status
  const updated = updateChannelStatus(
    targetResearchId,
    channelId,
    action as "approved" | "rejected" | "later"
  );

  if (!updated) {
    return NextResponse.json(
      { error: "Failed to update channel status" },
      { status: 500 }
    );
  }

  // If approved, add to YouTube sources
  if (action === "approve") {
    try {
      const source = addSource({
        name: channel.channelName,
        type: "channel",
        youtube_id: channelId,
        url: channel.channelUrl,
        description: `[Research] ${channel.aiReasoning} (Score: ${channel.aiScore}/100)`,
        enabled: true,
      });

      // Commit to GitHub
      await commitSingleFile(
        "youtube-sources.json",
        `[Research] Add source: ${channel.channelName} (score: ${channel.aiScore})`
      );

      // Also commit updated research cache
      await commitSingleFile(
        "youtube-research-cache.json",
        `[Research] Approved: ${channel.channelName}`
      );

      return NextResponse.json({
        success: true,
        action: "approve",
        channel: updated,
        source,
      });
    } catch (err: any) {
      console.error("Failed to add source:", err);
      return NextResponse.json(
        { error: `Approved but failed to add source: ${err.message}` },
        { status: 500 }
      );
    }
  }

  // For reject/later, just commit the cache update
  try {
    await commitSingleFile(
      "youtube-research-cache.json",
      `[Research] ${action === "reject" ? "Rejected" : "Deferred"}: ${channel.channelName}`
    );
  } catch {
    // Non-critical, don't fail the request
  }

  return NextResponse.json({
    success: true,
    action,
    channel: updated,
  });
}
