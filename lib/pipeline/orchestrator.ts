// Pipeline Orchestrator
// Coordinates: fetch videos → get transcripts → extract use cases → save drafts
// Storage: file-based JSON + GitHub commits (zero Supabase)

import {
  readSources,
  updateSource,
  readDrafts,
  addDraft,
  hasVideoBeenProcessed,
  readCategories,
  getCategoryMap,
  addCrawlEntry,
  updateCrawlEntry,
  commitYouTubeData,
} from "@/lib/youtube-data";
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
  const result: PipelineResult = {
    source_id: source.id,
    source_name: source.name,
    videos_found: 0,
    videos_processed: 0,
    use_cases_created: 0,
    errors: [],
  };

  // Create crawl log entry
  const crawlLog = addCrawlEntry(source.id);

  try {
    // Fetch videos (only those after last crawl)
    const publishedAfter = source.last_crawled_at || undefined;
    const videos = await fetchVideos(source.type, source.youtube_id, 15, publishedAfter);
    result.videos_found = videos.length;

    // Filter out already-processed videos
    const newVideos = videos.filter((v) => !hasVideoBeenProcessed(v.videoId));

    // Get category map for matching
    const categoryMap = getCategoryMap();

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
          let categoryId: string | null = categoryMap.get(categoryKey) || null;

          // Try partial match
          if (!categoryId) {
            for (const [name, id] of categoryMap) {
              if (name.includes(categoryKey) || categoryKey.includes(name)) {
                categoryId = id;
                break;
              }
            }
          }

          addDraft({
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
    updateSource(source.id, { last_crawled_at: new Date().toISOString() });

    // Update crawl log
    updateCrawlEntry(crawlLog.id, {
      videos_found: result.videos_found,
      videos_processed: result.videos_processed,
      use_cases_created: result.use_cases_created,
      errors: result.errors,
      completed_at: new Date().toISOString(),
      status: "completed",
    });

    // Commit to GitHub
    if (result.use_cases_created > 0) {
      await commitYouTubeData(
        `[YouTube Pipeline] Crawl ${source.name}: ${result.use_cases_created} new drafts`
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    updateCrawlEntry(crawlLog.id, {
      errors: [{ videoId: "source-level", error: msg }],
      completed_at: new Date().toISOString(),
      status: "failed",
    });
    throw err;
  }

  return result;
}

// Run pipeline for all enabled sources
export async function runFullPipeline(): Promise<PipelineResult[]> {
  const sources = readSources().filter((s) => s.enabled);
  if (sources.length === 0) return [];

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
