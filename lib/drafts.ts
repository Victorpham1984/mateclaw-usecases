// Draft workflow — approved videos awaiting review/publish
import { readFileSync } from "fs";
import { join } from "path";
import type { ResearchVideo } from "./research/youtube-search";
import type { UseCase } from "./types";
import { readCases, getNextId } from "./cases-db";

export type DraftCase = {
  id: string;
  videoId: string;
  fromSessionId: string;
  video: ResearchVideo;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  publishedAt?: string;
  status: "draft" | "published";
};

type DraftsFile = { drafts: DraftCase[] };

const FILE_PATH = join(process.cwd(), "data", "drafts.json");

export function readDrafts(): DraftCase[] {
  try {
    const raw = readFileSync(FILE_PATH, "utf-8");
    const data: DraftsFile = JSON.parse(raw);
    return data.drafts || [];
  } catch {
    return [];
  }
}

export function buildDraftsPayload(drafts: DraftCase[]): string {
  return JSON.stringify({ drafts }, null, 2);
}

export function createDraft(video: ResearchVideo, sessionId: string): DraftCase {
  return {
    id: `draft_${Date.now()}_${video.videoId}`,
    videoId: video.videoId,
    fromSessionId: sessionId,
    video,
    title: video.title,
    description: video.description || video.title,
    category: "automation",
    tags: ["youtube", "video-research"],
    createdAt: new Date().toISOString(),
    status: "draft",
  };
}

export function updateDraftFields(
  drafts: DraftCase[],
  id: string,
  updates: Partial<Pick<DraftCase, "title" | "description" | "category" | "tags">>
): DraftCase[] {
  return drafts.map((d) => (d.id === id ? { ...d, ...updates } : d));
}

export function draftToUseCase(draft: DraftCase, cases: UseCase[]): UseCase {
  return {
    id: getNextId(cases),
    title: `**${draft.title}**`,
    description: draft.description,
    prompt: `Watch this video and extract actionable use cases: ${draft.title}`,
    category: (draft.category as any) || "automation",
    tags: draft.tags || ["youtube", "video-research"],
    source: {
      type: "youtube",
      url: `https://www.youtube.com/watch?v=${draft.videoId}`,
      creator: draft.video.channel.channelName,
      channel: draft.video.channel.channelName,
      videoTitle: draft.title,
    },
    addedAt: new Date().toISOString().split("T")[0],
    difficulty: "beginner",
    timeEstimate: draft.video.duration,
    roi: `${formatNum(draft.video.viewCount)} views • ${draft.video.engagementRate}% engagement`,
  };
}

function formatNum(num: string): string {
  const n = parseInt(num, 10);
  if (isNaN(n)) return num;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
