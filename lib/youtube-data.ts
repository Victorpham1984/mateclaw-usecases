// File-based data layer for YouTube Pipeline
// Reads from bundled JSON files; writes via GitHub API (Vercel-safe, no EROFS)

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");

// ─── GitHub Config ───────────────────────────────────────────
const GITHUB_OWNER = "Victorpham1984";
const GITHUB_REPO = "mateclaw-usecases";
const GITHUB_BRANCH = "main";

function getGitHubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not configured");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };
}

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

// ─── Generic File I/O (read-only on Vercel, read-write locally) ─

function readJsonFile<T>(filename: string, defaultValue: T): T {
  const filePath = join(DATA_DIR, filename);
  if (!existsSync(filePath)) return defaultValue;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return defaultValue;
  }
}

function writeJsonFileLocal(filename: string, data: any): void {
  try {
    const filePath = join(DATA_DIR, filename);
    writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err: any) {
    // EROFS on Vercel - ignore, we use GitHub API for writes
    if (err.code === "EROFS") {
      console.warn(`Local write skipped (EROFS): ${filename}`);
    } else {
      throw err;
    }
  }
}

function generateId(): string {
  return `yt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── GitHub API Helpers ──────────────────────────────────────

/**
 * Read a JSON file directly from GitHub (latest committed version).
 * Used for write operations that need the latest SHA.
 */
async function readFileFromGitHub<T>(
  filePath: string,
  defaultValue: T
): Promise<{ data: T; sha: string }> {
  const headers = getGitHubHeaders();
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;

  const res = await fetch(apiUrl, { headers });
  if (!res.ok) {
    if (res.status === 404) {
      return { data: defaultValue, sha: "" };
    }
    throw new Error(`GitHub read failed: ${res.status} ${await res.text()}`);
  }

  const fileData = await res.json();
  try {
    const content = Buffer.from(fileData.content, "base64").toString("utf-8");
    return { data: JSON.parse(content), sha: fileData.sha };
  } catch {
    return { data: defaultValue, sha: fileData.sha };
  }
}

/**
 * Write a JSON file directly to GitHub via commit.
 */
async function writeFileToGitHub(
  filePath: string,
  data: any,
  commitMessage: string,
  sha?: string
): Promise<void> {
  const headers = getGitHubHeaders();
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

  // Get current SHA if not provided
  if (!sha) {
    const getRes = await fetch(`${apiUrl}?ref=${GITHUB_BRANCH}`, { headers });
    if (getRes.ok) {
      const fileInfo = await getRes.json();
      sha = fileInfo.sha;
    }
  }

  const body: any = {
    message: commitMessage,
    content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const error = await putRes.text();
    throw new Error(`GitHub commit failed for ${filePath}: ${putRes.status} ${error}`);
  }
}

// ─── Sources (Local Read) ────────────────────────────────────

export function readSources(): YTSource[] {
  const data = readJsonFile<{ sources: YTSource[] }>("youtube-sources.json", { sources: [] });
  return data.sources;
}

// ─── Sources (GitHub Write) ──────────────────────────────────

/**
 * Add a source directly via GitHub API (Vercel-safe, no EROFS).
 */
export async function addSourceViaGitHub(
  input: Omit<YTSource, "id" | "created_at" | "last_crawled_at">,
  commitMessage: string
): Promise<YTSource> {
  const { data: parsed, sha } = await readFileFromGitHub<{ sources: YTSource[] }>(
    "data/youtube-sources.json",
    { sources: [] }
  );

  const source: YTSource = {
    ...input,
    id: generateId(),
    last_crawled_at: null,
    created_at: new Date().toISOString(),
  };

  // Check for duplicates
  if (parsed.sources.some((s) => s.youtube_id === source.youtube_id)) {
    throw new Error(`Source with youtube_id "${source.youtube_id}" already exists`);
  }

  parsed.sources.push(source);
  await writeFileToGitHub("data/youtube-sources.json", parsed, commitMessage, sha);
  return source;
}

/**
 * Update a source directly via GitHub API.
 */
export async function updateSourceViaGitHub(
  id: string,
  updates: Partial<YTSource>,
  commitMessage?: string
): Promise<YTSource> {
  const { data: parsed, sha } = await readFileFromGitHub<{ sources: YTSource[] }>(
    "data/youtube-sources.json",
    { sources: [] }
  );

  const idx = parsed.sources.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error(`Source not found: ${id}`);

  parsed.sources[idx] = { ...parsed.sources[idx], ...updates };
  const msg = commitMessage || `[Pipeline] Update source: ${parsed.sources[idx].name}`;
  await writeFileToGitHub("data/youtube-sources.json", parsed, msg, sha);
  return parsed.sources[idx];
}

/**
 * Delete a source directly via GitHub API.
 */
export async function deleteSourceViaGitHub(id: string): Promise<boolean> {
  const { data: parsed, sha } = await readFileFromGitHub<{ sources: YTSource[] }>(
    "data/youtube-sources.json",
    { sources: [] }
  );

  const before = parsed.sources.length;
  parsed.sources = parsed.sources.filter((s) => s.id !== id);
  if (parsed.sources.length === before) return false;

  await writeFileToGitHub(
    "data/youtube-sources.json",
    parsed,
    `[Pipeline] Delete source: ${id}`,
    sha
  );
  return true;
}

// ─── Drafts (Local Read) ────────────────────────────────────

export function readDrafts(): YTDraft[] {
  const data = readJsonFile<{ drafts: YTDraft[] }>("youtube-drafts.json", { drafts: [] });
  return data.drafts;
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

// ─── Drafts (GitHub Write) ──────────────────────────────────

/**
 * Add multiple drafts in a single GitHub commit (batch, Vercel-safe).
 */
export async function addDraftsViaGitHub(
  inputs: Omit<YTDraft, "id" | "created_at" | "reviewed_at" | "reviewed_by" | "rejection_reason" | "published_at">[],
  commitMessage: string
): Promise<YTDraft[]> {
  const { data: parsed, sha } = await readFileFromGitHub<{ drafts: YTDraft[] }>(
    "data/youtube-drafts.json",
    { drafts: [] }
  );

  const newDrafts: YTDraft[] = inputs.map((input) => ({
    ...input,
    id: generateId(),
    reviewed_at: null,
    reviewed_by: null,
    rejection_reason: null,
    published_at: null,
    created_at: new Date().toISOString(),
  }));

  parsed.drafts.push(...newDrafts);
  await writeFileToGitHub("data/youtube-drafts.json", parsed, commitMessage, sha);
  return newDrafts;
}

/**
 * Add a single draft via GitHub API.
 */
export async function addDraftViaGitHub(
  input: Omit<YTDraft, "id" | "created_at" | "reviewed_at" | "reviewed_by" | "rejection_reason" | "published_at">,
  commitMessage?: string
): Promise<YTDraft> {
  const msg = commitMessage || `[Pipeline] Add draft: ${input.title}`;
  const [draft] = await addDraftsViaGitHub([input], msg);
  return draft;
}

/**
 * Update a draft via GitHub API.
 */
export async function updateDraftViaGitHub(
  id: string,
  updates: Partial<YTDraft>,
  commitMessage?: string
): Promise<YTDraft> {
  const { data: parsed, sha } = await readFileFromGitHub<{ drafts: YTDraft[] }>(
    "data/youtube-drafts.json",
    { drafts: [] }
  );

  const idx = parsed.drafts.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error(`Draft not found: ${id}`);

  parsed.drafts[idx] = { ...parsed.drafts[idx], ...updates };
  const msg = commitMessage || `[Pipeline] Update draft: ${parsed.drafts[idx].title}`;
  await writeFileToGitHub("data/youtube-drafts.json", parsed, msg, sha);
  return parsed.drafts[idx];
}

/**
 * Delete a draft via GitHub API.
 */
export async function deleteDraftViaGitHub(
  id: string,
  commitMessage?: string
): Promise<boolean> {
  const { data: parsed, sha } = await readFileFromGitHub<{ drafts: YTDraft[] }>(
    "data/youtube-drafts.json",
    { drafts: [] }
  );

  const draft = parsed.drafts.find((d) => d.id === id);
  const before = parsed.drafts.length;
  parsed.drafts = parsed.drafts.filter((d) => d.id !== id);
  if (parsed.drafts.length === before) return false;

  const msg = commitMessage || `[Pipeline] Delete draft: ${draft?.title || id}`;
  await writeFileToGitHub("data/youtube-drafts.json", parsed, msg, sha);
  return true;
}

/**
 * Check if a video has been processed (reads from GitHub for accuracy).
 */
export async function hasVideoBeenProcessedViaGitHub(videoId: string): Promise<boolean> {
  const { data: parsed } = await readFileFromGitHub<{ drafts: YTDraft[] }>(
    "data/youtube-drafts.json",
    { drafts: [] }
  );
  return parsed.drafts.some((d) => d.source_video_id === videoId);
}

// ─── Categories (Local Read) ────────────────────────────────

export function readCategories(): YTCategory[] {
  const data = readJsonFile<{ categories: YTCategory[] }>("youtube-categories.json", { categories: [] });
  return data.categories;
}

export function getCategoryMap(): Map<string, string> {
  const categories = readCategories().filter((c) => c.status === "active");
  return new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
}

// ─── Categories (GitHub Write) ───────────────────────────────

/**
 * Add a category via GitHub API.
 */
export async function addCategoryViaGitHub(
  input: { name: string; icon?: string; color?: string; description?: string; status?: string },
  commitMessage?: string
): Promise<YTCategory> {
  const { data: parsed, sha } = await readFileFromGitHub<{ categories: YTCategory[] }>(
    "data/youtube-categories.json",
    { categories: [] }
  );

  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const cat: YTCategory = {
    id: generateId(),
    name: input.name,
    slug,
    description: input.description || null,
    icon: input.icon || "📁",
    color: input.color || "#60a5fa",
    sort_order: parsed.categories.length + 1,
    status: (input.status as any) || "active",
  };

  parsed.categories.push(cat);
  const msg = commitMessage || `[Pipeline] Add category: ${cat.name}`;
  await writeFileToGitHub("data/youtube-categories.json", parsed, msg, sha);
  return cat;
}

/**
 * Update a category via GitHub API.
 */
export async function updateCategoryViaGitHub(
  id: string,
  updates: Partial<YTCategory>,
  commitMessage?: string
): Promise<YTCategory> {
  const { data: parsed, sha } = await readFileFromGitHub<{ categories: YTCategory[] }>(
    "data/youtube-categories.json",
    { categories: [] }
  );

  const idx = parsed.categories.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Category not found: ${id}`);

  parsed.categories[idx] = { ...parsed.categories[idx], ...updates };
  const msg = commitMessage || `[Pipeline] Update category: ${parsed.categories[idx].name}`;
  await writeFileToGitHub("data/youtube-categories.json", parsed, msg, sha);
  return parsed.categories[idx];
}

