// YouTube Search API wrapper for channel discovery
// Searches for channels by keyword, fetches stats and recent videos

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("Missing YOUTUBE_API_KEY environment variable");
  return key;
}

export type ChannelSearchResult = {
  channelId: string;
  channelName: string;
  channelUrl: string;
  channelDescription: string;
  thumbnailUrl: string;
};

export type ChannelStats = {
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  description: string;
  customUrl?: string;
};

export type RecentVideo = {
  videoId: string;
  title: string;
  publishedAt: string;
  description: string;
};

// ─── Search Channels by Keyword ──────────────────────────────
// YouTube API quota: 100 units per search call

export async function searchChannels(
  keyword: string,
  maxResults: number = 25,
  language?: string
): Promise<ChannelSearchResult[]> {
  const apiKey = getApiKey();
  const params = new URLSearchParams({
    part: "snippet",
    type: "channel",
    q: keyword,
    maxResults: String(Math.min(maxResults, 50)),
    order: "relevance",
    key: apiKey,
  });

  // Add language filter if specified
  if (language && language !== "all") {
    params.set("relevanceLanguage", language);
  }

  const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`YouTube Search API error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    channelId: item.snippet.channelId || item.id.channelId,
    channelName: item.snippet.title,
    channelUrl: `https://youtube.com/channel/${item.snippet.channelId || item.id.channelId}`,
    channelDescription: item.snippet.description || "",
    thumbnailUrl:
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.default?.url ||
      "",
  }));
}

// ─── Get Channel Statistics (batch) ──────────────────────────
// YouTube API quota: 1 unit per channel in batch

export async function getChannelStats(
  channelIds: string[]
): Promise<Map<string, ChannelStats>> {
  const apiKey = getApiKey();
  const result = new Map<string, ChannelStats>();

  // Batch in groups of 50 (API limit)
  for (let i = 0; i < channelIds.length; i += 50) {
    const batch = channelIds.slice(i, i + 50);
    const params = new URLSearchParams({
      part: "statistics,snippet",
      id: batch.join(","),
      key: apiKey,
    });

    const res = await fetch(`${YOUTUBE_API_BASE}/channels?${params}`);
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`YouTube Channels API error: ${res.status} - ${err}`);
    }

    const data = await res.json();
    for (const item of data.items || []) {
      result.set(item.id, {
        subscriberCount: item.statistics?.subscriberCount || "0",
        videoCount: item.statistics?.videoCount || "0",
        viewCount: item.statistics?.viewCount || "0",
        description: item.snippet?.description || "",
        customUrl: item.snippet?.customUrl,
      });
    }
  }

  return result;
}

// ─── Get Recent Videos for a Channel ─────────────────────────
// YouTube API quota: 100 units per search call

export async function getRecentVideos(
  channelId: string,
  maxResults: number = 5,
  publishedAfterDays: number = 30
): Promise<RecentVideo[]> {
  const apiKey = getApiKey();
  const publishedAfter = new Date(
    Date.now() - publishedAfterDays * 24 * 60 * 60 * 1000
  ).toISOString();

  const params = new URLSearchParams({
    part: "snippet",
    channelId,
    maxResults: String(maxResults),
    order: "date",
    type: "video",
    publishedAfter,
    key: apiKey,
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
  if (!res.ok) {
    // Don't throw - just return empty. Channel may have no recent vids
    console.warn(`Failed to get videos for ${channelId}: ${res.status}`);
    return [];
  }

  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    publishedAt: item.snippet.publishedAt,
    description: item.snippet.description || "",
  }));
}

// ─── Get Video Statistics (batch) ────────────────────────────
// YouTube API quota: 1 unit per batch call

export async function getVideoStats(
  videoIds: string[]
): Promise<Map<string, { viewCount: string; likeCount: string }>> {
  if (videoIds.length === 0) return new Map();

  const apiKey = getApiKey();
  const result = new Map<string, { viewCount: string; likeCount: string }>();

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const params = new URLSearchParams({
      part: "statistics",
      id: batch.join(","),
      key: apiKey,
    });

    const res = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);
    if (!res.ok) continue;

    const data = await res.json();
    for (const item of data.items || []) {
      result.set(item.id, {
        viewCount: item.statistics?.viewCount || "0",
        likeCount: item.statistics?.likeCount || "0",
      });
    }
  }

  return result;
}

