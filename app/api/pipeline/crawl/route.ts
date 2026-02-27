import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, createAuthResponse } from "@/lib/pipeline/auth";
import { runFullPipeline, processSingleSource } from "@/lib/pipeline/orchestrator";
import { readSources } from "@/lib/youtube-data";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min for Vercel

export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) return createAuthResponse();

  try {
    const body = await request.json().catch(() => ({}));
    const { source_id } = body;

    let results;

    if (source_id) {
      // Process single source
      const sources = readSources();
      const source = sources.find((s) => s.id === source_id);

      if (!source) {
        return NextResponse.json({ error: "Source not found" }, { status: 404 });
      }

      const result = await processSingleSource(source);
      results = [result];
    } else {
      // Process all enabled sources
      results = await runFullPipeline();
    }

    const totalUseCases = results.reduce((s, r) => s + r.use_cases_created, 0);
    const totalErrors = results.reduce((s, r) => s + r.errors.length, 0);

    return NextResponse.json({
      success: true,
      message: `Pipeline completed: ${totalUseCases} use cases created from ${results.length} sources`,
      results,
      summary: {
        sources_processed: results.length,
        total_use_cases_created: totalUseCases,
        total_errors: totalErrors,
      },
    });
  } catch (error) {
    console.error("Crawl error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Pipeline failed" },
      { status: 500 }
    );
  }
}