/**
 * Merge category (update drafts + archive) via GitHub API.
 * Requires two commits: one for drafts, one for categories.
 */
export async function mergeCategoryViaGitHub(
  fromId: string,
  toId: string
): Promise<void> {
  // Update drafts
  const { data: draftsData, sha: draftsSha } = await readFileFromGitHub<{ drafts: YTDraft[] }>(
    "data/youtube-drafts.json",
    { drafts: [] }
  );
  draftsData.drafts = draftsData.drafts.map((d) =>
    d.category_id === fromId ? { ...d, category_id: toId } : d
  );
  await writeFileToGitHub(
    "data/youtube-drafts.json",
    draftsData,
    `[Pipeline] Merge category ${fromId} → ${toId}`,
    draftsSha
  );

  // Archive old category
  await updateCategoryViaGitHub(fromId, { status: "archived" as any }, `[Pipeline] Archive merged category ${fromId}`);
}

// ─── Crawl Log (GitHub Write) ────────────────────────────────

export function readCrawlLog(): YTCrawlLog[] {
  const data = readJsonFile<{ crawls: YTCrawlLog[] }>("youtube-crawl-log.json", { crawls: [] });
  return data.crawls;
}

/**
 * Write crawl log entry via GitHub API.
 */
export async function addCrawlLogViaGitHub(
  entry: YTCrawlLog,
  commitMessage?: string
): Promise<void> {
  const { data: parsed, sha } = await readFileFromGitHub<{ crawls: YTCrawlLog[] }>(
    "data/youtube-crawl-log.json",
    { crawls: [] }
  );

  parsed.crawls.unshift(entry);
  // Keep only last 50
  if (parsed.crawls.length > 50) parsed.crawls.length = 50;

  const msg = commitMessage || `[Pipeline] Crawl log: ${entry.source_id}`;
  await writeFileToGitHub("data/youtube-crawl-log.json", parsed, msg, sha);
}

