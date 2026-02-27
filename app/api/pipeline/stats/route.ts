import { NextResponse } from "next/server";
import {
  readDrafts,
  readSources,
  readCategories,
  readCrawlLog,
} from "@/lib/youtube-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const drafts = readDrafts();
    const sources = readSources();
    const categories = readCategories();
    const crawlLog = readCrawlLog();

    const published = drafts.filter((d) => d.status === "published").length;
    const pendingDrafts = drafts.filter((d) => d.status === "draft").length;
    const activeCategories = categories.filter((c) => c.status === "active").length;
    const activeSources = sources.filter((s) => s.enabled).length;

    return NextResponse.json({
      use_cases: published,
      categories: activeCategories,
      sources: activeSources,
      drafts: pendingDrafts,
      recent_crawls: crawlLog.slice(0, 5),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
