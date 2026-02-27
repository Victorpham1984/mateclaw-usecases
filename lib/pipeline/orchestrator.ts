// Pipeline Orchestrator
// Coordinates: fetch videos → get transcripts → extract use cases → save drafts
// Storage: All writes go through GitHub API (Vercel-safe, no EROFS)

import {
  readSourcesFromGitHub,
  readDraftsFromGitHub,
  addDraftsViaGitHub,
  updateSourceViaGitHub,
  addCrawlLogViaGitHub,
  getCategoryMap,
  type YTDraft,
  type YTCrawlLog,
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

  const startedAt = new Date().toISOString();

  try {
    // Fetch videos (only those after last crawl)
    const publishedAfter = source.last_crawled_at || undefined;
    const videos = await fetchVideos(source.type, source.youtube_id, 15, publishedAfter);
    result.videos_found = videos.length;

    // Read existing drafts from GitHub for dedup
    const existingDrafts = await readDraftsFromGitHub();
    const processedVideoIds = new Set(existingDrafts.map((d) => d.source_video_id));

    // Filter out already-processed videos
    const newVideos = videos.filter((v) => !processedVideoIds.has(v.videoId));

    if (newVideos.length === 0) {
      console.log(`No new videos for source ${source.name}`);
      // Still update last_crawled_at and log
      await updateSourceViaGitHub(
        source.id,
        { last_crawled_at: new Date().toISOString() },
        `[Pipeline] Crawl ${source.name}: no new videos`
      );
      await addCrawlLogViaGitHub({
        id: `crawl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        source_id: source.id,
        status: "completed",
        videos_found: result.videos_found,
        videos_processed: 0,
        use_cases_created: 0,
        errors: [],
        started_at: startedAt,
        completed_at: new Date().toISOString(),
      });
      return result;
    }

    // Get category map for matching
    const categoryMap = getCategoryMap();

    // Collect all drafts in memory (batch commit later)
    const draftsToAdd: Omit<YTDraft, "id" | "created_at" | "reviewed_at" | "reviewed_by" | "rejection_reason" | "published_at">[] = [];

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

        // Collect each use case for batch commit
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

          draftsToAdd.push({
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

    // Batch commit all drafts to GitHub (single commit)
    if (draftsToAdd.length > 0) {
      await addDraftsViaGitHub(
        draftsToAdd,
        `[Pipeline] Crawl ${source.name}: ${draftsToAdd.length} new drafts from ${result.videos_processed} videos`
      );
    }

    // Update source last_crawled_at via GitHub
    await updateSourceViaGitHub(
      source.id,
      { last_crawled_at: new Date().toISOString() },
      `[Pipeline] Update last_crawled_at: ${source.name}`
    );

    // Write crawl log via GitHub
    await addCrawlLogViaGitHub({
      id: `crawl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      source_id: source.id,
      status: "completed",
      videos_found: result.videos_found,
      videos_processed: result.videos_processed,
      use_cases_created: result.use_cases_created,
      errors: result.errors,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    // Try to log the failure
    try {
      await addCrawlLogViaGitHub({
        id: `crawl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        source_id: source.id,
        status: "failed",
        videos_found: result.videos_found,
        videos_processed: result.videos_processed,
        use_cases_created: result.use_cases_created,
        errors: [{ videoId: "source-level", error: msg }],
        started_at: startedAt,
        completed_at: new Date().toISOString(),
      });
    } catch (logErr) {
      console.error("Failed to write crawl log:", logErr);
    }

    throw err;
  }

  return result;
}

// Run pipeline for all enabled sources
export async function runFullPipeline(): Promise<PipelineResult[]> {
  // Read sources from GitHub (not bundled file) for accuracy
  const sources = (await readSourcesFromGitHub()).filter((s) => s.enabled);
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
