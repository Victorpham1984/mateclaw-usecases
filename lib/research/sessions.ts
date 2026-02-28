// Research session persistence — saves search results for reload-proof browsing
import { readFileSync } from "fs";
import { join } from "path";
import type { ResearchVideo } from "./youtube-search";

export type ResearchSession = {
  id: string;
  keyword: string;
  filters: {
    language?: string;
    videoDuration?: string;
    minViews?: number;
    minSubscribers?: number;
    order?: string;
  };
  videos: ResearchVideo[];
  totalFound: number;
  hiddenCount: number;
  searchedAt: string;
  approvedVideoIds: string[];
};

type SessionsFile = { sessions: ResearchSession[] };

const FILE_PATH = join(process.cwd(), "data", "research-sessions.json");

export function readSessions(): ResearchSession[] {
  try {
    const raw = readFileSync(FILE_PATH, "utf-8");
    const data: SessionsFile = JSON.parse(raw);
    return data.sessions || [];
  } catch {
    return [];
  }
}

export function getSession(id: string): ResearchSession | null {
  return readSessions().find((s) => s.id === id) || null;
}

// Note: write operations go through GitHub API (Vercel is read-only)
export function buildSessionsPayload(sessions: ResearchSession[]): string {
  return JSON.stringify({ sessions }, null, 2);
}

export function createSession(
  keyword: string,
  filters: ResearchSession["filters"],
  videos: ResearchVideo[],
  totalFound: number,
  hiddenCount: number
): ResearchSession {
  return {
    id: `rs_${Date.now()}`,
    keyword,
    filters,
    videos,
    totalFound,
    hiddenCount,
    searchedAt: new Date().toISOString(),
    approvedVideoIds: [],
  };
}

export function addApprovedToSession(
  sessions: ResearchSession[],
  sessionId: string,
  videoIds: string[]
): ResearchSession[] {
  return sessions.map((s) => {
    if (s.id !== sessionId) return s;
    const existing = new Set(s.approvedVideoIds);
    videoIds.forEach((id) => existing.add(id));
    return { ...s, approvedVideoIds: Array.from(existing) };
  });
}
