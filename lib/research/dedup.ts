// Dedup logic for video-first research
// Prevents approving the same video twice

import type { UseCase } from "../types";

export type { ResearchVideo } from "./youtube-search";

/**
 * Extract 11-char videoId from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  if (!url) return null;

  // youtube.com/watch?v=XXX
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // youtu.be/XXX
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // youtube.com/shorts/XXX
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // youtube.com/embed/XXX
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  return null;
}

/**
 * Build a Set of videoIds from existing approved UseCases
 */
export function buildApprovedVideoIndex(useCases: UseCase[]): Set<string> {
  const ids = new Set<string>();
  for (const uc of useCases) {
    if (uc.source?.url) {
      const vid = extractVideoId(uc.source.url);
      if (vid) ids.add(vid);
    }
  }
  return ids;
}

/**
 * Filter out videos that are already approved
 */
export function filterAlreadyApproved<T extends { videoId: string }>(
  videos: T[],
  approvedIds: Set<string>
): { filtered: T[]; hiddenCount: number } {
  const filtered = videos.filter((v) => !approvedIds.has(v.videoId));
  return {
    filtered,
    hiddenCount: videos.length - filtered.length,
  };
}
