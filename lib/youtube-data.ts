// File-based data layer for YouTube Pipeline
// Replaces Supabase with JSON files + GitHub commits

import { readFileSync, writeFileSync, copyFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");

// ─── Types ───────────────────────────────────────────────────

export type YTSource = {
  id: string;
  name: string;
  type: "channel" | "playlist";
  youtube_id: string;
  url: string | null;
  description: string | null;
  enabled: boolean;
  last_crawled_at: string | null;
  created_at: string;
};

export type YTDraft = {
  id: string;
  title: string;
  description: string;
  detailed_content: string;
  category_id: string | null;
  suggested_category: string | null;
  tags: string[];
  difficulty: string;
  source_id: string;
  source_video_id: string;
  source_video_title: string;
  source_video_url: string;
  source_channel_name: string;
  source_channel_id: string;
  source_published_at: string;
  ai_confidence: number;
  ai_model: string;
  extraction_metadata: Record<string, any>;
  status: "draft" | "approved" | "published" | "rejected";
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  published_at: string | null;
  created_at: string;
};

export type YTCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  sort_order: number;
  status: "active" | "archived" | "pending";
};

export type YTCrawlLog = {
  id: string;
  source_id: string;
  status: "running" | "completed" | "failed";
  videos_found: number;
  videos_processed: number;
  use_cases_created: number;
  errors: { videoId: string; error: string }[];
  started_at: string;
  completed_at: string | null;
};

// ─── Generic File I/O ────────────────────────────────────────

function readJsonFile<T>(filename: string, defaultValue: T): T {
  const filePath = join(DATA_DIR, filename);
  if (!existsSync(filePath)) return defaultValue;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return defaultValue;
  }
}

