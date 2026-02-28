// Approved video index — fast dedup lookup before search
import { readFileSync } from "fs";
import { join } from "path";
import { readCases } from "../cases-db";
import { extractVideoId } from "./dedup";

type IndexFile = { videoIds: string[]; lastUpdated: string };

const FILE_PATH = join(process.cwd(), "data", "approved-video-index.json");

export function getApprovedIndex(): Set<string> {
  try {
    const raw = readFileSync(FILE_PATH, "utf-8");
    const data: IndexFile = JSON.parse(raw);
    return new Set(data.videoIds || []);
  } catch {
    return new Set();
  }
}

export function rebuildIndex(): { videoIds: string[]; lastUpdated: string } {
  const cases = readCases();
  const ids = new Set<string>();
  for (const uc of cases) {
    if (uc.source?.url) {
      const vid = extractVideoId(uc.source.url);
      if (vid) ids.add(vid);
    }
  }
  // Also include drafts
  try {
    const draftsRaw = readFileSync(join(process.cwd(), "data", "drafts.json"), "utf-8");
    const draftsData = JSON.parse(draftsRaw);
    for (const d of draftsData.drafts || []) {
      if (d.videoId) ids.add(d.videoId);
    }
  } catch {}

  return {
    videoIds: Array.from(ids),
    lastUpdated: new Date().toISOString(),
  };
}

export function addToIndex(
  current: { videoIds: string[]; lastUpdated: string },
  newIds: string[]
): { videoIds: string[]; lastUpdated: string } {
  const set = new Set(current.videoIds);
  newIds.forEach((id) => set.add(id));
  return { videoIds: Array.from(set), lastUpdated: new Date().toISOString() };
}

export function buildIndexPayload(index: { videoIds: string[]; lastUpdated: string }): string {
  return JSON.stringify(index, null, 2);
}
