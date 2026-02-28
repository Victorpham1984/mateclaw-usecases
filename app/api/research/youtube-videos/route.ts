import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/admin-auth";
import { searchVideos } from "@/lib/research/youtube-search";
import { readCases, addCase, getNextId } from "@/lib/cases-db";
import { updateCasesViaGitHub } from "@/lib/github";
import { buildApprovedVideoIndex, filterAlreadyApproved } from "@/lib/research/dedup";
import type { UseCase } from "@/lib/types";
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
    const { keyword, language, videoDuration, publishedAfter, order, maxResults, minViews, minSubscribers, minEngagement } = body;

    if (!keyword?.trim()) {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    // Search YouTube
    let videos = await searchVideos({
      keyword: keyword.trim(),
      maxResults: maxResults || 25,
      language,
      videoDuration: videoDuration || "any",
      publishedAfter,
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

    // Dedup against existing cases
    const cases = readCases();
    const approvedIds = buildApprovedVideoIndex(cases);
    const { filtered, hiddenCount } = filterAlreadyApproved(videos, approvedIds);

    return NextResponse.json({
      searchId: `vs_${Date.now()}`,
      videos: filtered,
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

// PATCH: Bulk approve videos
export async function PATCH(req: NextRequest) {
  const err = await guard();
  if (err) return err;

  try {
    const body = await req.json();
    const { videos, category, keyword } = body as {
      videos: ResearchVideo[];
      category?: string;
      keyword?: string;
    };

    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return NextResponse.json({ error: "videos array is required" }, { status: 400 });
    }

    let cases = readCases();
    const approved: string[] = [];
    const failed: string[] = [];

    for (const video of videos) {
      try {
        const newCase: UseCase = {
          id: getNextId(cases),
          title: `**${video.title}**`,
          description: video.description || video.title,
          prompt: `Watch this video and extract actionable use cases: ${video.title}`,
          category: (category as any) || "automation",
          tags: ["youtube", "video-research"],
          source: {
            type: "youtube",
            url: `https://www.youtube.com/watch?v=${video.videoId}`,
            creator: video.channel.channelName,
            channel: video.channel.channelName,
            videoTitle: video.title,
          },
          addedAt: new Date().toISOString().split("T")[0],
          difficulty: "beginner",
          timeEstimate: video.duration,
          roi: `${formatNumber(video.viewCount)} views • ${video.engagementRate}% engagement`,
        };
        cases.push(newCase);
        approved.push(video.videoId);
      } catch (e: any) {
        failed.push(video.videoId);
      }
    }

    // Commit to GitHub (no local file writes — Vercel is read-only)
    if (approved.length > 0) {
      await updateCasesViaGitHub(
        cases,
        `[Research] Approve videos: ${keyword || "search"} (${approved.length} videos)`
      );
    }

    return NextResponse.json({ approved: approved.length, failed });
  } catch (error: any) {
    console.error("Bulk approve error:", error);
    return NextResponse.json(
      { error: error.message || "Approve failed" },
      { status: 500 }
    );
  }
}

function formatNumber(num: string): string {
  const n = parseInt(num, 10);
  if (isNaN(n)) return num;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
