import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, createAuthResponse } from "@/lib/pipeline/auth";
import {
  readDrafts,
  readCategories,
  readSources,
} from "@/lib/youtube-data";

export const dynamic = "force-dynamic";

// GET /api/admin/yt-drafts - List drafts with filters
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "draft";
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const allDrafts = readDrafts();
  const categories = readCategories();
  const sources = readSources();

  // Build lookup maps
  const catMap = new Map(categories.map((c) => [c.id, { name: c.name, icon: c.icon, color: c.color }]));
  const srcMap = new Map(sources.map((s) => [s.id, { name: s.name }]));

  // Filter
  let filtered = allDrafts;
  if (status !== "all") {
    filtered = filtered.filter((d) => d.status === status);
  }
  if (category) {
    filtered = filtered.filter((d) => d.category_id === category);
  }

  // Sort by created_at desc
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = filtered.length;
  const paged = filtered.slice(offset, offset + limit);

  // Enrich with category/source data (matching Supabase join format)
  const enriched = paged.map((d) => ({
    ...d,
    yt_categories: d.category_id ? catMap.get(d.category_id) || null : null,
    yt_sources: d.source_id ? srcMap.get(d.source_id) || null : null,
  }));

  return NextResponse.json({ data: enriched, total });
}