// ─── Research Video Type ─────────────────────────────────────

export type ResearchVideo = {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  videoType: "long" | "short";
  viewCount: string;
  likeCount: string;
  commentCount: string;
  engagementRate: number;
  channel: {
    channelId: string;
    channelName: string;
    subscriberCount: string;
    channelUrl: string;
  };
};

// ─── Search Videos by Keyword ────────────────────────────────
// YouTube API quota: 100 (search) + 1 (videos.list) + 1 (channels.list) = 102 units

export async function searchVideos(opts: {
  keyword: string;
  maxResults?: number;
  language?: string;
  videoDuration?: "long" | "short" | "any";
  publishedAfter?: string;
  order?: "relevance" | "viewCount" | "date";
}): Promise<ResearchVideo[]> {
  const {
    keyword,
    maxResults = 25,
    language,
    videoDuration = "any",
    publishedAfter,
    order = "relevance",
  } = opts;
  const apiKey = getApiKey();

  // Step 1: Search for videos (100 quota units)
  const searchParams = new URLSearchParams({
    part: "snippet",
    type: "video",
    q: keyword,
    maxResults: String(Math.min(maxResults, 50)),
    order,
    key: apiKey,
  });

  if (language && language !== "all") {
    searchParams.set("relevanceLanguage", language);
  }
  if (videoDuration !== "any") {
    searchParams.set("videoDuration", videoDuration);
  }
  if (publishedAfter) {
    searchParams.set("publishedAfter", publishedAfter);
  }

  const searchRes = await fetch(`${YOUTUBE_API_BASE}/search?${searchParams}`);
  if (!searchRes.ok) {
    const err = await searchRes.text();
    throw new Error(`YouTube Search API error: ${searchRes.status} - ${err}`);
  }

  const searchData = await searchRes.json();
  const items = searchData.items || [];
  if (items.length === 0) return [];

  // Collect videoIds and channelIds
  const videoIds: string[] = [];
  const channelIds = new Set<string>();
  const snippetMap = new Map<string, any>();

  for (const item of items) {
    const videoId = item.id.videoId;
    if (!videoId) continue;
    videoIds.push(videoId);
    channelIds.add(item.snippet.channelId);
    snippetMap.set(videoId, item.snippet);
  }

  // Step 2: Get video details (statistics + contentDetails) in batch (1 quota unit)
  const videoDetailsMap = new Map<string, any>();
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const params = new URLSearchParams({
      part: "statistics,contentDetails",
      id: batch.join(","),
      key: apiKey,
    });
    const res = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);
    if (res.ok) {
      const data = await res.json();
      for (const item of data.items || []) {
        videoDetailsMap.set(item.id, {
          viewCount: item.statistics?.viewCount || "0",
          likeCount: item.statistics?.likeCount || "0",
          commentCount: item.statistics?.commentCount || "0",
          duration: item.contentDetails?.duration || "PT0S",
        });
      }
    }
  }

  // Step 3: Get channel stats in batch (1 quota unit)
  const channelStatsMap = await getChannelStats(Array.from(channelIds));

  // Step 4: Assemble ResearchVideo objects
  const results: ResearchVideo[] = [];
  for (const videoId of videoIds) {
    const snippet = snippetMap.get(videoId);
    const details = videoDetailsMap.get(videoId);
    if (!snippet || !details) continue;

    const views = parseInt(details.viewCount, 10) || 0;
    const likes = parseInt(details.likeCount, 10) || 0;
    const comments = parseInt(details.commentCount, 10) || 0;
    const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;

    // Parse ISO 8601 duration to human-readable
    const duration = parseIsoDuration(details.duration);
    const durationSeconds = parseDurationToSeconds(details.duration);
    const videoType: "long" | "short" = durationSeconds <= 60 ? "short" : "long";

    const channelId = snippet.channelId;
    const channelStats = channelStatsMap.get(channelId);

    results.push({
      videoId,
      title: snippet.title,
      description: snippet.description || "",
      thumbnailUrl:
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url ||
        "",
      publishedAt: snippet.publishedAt,
      duration,
      videoType,
      viewCount: details.viewCount,
      likeCount: details.likeCount,
      commentCount: details.commentCount,
      engagementRate: Math.round(engagementRate * 100) / 100,
      channel: {
        channelId,
        channelName: snippet.channelTitle || "",
        subscriberCount: channelStats?.subscriberCount || "0",
        channelUrl: channelStats?.customUrl
          ? `https://youtube.com/${channelStats.customUrl}`
          : `https://youtube.com/channel/${channelId}`,
      },
    });
  }

  return results;
}