// ─── Batch GitHub Commit (Multiple Files) ────────────────────

/**
 * Read sources directly from GitHub for pipeline operations.
 */
export async function readSourcesFromGitHub(): Promise<YTSource[]> {
  const { data: parsed } = await readFileFromGitHub<{ sources: YTSource[] }>(
    "data/youtube-sources.json",
    { sources: [] }
  );
  return parsed.sources;
}

/**
 * Read drafts directly from GitHub for pipeline operations (to check processed videos).
 */
export async function readDraftsFromGitHub(): Promise<YTDraft[]> {
  const { data: parsed } = await readFileFromGitHub<{ drafts: YTDraft[] }>(
    "data/youtube-drafts.json",
    { drafts: [] }
  );
  return parsed.drafts;
}

// ─── Legacy Local Write Functions (kept for local dev) ──────

export function addSource(input: Omit<YTSource, "id" | "created_at" | "last_crawled_at">): YTSource {
  const sources = readSources();
  const source: YTSource = {
    ...input,
    id: generateId(),
    last_crawled_at: null,
    created_at: new Date().toISOString(),
  };
  sources.push(source);
  writeJsonFileLocal("youtube-sources.json", { sources });
  return source;
}

export function updateSource(id: string, updates: Partial<YTSource>): YTSource | null {
  const sources = readSources();
  const idx = sources.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  sources[idx] = { ...sources[idx], ...updates };
  writeJsonFileLocal("youtube-sources.json", { sources });
  return sources[idx];
}

