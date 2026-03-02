import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/admin-auth";
import { searchVideos } from "@/lib/research/youtube-search";
import { readCases, getNextId } from "@/lib/cases-db";
import { updateFileViaGitHub } from "@/lib/github-file";
import { buildApprovedVideoIndex, filterAlreadyApproved } from "@/lib/research/dedup";
import { readSessions, createSession, buildSessionsPayload, addApprovedToSession } from "@/lib/research/sessions";
import { readDrafts, createDraft, buildDraftsPayload } from "@/lib/drafts";
import { getApprovedIndex, addToIndex, buildIndexPayload, rebuildIndex } from "@/lib/research/approved-index";
import type { ResearchVideo } from "@/lib/research/youtube-search";

async function guard() {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// POST: Search videos
export async function POST(req: NextRequest) {
  const err = await guard();
  if (err) return err;

  try {
    const body = await req.json();
    const { keyword, language, videoDuration, publishedAfter, publishedBefore, order, maxResults, minViews, minSubscribers, minEngagement } = body;

    if (!keyword?.trim()) {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    // Load approved index for dedup
    let approvedIds = getApprovedIndex();
    // Also merge from cases.json (in case index is stale)
    const cases = readCases();
    const caseIds = buildApprovedVideoIndex(cases);
    caseIds.forEach((id) => approvedIds.add(id));
    // Also merge draft videoIds
    const drafts = readDrafts();
    drafts.forEach((d) => { if (d.status === "draft") approvedIds.add(d.videoId); });

    // Fetch extra to compensate for expected dedup filtering
    const targetCount = maxResults || 25;
    const fetchCount = Math.min(targetCount + approvedIds.size, 50);

    // Search YouTube
    let videos = await searchVideos({
      keyword: keyword.trim(),
      maxResults: fetchCount,
      language,
      videoDuration: videoDuration || "any",
      publishedAfter,
      publishedBefore,
      order: order || "relevance",
    });

    // Apply post-fetch filters
    if (minViews) {
      videos = videos.filter((v) => parseInt(v.viewCount, 10) >= minViews);
    }
    if (minSubscribers) {
      videos = videos.filter(
        (v) => parseInt(v.channel.subscriberCount, 10) >= minSubscribers
      );
    }
    if (minEngagement) {
      videos = videos.filter((v) => v.engagementRate >= minEngagement);
    }

    // Dedup against approved index
    const { filtered, hiddenCount } = filterAlreadyApproved(videos, approvedIds);

    // Limit to target count
    const finalVideos = filtered.slice(0, targetCount);

    // Save as research session
    const session = createSession(
      keyword.trim(),
      { language, videoDuration, minViews, minSubscribers, order, publishedAfter, publishedBefore },
      finalVideos,
      videos.length,
      hiddenCount
    );

    // Save session to GitHub
    const sessions = readSessions();
    sessions.push(session);
    // Keep only last 50 sessions
    const trimmed = sessions.slice(-50);
    try {
      await updateFileViaGitHub(
        "data/research-sessions.json",
        buildSessionsPayload(trimmed),
        `[Research] Search: "${keyword.trim()}" (${finalVideos.length} videos)`
      );
    } catch (e) {
      console.warn("Failed to save session:", e);
      // Non-fatal — search still works
    }

    return NextResponse.json({
      searchId: session.id,
      sessionId: session.id,
      videos: finalVideos,
      totalFound: videos.length + hiddenCount,
      hiddenCount,
    });
  } catch (error: any) {
    console.error("Video search error:", error);
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}

// PATCH: Bulk approve videos → save to DRAFTS (not cases)
export async function PATCH(req: NextRequest) {
  const err = await guard();
  if (err) return err;

  try {
    const body = await req.json();
    const { videos, category, keyword, sessionId } = body as {
      videos: ResearchVideo[];
      category?: string;
      keyword?: string;
      sessionId?: string;
    };

    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return NextResponse.json({ error: "videos array is required" }, { status: 400 });
    }

    // Create drafts
    let drafts = readDrafts();
    const newDrafts = [];
    const approvedVideoIds: string[] = [];

    for (const video of videos) {
      // Skip if already a draft
      if (drafts.some((d) => d.videoId === video.videoId && d.status === "draft")) continue;
      const draft = createDraft(video, sessionId || "unknown");
      if (category) draft.category = category;
      newDrafts.push(draft);
      approvedVideoIds.push(video.videoId);
    }

    drafts = [...drafts, ...newDrafts];

    // Save drafts to GitHub
    await updateFileViaGitHub(
      "data/drafts.json",
      buildDraftsPayload(drafts),
      `[Drafts] Approve ${newDrafts.length} videos from "${keyword || "search"}"`
    );

    // Update approved index
    const currentIndex = rebuildIndex();
    const updatedIndex = addToIndex(currentIndex, approvedVideoIds);
    await updateFileViaGitHub(
      "data/approved-video-index.json",
      buildIndexPayload(updatedIndex),
      `[Index] Add ${approvedVideoIds.length} video(s)`
    );

    // Update session's approvedVideoIds
    if (sessionId) {
      try {
        let sessions = readSessions();
        sessions = addApprovedToSession(sessions, sessionId, approvedVideoIds);
        await updateFileViaGitHub(
          "data/research-sessions.json",
          buildSessionsPayload(sessions),
          `[Research] Mark ${approvedVideoIds.length} approved in session`
        );
      } catch (e) {
        console.warn("Failed to update session:", e);
      }
    }

    return NextResponse.json({ approved: newDrafts.length, failed: [] });
  } catch (error: any) {
    console.error("Bulk approve error:", error);
    return NextResponse.json(
      { error: error.message || "Approve failed" },
      { status: 500 }
    );
  }
}