// Parse ISO 8601 duration (PT1H2M3S) to human-readable (1:02:03)
function parseIsoDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const h = parseInt(match[1] || "0", 10);
  const m = parseInt(match[2] || "0", 10);
  const s = parseInt(match[3] || "0", 10);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function parseDurationToSeconds(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (
    parseInt(match[1] || "0", 10) * 3600 +
    parseInt(match[2] || "0", 10) * 60 +
    parseInt(match[3] || "0", 10)
  );
}

// ─── Full Channel Discovery Pipeline ─────────────────────────
// Orchestrates: search → stats → filter → recent videos
// Quota estimate: ~100 + 1 + (N * 100) units where N = qualifying channels

export type DiscoveredChannel = {
  channelId: string;
  channelName: string;
  channelUrl: string;
  channelDescription: string;
  thumbnailUrl: string;
  subscribers: string;
  totalVideos: string;
  recentVideos: RecentVideo[];
  recentVideoCount: number;
  avgViews: string;
};

export async function discoverChannels(opts: {
  keyword: string;
  limit?: number;
  language?: string;
  minSubscribers?: number;
  recentDaysFilter?: number;
}): Promise<DiscoveredChannel[]> {
  const {
    keyword,
    limit = 20,
    language = "all",
    minSubscribers = 1000,
    recentDaysFilter = 30,
  } = opts;

  // Step 1: Search channels by keyword (100 quota units)
  const searchResults = await searchChannels(keyword, Math.min(limit * 2, 50), language);
  if (searchResults.length === 0) return [];

  // Step 2: Get channel stats in batch (1 quota unit for all)
  const channelIds = searchResults.map((c) => c.channelId);
  const statsMap = await getChannelStats(channelIds);

  // Step 3: Filter by subscriber count
  const qualifying = searchResults.filter((channel) => {
    const stats = statsMap.get(channel.channelId);
    if (!stats) return false;
    const subs = parseInt(stats.subscriberCount, 10);
    return subs >= minSubscribers;
  });

  // Step 4: Sort by subscriber count (descending) and take top N
  const sorted = qualifying
    .sort((a, b) => {
      const subsA = parseInt(
        statsMap.get(a.channelId)?.subscriberCount || "0",
        10
      );
      const subsB = parseInt(
        statsMap.get(b.channelId)?.subscriberCount || "0",
        10
      );
      return subsB - subsA;
    })
    .slice(0, limit);

  // Step 5: Get recent videos for each channel (100 units each - expensive!)
  // To save quota, only fetch for top channels
  const maxVideoFetches = Math.min(sorted.length, 10);
  const discovered: DiscoveredChannel[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const channel = sorted[i];
    const stats = statsMap.get(channel.channelId)!;

    let recentVideos: RecentVideo[] = [];
    if (i < maxVideoFetches) {
      try {
        recentVideos = await getRecentVideos(
          channel.channelId,
          5,
          recentDaysFilter
        );
      } catch (err) {
        console.warn(`Failed to get videos for ${channel.channelName}:`, err);
      }
    }

    // Calculate avg views from recent videos
    let avgViews = "0";
    if (recentVideos.length > 0) {
      const videoIds = recentVideos.map((v) => v.videoId);
      try {
        const videoStatsMap = await getVideoStats(videoIds);
        const totalViews = Array.from(videoStatsMap.values()).reduce(
          (sum, v) => sum + parseInt(v.viewCount, 10),
          0
        );
        avgViews = String(Math.round(totalViews / videoStatsMap.size));
      } catch {
        avgViews = "0";
      }
    }

    // Use custom URL if available
    let channelUrl = channel.channelUrl;
    if (stats.customUrl) {
      channelUrl = `https://youtube.com/${stats.customUrl}`;
    }

    discovered.push({
      channelId: channel.channelId,
      channelName: channel.channelName,
      channelUrl,
      channelDescription: stats.description || channel.channelDescription,
      thumbnailUrl: channel.thumbnailUrl,
      subscribers: stats.subscriberCount,
      totalVideos: stats.videoCount,
      recentVideos,
      recentVideoCount: recentVideos.length,
      avgViews,
    });
  }

  return discovered;
}