export function deleteSource(id: string): boolean {
  const sources = readSources();
  const filtered = sources.filter((s) => s.id !== id);
  if (filtered.length === sources.length) return false;
  writeJsonFileLocal("youtube-sources.json", { sources: filtered });
  return true;
}

export function addDraft(
  input: Omit<YTDraft, "id" | "created_at" | "reviewed_at" | "reviewed_by" | "rejection_reason" | "published_at">
): YTDraft {
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
  writeJsonFileLocal("youtube-drafts.json", { drafts });
  return draft;
}

export function updateDraft(id: string, updates: Partial<YTDraft>): YTDraft | null {
  const drafts = readDrafts();
  const idx = drafts.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  drafts[idx] = { ...drafts[idx], ...updates };
  writeJsonFileLocal("youtube-drafts.json", { drafts });
  return drafts[idx];
}

export function deleteDraft(id: string): boolean {
  const drafts = readDrafts();
  const filtered = drafts.filter((d) => d.id !== id);
  if (filtered.length === drafts.length) return false;
  writeJsonFileLocal("youtube-drafts.json", { drafts: filtered });
  return true;
}

export function writeSources(sources: YTSource[]): void {
  writeJsonFileLocal("youtube-sources.json", { sources });
}

export function writeDrafts(drafts: YTDraft[]): void {
  writeJsonFileLocal("youtube-drafts.json", { drafts });
}

export function writeCategories(categories: YTCategory[]): void {
  writeJsonFileLocal("youtube-categories.json", { categories });
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
  writeJsonFileLocal("youtube-categories.json", { categories });
  return cat;
}

export function updateCategory(id: string, updates: Partial<YTCategory>): YTCategory | null {
  const categories = readCategories();
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  categories[idx] = { ...categories[idx], ...updates };
  writeJsonFileLocal("youtube-categories.json", { categories });
  return categories[idx];
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
  crawls.unshift(entry);
  if (crawls.length > 50) crawls.length = 50;
  writeJsonFileLocal("youtube-crawl-log.json", { crawls });
  return entry;
}

export function updateCrawlEntry(id: string, updates: Partial<YTCrawlLog>): void {
  const crawls = readCrawlLog();
  const idx = crawls.findIndex((c) => c.id === id);
  if (idx !== -1) {
    crawls[idx] = { ...crawls[idx], ...updates };
    writeJsonFileLocal("youtube-crawl-log.json", { crawls });
  }
}

// ─── Legacy Commit Helpers (deprecated - use ViaGitHub functions instead) ─

export async function commitSingleFile(
  filename: string,
  commitMessage: string
): Promise<boolean> {
  console.warn(`commitSingleFile('${filename}') is deprecated. Use ViaGitHub functions.`);
  return true; // no-op, writes already go through GitHub API
}

export async function commitYouTubeData(commitMessage: string): Promise<boolean> {
  console.warn(`commitYouTubeData() is deprecated. Use ViaGitHub functions.`);
  return true; // no-op
}
