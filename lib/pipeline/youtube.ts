// YouTube Data API v3 integration
// Fetches videos from channels/playlists and retrieves transcripts

import { YoutubeTranscript } from "youtube-transcript";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export type YouTubeVideo = {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnailUrl: string;
};

export type TranscriptEntry = {
  text: string;
  offset: number;
  duration: number;
};

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("Missing YOUTUBE_API_KEY environment variable");
  return key;
}

// Fetch videos from a channel (uses search endpoint)
export async function fetchChannelVideos(
  channelId: string,
  maxResults: number = 10,
  publishedAfter?: string
): Promise<YouTubeVideo[]> {
  const apiKey = getApiKey();
  const params = new URLSearchParams({
    part: "snippet",
    channelId,
    maxResults: String(maxResults),
    order: "date",
    type: "video",
    key: apiKey,
  });
  if (publishedAfter) params.set("publishedAfter", publishedAfter);

  const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`YouTube API error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    publishedAt: item.snippet.publishedAt,
    thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
  }));
}

// Fetch videos from a playlist
export async function fetchPlaylistVideos(
  playlistId: string,
  maxResults: number = 20
): Promise<YouTubeVideo[]> {
  const apiKey = getApiKey();
  const params = new URLSearchParams({
    part: "snippet",
    playlistId,
    maxResults: String(maxResults),
    key: apiKey,
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/playlistItems?${params}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`YouTube API error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    videoId: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId || "",
    publishedAt: item.snippet.publishedAt,
    thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
  }));
}

// Get transcript for a video
export async function getTranscript(videoId: string): Promise<string> {
  try {
    const entries = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
    });
    return entries.map((e: any) => e.text).join(" ");
  } catch {
    // Try without language spec
    try {
      const entries = await YoutubeTranscript.fetchTranscript(videoId);
      return entries.map((e: any) => e.text).join(" ");
    } catch (err) {
      console.warn(`No transcript available for ${videoId}:`, err);
      return "";
    }
  }
}

// Fetch videos from either channel or playlist
export async function fetchVideos(
  type: "channel" | "playlist",
  youtubeId: string,
  maxResults: number = 10,
  publishedAfter?: string
): Promise<YouTubeVideo[]> {
  if (type === "channel") {
    return fetchChannelVideos(youtubeId, maxResults, publishedAfter);
  } else {
    return fetchPlaylistVideos(youtubeId, maxResults);
  }
}
