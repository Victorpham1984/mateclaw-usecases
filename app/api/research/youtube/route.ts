// POST /api/research/youtube - Search and score YouTube channels
// GET  /api/research/youtube - Get cached research results

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, createAuthResponse } from "@/lib/pipeline/auth";
import { discoverChannels } from "@/lib/research/youtube-search";
import { scoreChannels } from "@/lib/research/ai-scorer";
import {
  createResearch,
  updateResearch,
  getLatestResearches,
} from "@/lib/research/research-data";
import type { ResearchChannel } from "@/lib/research/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60s for AI scoring

// GET - List cached research results
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const researches = getLatestResearches(limit);
  return NextResponse.json(researches);
}

// POST - Run new research
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const body = await request.json();
  const {
    keyword,
    limit = 20,
    language = "all",
    minSubscribers = 1000,
    recentDaysFilter = 30,
  } = body;

  if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing or empty keyword" },
      { status: 400 }
    );
  }

  let research;
  try {
    // Create research entry (status: searching)
    research = createResearch(
      keyword.trim(),
      language,
      minSubscribers,
      recentDaysFilter
    );
    // Step 1: Discover channels via YouTube API
    updateResearch(research.id, { status: "searching" });

    const discovered = await discoverChannels({
      keyword: keyword.trim(),
      limit: Math.min(limit, 25),
      language,
      minSubscribers,
      recentDaysFilter,
    });

    if (discovered.length === 0) {
      const updated = updateResearch(research.id, {
        status: "completed",
        totalFound: 0,
        channels: [],
        completedAt: new Date().toISOString(),
      });
      return NextResponse.json(updated);
    }

    // Step 2: AI Score channels
    updateResearch(research.id, { status: "scoring" });

    const scores = await scoreChannels(discovered, 3);

    // Step 3: Build channel results
    const channels: ResearchChannel[] = discovered
      .map((ch) => {
        const aiScore = scores.get(ch.channelId);
        return {
          channelId: ch.channelId,
          channelName: ch.channelName,
          channelUrl: ch.channelUrl,
          channelDescription: ch.channelDescription.slice(0, 300),
          thumbnailUrl: ch.thumbnailUrl,
          subscribers: ch.subscribers,
          totalVideos: ch.totalVideos,
          recentVideos: ch.recentVideoCount,
          avgViews: ch.avgViews,
          recentVideoTitles: ch.recentVideos.map((v) => v.title),
          aiScore: aiScore?.score ?? 0,
          aiReasoning: aiScore?.reasoning ?? "",
          suggestedCategories: aiScore?.suggestedCategories ?? [],
          sampleUseCases: aiScore?.sampleUseCases ?? [],
          status: "suggested" as const,
        };
      })
      // Sort by AI score descending
      .sort((a, b) => b.aiScore - a.aiScore);

    // Step 4: Save completed research
    const updated = updateResearch(research.id, {
      status: "completed",
      totalFound: channels.length,
      channels,
      completedAt: new Date().toISOString(),
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Research pipeline failed:", err);
    if (research) {
      try {
        updateResearch(research.id, {
          status: "failed",
          error: err.message || "Unknown error",
          completedAt: new Date().toISOString(),
        });
      } catch { /* ignore write errors in error handler */ }
    }
    return NextResponse.json(
      { error: err.message || "Research pipeline failed", status: "failed" },
      { status: 500 }
    );
  }
}
