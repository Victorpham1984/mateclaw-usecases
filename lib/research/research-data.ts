// File-based data layer for YouTube Research Cache
// Uses /tmp on Vercel (read-only filesystem) with fallback to data/ for local dev

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { ResearchResult, ResearchCache, ResearchChannel } from "./types";

const IS_VERCEL = !!process.env.VERCEL;
const PROJECT_DATA_DIR = join(process.cwd(), "data");
const WRITE_DIR = IS_VERCEL ? "/tmp" : PROJECT_DATA_DIR;
const CACHE_FILE = "youtube-research-cache.json";

// On Vercel, seed /tmp cache from committed data/ if not yet copied
let _seeded = false;
function ensureWritableCache(): void {
  if (!IS_VERCEL || _seeded) return;
  _seeded = true;
  const dest = join(WRITE_DIR, CACHE_FILE);
  if (!existsSync(dest)) {
    const src = join(PROJECT_DATA_DIR, CACHE_FILE);
    if (existsSync(src)) {
      try { copyFileSync(src, dest); } catch { /* ignore */ }
    }
  }
}

function generateId(): string {
  return `res-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Read / Write ────────────────────────────────────────────

export function readResearchCache(): ResearchResult[] {
  ensureWritableCache();
  const filePath = join(WRITE_DIR, CACHE_FILE);
  if (!existsSync(filePath)) {
    // Fallback: try reading from committed data/ (read-only on Vercel)
    const fallback = join(PROJECT_DATA_DIR, CACHE_FILE);
    if (!existsSync(fallback)) return [];
    try {
      const data: ResearchCache = JSON.parse(readFileSync(fallback, "utf-8"));
      return data.researches || [];
    } catch {
      return [];
    }
  }
  try {
    const data: ResearchCache = JSON.parse(readFileSync(filePath, "utf-8"));
    return data.researches || [];
  } catch {
    return [];
  }
}

export function writeResearchCache(researches: ResearchResult[]): void {
  ensureWritableCache();
  const filePath = join(WRITE_DIR, CACHE_FILE);
  writeFileSync(filePath, JSON.stringify({ researches }, null, 2), "utf-8");
}

// ─── CRUD Operations ─────────────────────────────────────────

export function createResearch(
  keyword: string,
  language: string,
  minSubscribers: number,
  recentDaysFilter: number
): ResearchResult {
  const researches = readResearchCache();
  const research: ResearchResult = {
    id: generateId(),
    keyword,
    language,
    minSubscribers,
    recentDaysFilter,
    totalFound: 0,
    channels: [],
    searchedAt: new Date().toISOString(),
    completedAt: null,
    status: "searching",
  };
  researches.unshift(research); // newest first
  // Keep only last 50 researches
  if (researches.length > 50) researches.length = 50;
  writeResearchCache(researches);
  return research;
}

export function updateResearch(
  id: string,
  updates: Partial<ResearchResult>
): ResearchResult | null {
  const researches = readResearchCache();
  const idx = researches.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  researches[idx] = { ...researches[idx], ...updates };
  writeResearchCache(researches);
  return researches[idx];
}

export function getResearchById(id: string): ResearchResult | null {
  return readResearchCache().find((r) => r.id === id) || null;
}

export function getLatestResearches(limit: number = 10): ResearchResult[] {
  return readResearchCache().slice(0, limit);
}

// ─── Channel Status Updates ──────────────────────────────────

export function updateChannelStatus(
  researchId: string,
  channelId: string,
  status: ResearchChannel["status"]
): ResearchChannel | null {
  const researches = readResearchCache();
  const researchIdx = researches.findIndex((r) => r.id === researchId);
  if (researchIdx === -1) return null;

  const channelIdx = researches[researchIdx].channels.findIndex(
    (c) => c.channelId === channelId
  );
  if (channelIdx === -1) return null;

  const now = new Date().toISOString();
  researches[researchIdx].channels[channelIdx].status = status;
  if (status === "approved") {
    researches[researchIdx].channels[channelIdx].approvedAt = now;
  } else if (status === "rejected") {
    researches[researchIdx].channels[channelIdx].rejectedAt = now;
  }

  writeResearchCache(researches);
  return researches[researchIdx].channels[channelIdx];
}

// Find a channel across all research results
export function findChannelInResearch(
  channelId: string
): { research: ResearchResult; channel: ResearchChannel } | null {
  const researches = readResearchCache();
  for (const research of researches) {
    const channel = research.channels.find((c) => c.channelId === channelId);
    if (channel) return { research, channel };
  }
  return null;
}
