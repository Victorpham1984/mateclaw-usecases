// Pipeline Orchestrator
// Coordinates: fetch videos → get transcripts → extract use cases → save drafts

import { createAdminClient } from "@/lib/supabase/admin";
import { fetchVideos, getTranscript, type YouTubeVideo } from "./youtube";
import { extractUseCases, extractFromDescription } from "./extractor";

export type PipelineResult = {
  source_id: string;
  source_name: string;
  videos_found: number;
  videos_processed: number;
  use_cases_created: number;
  errors: { videoId: string; error: string }[];
};

// Run pipeline for a single source
export async function processSingleSource(source: {
  id: string;
  name: string;
  type: "channel" | "playlist";
  youtube_id: string;
  last_crawled_at: string | null;
}): Promise<PipelineResult> {
  const supabase = createAdminClient();
  const result: PipelineResult = {
    source_id: source.id,
    source_name: source.name,
    videos_found: 0,
    videos_processed: 0,
    use_cases_created: 0,
    errors: [],
  };

  // Create crawl log entry
  const { data: crawlLog } = await supabase
    .from("yt_crawl_log")
    .insert({ source_id: source.id, status: "running" })
    .select()
    .single();

  try {
    // Fetch videos (only those after last crawl)
    const publishedAfter = source.last_crawled_at || undefined;
    const videos = await fetchVideos(source.type, source.youtube_id, 15, publishedAfter);
    result.videos_found = videos.length;

    // Get existing video IDs to skip duplicates
    const videoIds = videos.map((v) => v.videoId);
    const { data: existing } = await supabase
      .from("yt_use_cases")
      .select("source_video_id")
      .in("source_video_id", videoIds);

    const existingIds = new Set((existing || []).map((e: any) => e.source_video_id));
    const newVideos = videos.filter((v) => !existingIds.has(v.videoId));

    // Fetch categories for matching
    const { data: categories } = await supabase
      .from("yt_categories")
      .select("id, name, slug")
      .eq("status", "active");

    const categoryMap = new Map(
      (categories || []).map((c: any) => [c.name.toLowerCase(), c.id])
    );

    // Process each new video
    for (const video of newVideos) {
      try {
        // Get transcript
        const transcript = await getTranscript(video.videoId);

        // Extract use cases with AI
        let extraction;
        if (transcript && transcript.length > 50) {
          extraction = await extractUseCases(
            video.title,
            video.channelTitle,
            transcript,
            video.description
          );
        } else {
          extraction = await extractFromDescription(
            video.title,
            video.channelTitle,
            video.description
          );
        }

        // Save each use case as draft
        for (const uc of extraction.use_cases) {
          // Try to match category
          const categoryKey = uc.suggested_category.toLowerCase();
          let categoryId = categoryMap.get(categoryKey) || null;

          // Try partial match
          if (!categoryId) {
            for (const [name, id] of categoryMap) {
              if (name.includes(categoryKey) || categoryKey.includes(name)) {
                categoryId = id;
                break;
              }
            }
          }

          await supabase.from("yt_use_cases").insert({
            title: uc.title,
            description: uc.description,
            detailed_content: uc.detailed_content,
            category_id: categoryId,
            suggested_category: categoryId ? null : uc.suggested_category,
            tags: uc.tags,
            difficulty: uc.difficulty,
            source_id: source.id,
            source_video_id: video.videoId,
            source_video_title: video.title,
            source_video_url: `https://www.youtube.com/watch?v=${video.videoId}`,
            source_channel_name: video.channelTitle,
            source_channel_id: video.channelId,
            source_published_at: video.publishedAt,
            ai_confidence: uc.ai_confidence,
            ai_model: extraction.model,
            extraction_metadata: {
              tokens_used: extraction.tokens_used,
              had_transcript: transcript.length > 50,
              transcript_length: transcript.length,
            },
            status: "draft",
          });

          result.use_cases_created++;
        }

        result.videos_processed++;

        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push({ videoId: video.videoId, error: msg });
        console.error(`Error processing video ${video.videoId}:`, msg);
      }
    }

    // Update source last_crawled_at
    await supabase
      .from("yt_sources")
      .update({ last_crawled_at: new Date().toISOString() })
      .eq("id", source.id);

    // Update crawl log
    if (crawlLog) {
      await supabase
        .from("yt_crawl_log")
        .update({
          videos_found: result.videos_found,
          videos_processed: result.videos_processed,
          use_cases_created: result.use_cases_created,
          errors: result.errors,
          completed_at: new Date().toISOString(),
          status: "completed",
        })
        .eq("id", crawlLog.id);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (crawlLog) {
      await supabase
        .from("yt_crawl_log")
        .update({
          errors: [{ videoId: "source-level", error: msg }],
          completed_at: new Date().toISOString(),
          status: "failed",
        })
        .eq("id", crawlLog.id);
    }
    throw err;
  }

  return result;
}

// Run pipeline for all enabled sources
export async function runFullPipeline(): Promise<PipelineResult[]> {
  const supabase = createAdminClient();

  const { data: sources, error } = await supabase
    .from("yt_sources")
    .select("*")
    .eq("enabled", true);

  if (error) throw error;
  if (!sources || sources.length === 0) return [];

  const results: PipelineResult[] = [];

  for (const source of sources) {
    try {
      const result = await processSingleSource(source);
      results.push(result);
    } catch (err) {
      console.error(`Pipeline error for source ${source.name}:`, err);
      results.push({
        source_id: source.id,
        source_name: source.name,
        videos_found: 0,
        videos_processed: 0,
        use_cases_created: 0,
        errors: [
          {
            videoId: "pipeline",
            error: err instanceof Error ? err.message : String(err),
          },
        ],
      });
    }
  }

  return results;
}
