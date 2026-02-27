import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Parallel queries for stats
    const [useCasesRes, categoriesRes, sourcesRes, draftsRes, recentCrawlsRes] =
      await Promise.all([
        supabase
          .from("yt_use_cases")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
        supabase
          .from("yt_categories")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("yt_sources")
          .select("id", { count: "exact", head: true })
          .eq("enabled", true),
        supabase
          .from("yt_use_cases")
          .select("id", { count: "exact", head: true })
          .eq("status", "draft"),
        supabase
          .from("yt_crawl_log")
          .select("*")
          .order("started_at", { ascending: false })
          .limit(5),
      ]);

    return NextResponse.json({
      use_cases: useCasesRes.count || 0,
      categories: categoriesRes.count || 0,
      sources: sourcesRes.count || 0,
      drafts: draftsRes.count || 0,
      recent_crawls: recentCrawlsRes.data || [],
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
