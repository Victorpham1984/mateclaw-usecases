// Draft workflow — approved content awaiting review/publish
// Source-agnostic: supports youtube, x, reddit, github
import { readFileSync } from "fs";
import { join } from "path";
import type { ResearchVideo } from "./research/youtube-search";
import type { UseCase } from "./types";
import { readCases, getNextId } from "./cases-db";

export type SourceType = "youtube" | "x" | "reddit" | "github";

export type DraftCase = {
  id: string;
  // Multi-source fields
  sourceType: SourceType;
  contentId: string; // generic content identifier
  videoId: string; // kept for backward compat (= contentId for youtube)
  fromSessionId: string;
  video: ResearchVideo; // TODO: generalize to `sourceData` in future
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  publishedAt?: string;
  status: "draft" | "published";
  // AI-generated fields
  summary?: string;
  prompt?: string;
  transcript?: string;
  transcriptSource?: "captions" | "description-only";
  aiGenerated?: boolean;
  difficulty?: "beginner" | "intermediate" | "expert";
  timeEstimate?: string;
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
    sourceType: "youtube",
    contentId: video.videoId,
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
  updates: Partial<Pick<DraftCase, "title" | "description" | "category" | "tags" | "summary" | "prompt" | "transcript" | "transcriptSource" | "aiGenerated" | "difficulty" | "timeEstimate">>
): DraftCase[] {
  return drafts.map((d) => (d.id === id ? { ...d, ...updates } : d));
}

export function draftToUseCase(draft: DraftCase, cases: UseCase[]): UseCase {
  const prompt = draft.prompt || `Watch this video and extract actionable use cases: ${draft.title}`;
  const summary = draft.summary || draft.description;

  return {
    id: getNextId(cases),
    title: `**${draft.title}**`,
    description: summary,
    prompt,
    category: (draft.category as any) || "automation",
    tags: draft.tags || ["youtube", "video-research"],
    source: {
      type: draft.sourceType || "youtube",
      url: buildSourceUrl(draft),
      creator: draft.video?.channel?.channelName,
      channel: draft.video?.channel?.channelName,
      videoTitle: draft.title,
    },
    addedAt: new Date().toISOString().split("T")[0],
    difficulty: draft.difficulty || "beginner",
    timeEstimate: draft.timeEstimate || draft.video?.duration,
    roi: draft.video ? `${formatNum(draft.video.viewCount)} views • ${draft.video.engagementRate}% engagement` : undefined,
  };
}

function buildSourceUrl(draft: DraftCase): string {
  switch (draft.sourceType) {
    case "youtube":
      return `https://www.youtube.com/watch?v=${draft.contentId || draft.videoId}`;
    case "github":
      return draft.video?.channel?.channelUrl || `https://github.com/${draft.contentId}`;
    default:
      return draft.video?.channel?.channelUrl || "";
  }
}

function formatNum(num: string): string {
  const n = parseInt(num, 10);
  if (isNaN(n)) return num;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