function writeJsonFile(filename: string, data: any): void {
  const filePath = join(DATA_DIR, filename);
  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function generateId(): string {
  return `yt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Sources ─────────────────────────────────────────────────

export function readSources(): YTSource[] {
  const data = readJsonFile<{ sources: YTSource[] }>("youtube-sources.json", { sources: [] });
  return data.sources;
}

export function writeSources(sources: YTSource[]): void {
  writeJsonFile("youtube-sources.json", { sources });
}

export function addSource(input: Omit<YTSource, "id" | "created_at" | "last_crawled_at">): YTSource {
  const sources = readSources();
  const source: YTSource = {
    ...input,
    id: generateId(),
    last_crawled_at: null,
    created_at: new Date().toISOString(),
  };
  sources.push(source);
  writeSources(sources);
  return source;
}

export function updateSource(id: string, updates: Partial<YTSource>): YTSource | null {
  const sources = readSources();
  const idx = sources.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  sources[idx] = { ...sources[idx], ...updates };
  writeSources(sources);
  return sources[idx];
}

export function deleteSource(id: string): boolean {
  const sources = readSources();
  const filtered = sources.filter((s) => s.id !== id);
  if (filtered.length === sources.length) return false;
  writeSources(filtered);
  return true;
}

// ─── Drafts (Use Cases) ─────────────────────────────────────

export function readDrafts(): YTDraft[] {
  const data = readJsonFile<{ drafts: YTDraft[] }>("youtube-drafts.json", { drafts: [] });
  return data.drafts;
}

export function writeDrafts(drafts: YTDraft[]): void {
  writeJsonFile("youtube-drafts.json", { drafts });
}

export function addDraft(input: Omit<YTDraft, "id" | "created_at" | "reviewed_at" | "reviewed_by" | "rejection_reason" | "published_at">): YTDraft {
  const drafts = readDrafts();
  const draft: YTDraft = {
    ...input,
    id: generateId(),
    reviewed_at: null,
    reviewed_by: null,
    rejection_reason: null,
    published_at: null,
    created_at: new Date().toISOString(),
  };
  drafts.push(draft);
  writeDrafts(drafts);
  return draft;
}

export function updateDraft(id: string, updates: Partial<YTDraft>): YTDraft | null {
  const drafts = readDrafts();
  const idx = drafts.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  drafts[idx] = { ...drafts[idx], ...updates };
  writeDrafts(drafts);
  return drafts[idx];
}

export function deleteDraft(id: string): boolean {
  const drafts = readDrafts();
  const filtered = drafts.filter((d) => d.id !== id);
  if (filtered.length === drafts.length) return false;
  writeDrafts(filtered);
  return true;
}

export function getDraftById(id: string): YTDraft | null {
  return readDrafts().find((d) => d.id === id) || null;
}

export function getDraftsByStatus(status: string): YTDraft[] {
  const drafts = readDrafts();
  if (status === "all") return drafts;
  return drafts.filter((d) => d.status === status);
}

export function hasVideoBeenProcessed(videoId: string): boolean {
  const drafts = readDrafts();
  return drafts.some((d) => d.source_video_id === videoId);
}

// ─── Categories ──────────────────────────────────────────────

export function readCategories(): YTCategory[] {
  const data = readJsonFile<{ categories: YTCategory[] }>("youtube-categories.json", { categories: [] });
  return data.categories;
}

export function writeCategories(categories: YTCategory[]): void {
  writeJsonFile("youtube-categories.json", { categories });
}

export function addCategory(input: { name: string; icon?: string; color?: string; description?: string; status?: string }): YTCategory {
  const categories = readCategories();
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const cat: YTCategory = {
    id: generateId(),
    name: input.name,
    slug,
    description: input.description || null,
    icon: input.icon || "📁",
    color: input.color || "#60a5fa",
    sort_order: categories.length + 1,
    status: (input.status as any) || "active",
  };
  categories.push(cat);
  writeCategories(categories);
  return cat;
}

export function updateCategory(id: string, updates: Partial<YTCategory>): YTCategory | null {
  const categories = readCategories();
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  categories[idx] = { ...categories[idx], ...updates };
  writeCategories(categories);
  return categories[idx];
}

export function getCategoryMap(): Map<string, string> {
  const categories = readCategories().filter((c) => c.status === "active");
  return new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
}

// ─── Crawl Log ───────────────────────────────────────────────

export function readCrawlLog(): YTCrawlLog[] {
  const data = readJsonFile<{ crawls: YTCrawlLog[] }>("youtube-crawl-log.json", { crawls: [] });
  return data.crawls;
}

export function writeCrawlLog(crawls: YTCrawlLog[]): void {
  writeJsonFile("youtube-crawl-log.json", { crawls });
}

export function addCrawlEntry(source_id: string): YTCrawlLog {
  const crawls = readCrawlLog();
  const entry: YTCrawlLog = {
    id: generateId(),
    source_id,
    status: "running",
    videos_found: 0,
    videos_processed: 0,
    use_cases_created: 0,
    errors: [],
    started_at: new Date().toISOString(),
    completed_at: null,
  };
  crawls.unshift(entry); // newest first
  // Keep only last 50 entries
  if (crawls.length > 50) crawls.length = 50;
  writeCrawlLog(crawls);
  return entry;
}

export function updateCrawlEntry(id: string, updates: Partial<YTCrawlLog>): void {
  const crawls = readCrawlLog();
  const idx = crawls.findIndex((c) => c.id === id);
  if (idx !== -1) {
    crawls[idx] = { ...crawls[idx], ...updates };
    writeCrawlLog(crawls);
  }
}

// ─── GitHub Commit Helper ────────────────────────────────────

const OWNER = "Victorpham1984";
const REPO = "mateclaw-usecases";

export async function commitFileToGitHub(
  filePath: string,
  commitMessage: string
): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn("GITHUB_TOKEN not set, skipping commit");
    return;
  }

  const apiBase = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };

  // 1. Get current file SHA
  const getRes = await fetch(apiBase, { headers });
  let currentSHA: string | undefined;
  if (getRes.ok) {
    const fileData = await getRes.json();
    currentSHA = fileData.sha;
  }

  // 2. Read local file content
  const localPath = join(DATA_DIR, filePath.replace("data/", ""));
  const content = readFileSync(localPath, "utf-8");
  const base64Content = Buffer.from(content).toString("base64");

  // 3. Commit via GitHub API
  const body: any = {
    message: commitMessage,
    content: base64Content,
    branch: "main",
  };
  if (currentSHA) body.sha = currentSHA;

  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const error = await putRes.text();
    console.error(`GitHub commit failed for ${filePath}: ${putRes.status} ${error}`);
  }
}

// Commit multiple YouTube pipeline files at once
export async function commitYouTubeData(commitMessage: string): Promise<boolean> {
  try {
    // Commit all YouTube data files
    const files = [
      "data/youtube-drafts.json",
      "data/youtube-sources.json",
      "data/youtube-categories.json",
      "data/youtube-crawl-log.json",
    ];

    for (const file of files) {
      await commitFileToGitHub(file, commitMessage);
    }
    return true;
  } catch (err) {
    console.error("GitHub commit failed:", err);
    return false;
  }
}

// Commit a specific YouTube data file
export async function commitSingleFile(
  filename: string,
  commitMessage: string
): Promise<boolean> {
  try {
    await commitFileToGitHub(`data/${filename}`, commitMessage);
    return true;
  } catch (err) {
    console.error(`GitHub commit failed for ${filename}:`, err);
    return false;
  }
}

// ─── GitHub-Direct Source Addition (Vercel-safe, no local FS writes) ─

/**
 * Add a source directly via GitHub API - reads current sources from GitHub,
 * appends the new source, and commits. Works on Vercel (no EROFS).
 */
export async function addSourceViaGitHub(
  input: Omit<YTSource, "id" | "created_at" | "last_crawled_at">,
  commitMessage: string
): Promise<YTSource> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not configured");

  const filePath = "data/youtube-sources.json";
  const apiBase = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };

  // 1. Read current file from GitHub
  const getRes = await fetch(apiBase, { headers });
  let currentSources: YTSource[] = [];
  let currentSHA: string | undefined;

  if (getRes.ok) {
    const fileData = await getRes.json();
    currentSHA = fileData.sha;
    try {
      const content = Buffer.from(fileData.content, "base64").toString("utf-8");
      const parsed = JSON.parse(content);
      currentSources = parsed.sources || [];
    } catch {
      currentSources = [];
    }
  }

  // 2. Create new source
  const source: YTSource = {
    ...input,
    id: `yt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    last_crawled_at: null,
    created_at: new Date().toISOString(),
  };

  // 3. Check for duplicates
  const exists = currentSources.some((s) => s.youtube_id === source.youtube_id);
  if (exists) {
    throw new Error(`Source with youtube_id "${source.youtube_id}" already exists`);
  }

  currentSources.push(source);

  // 4. Commit updated file to GitHub
  const newContent = JSON.stringify({ sources: currentSources }, null, 2);
  const base64Content = Buffer.from(newContent).toString("base64");

  const body: any = {
    message: commitMessage,
    content: base64Content,
    branch: "main",
  };
  if (currentSHA) body.sha = currentSHA;

  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const error = await putRes.text();
    throw new Error(`GitHub commit failed: ${putRes.status} ${error}`);
  }

  return source;
}
