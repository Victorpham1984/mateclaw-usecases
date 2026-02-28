"use client";
import { useState } from "react";
import VideoCard from "@/components/VideoCard";
import type { ResearchVideo } from "@/lib/research/youtube-search";

function formatNumber(num: string | number): string {
  const n = typeof num === "string" ? parseInt(num, 10) : num;
  if (isNaN(n)) return String(num);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

type SessionSummary = {
  id: string;
  keyword: string;
  filters: Record<string, any>;
  totalFound: number;
  hiddenCount: number;
  searchedAt: string;
  approvedVideoIds: string[];
  videoCount: number;
};

export default function ResearchVideosPage() {
  // Search form
  const [keyword, setKeyword] = useState("");
  const [language, setLanguage] = useState("all");
  const [videoDuration, setVideoDuration] = useState<"any" | "long" | "short">("any");
  const [minSubs, setMinSubs] = useState("1000");
  const [minViews, setMinViews] = useState("0");
  const [order, setOrder] = useState<"relevance" | "viewCount" | "date">("relevance");

  // State
  const [searching, setSearching] = useState(false);
  const [videos, setVideos] = useState<ResearchVideo[]>([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [totalFound, setTotalFound] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sessionId, setSessionId] = useState("");

  // History
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingSession, setLoadingSession] = useState("");

  const visibleVideos = videos.filter((v) => !skippedIds.has(v.videoId));

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setSearching(true);
    setError("");
    setSuccessMsg("");
    setVideos([]);
    setSelectedIds(new Set());
    setSkippedIds(new Set());

    try {
      const res = await fetch("/api/research/youtube-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          keyword: keyword.trim(),
          language: language === "all" ? undefined : language,
          videoDuration,
          order,
          minViews: parseInt(minViews, 10) || undefined,
          minSubscribers: parseInt(minSubs, 10) || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Search failed (${res.status})`);
      }

      const data = await res.json();
      setVideos(data.videos);
      setHiddenCount(data.hiddenCount);
      setTotalFound(data.totalFound);
      setSearchKeyword(keyword.trim());
      setSessionId(data.sessionId || "");
      setSuccessMsg(`🔍 Search saved! ${data.videos.length} results.`);
    } catch (err: any) {
      setError(err.message);
    }
    setSearching(false);
  };

  const loadHistory = async () => {
    setShowHistory(true);
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/research/sessions", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      setSessions(
        data.sessions.map((s: any) => ({
          id: s.id,
          keyword: s.keyword,
          filters: s.filters,
          totalFound: s.totalFound,
          hiddenCount: s.hiddenCount,
          searchedAt: s.searchedAt,
          approvedVideoIds: s.approvedVideoIds || [],
          videoCount: s.videos?.length || 0,
        }))
      );
    } catch (err: any) {
      setError(err.message);
    }
    setLoadingHistory(false);
  };

  const loadSession = async (id: string) => {
    setLoadingSession(id);
    try {
      const res = await fetch(`/api/research/sessions/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load session");
      const data = await res.json();
      const s = data.session;
      setVideos(s.videos);
      setHiddenCount(s.hiddenCount);
      setTotalFound(s.totalFound);
      setSearchKeyword(s.keyword);
      setSessionId(s.id);
      setSelectedIds(new Set());
      setSkippedIds(new Set());
      setShowHistory(false);
      setSuccessMsg(`📜 Loaded "${s.keyword}" from history (0 API units)`);
    } catch (err: any) {
      setError(err.message);
    }
    setLoadingSession("");
  };

  const toggleSelect = (videoId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === visibleVideos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleVideos.map((v) => v.videoId)));
    }
  };

  const handleSkip = (videoId: string) => {
    setSkippedIds((prev) => new Set(prev).add(videoId));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(videoId);
      return next;
    });
  };

  const handleApproveSingle = async (videoId: string) => {
    const video = videos.find((v) => v.videoId === videoId);
    if (!video) return;
    await bulkApprove([video]);
  };

  const handleApproveSelected = async () => {
    const selected = videos.filter((v) => selectedIds.has(v.videoId));
    if (selected.length === 0) return;
    await bulkApprove(selected);
  };

  const bulkApprove = async (toApprove: ResearchVideo[]) => {
    setApproving(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/research/youtube-videos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          videos: toApprove,
          keyword: searchKeyword,
          sessionId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Approve failed (${res.status})`);
      }

      const data = await res.json();
      setSuccessMsg(`✅ ${data.approved} video${data.approved > 1 ? "s" : ""} added to Drafts! Review in Drafts tab.`);

      // Remove approved videos from list
      const approvedSet = new Set(toApprove.map((v) => v.videoId));
      setVideos((prev) => prev.filter((v) => !approvedSet.has(v.videoId)));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        approvedSet.forEach((id) => next.delete(id));
        return next;
      });
    } catch (err: any) {
      setError(err.message);
    }
    setApproving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🎬 Research Videos</h1>
          <p className="text-gray-400 text-sm mt-1">
            Search → Review → Approve to Drafts → Publish from Drafts tab
          </p>
        </div>
        <button
          onClick={loadHistory}
          className="px-4 py-2 rounded-lg bg-[#1a1a2e] text-gray-300 text-sm font-semibold hover:bg-[#2a2a3e] transition"
        >
          📜 History
        </button>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowHistory(false)}>
          <div className="bg-[#12121f] border border-[#1e1e30] rounded-xl w-full max-w-2xl max-h-[70vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">📜 Search History</h2>
              <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>
            {loadingHistory ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No past searches</div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div key={s.id} className="bg-[#0a0a0f] border border-[#1e1e30] rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm">
                          🔍 &ldquo;{s.keyword}&rdquo;
                          {s.filters.language && <span className="text-gray-500 ml-1">({s.filters.language})</span>}
                          {s.filters.videoDuration && s.filters.videoDuration !== "any" && (
                            <span className="text-gray-500 ml-1">• {s.filters.videoDuration}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {s.videoCount} videos
                          {s.hiddenCount > 0 && ` • ${s.hiddenCount} hidden`}
                          {s.approvedVideoIds.length > 0 && ` • ${s.approvedVideoIds.length} approved`}
                          {" • "}{timeAgo(s.searchedAt)}
                        </div>
                      </div>
                      <button
                        onClick={() => loadSession(s.id)}
                        disabled={loadingSession === s.id}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-semibold hover:bg-blue-600/30 transition shrink-0 disabled:opacity-50"
                      >
                        {loadingSession === s.id ? "Loading..." : "Load Results"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Form */}
      <div className="bg-[#12121f] border border-[#1e1e30] rounded-xl p-5">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-gray-400 mb-1 block">Keyword</label>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder='e.g., "OpenClaw AI agent"'
                required
                disabled={searching}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={searching} className="px-3 py-2.5 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm">
                <option value="all">All</option>
                <option value="en">English</option>
                <option value="vi">Vietnamese</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Duration</label>
              <select value={videoDuration} onChange={(e) => setVideoDuration(e.target.value as any)} disabled={searching} className="px-3 py-2.5 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm">
                <option value="any">Any</option>
                <option value="long">Long (&gt;4 min)</option>
                <option value="short">Short (&lt;4 min)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Min Subs</label>
              <select value={minSubs} onChange={(e) => setMinSubs(e.target.value)} disabled={searching} className="px-3 py-2.5 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm">
                <option value="0">Any</option>
                <option value="1000">1K+</option>
                <option value="10000">10K+</option>
                <option value="100000">100K+</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Sort</label>
              <select value={order} onChange={(e) => setOrder(e.target.value as any)} disabled={searching} className="px-3 py-2.5 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm">
                <option value="relevance">Relevance</option>
                <option value="viewCount">Views</option>
                <option value="date">Date</option>
              </select>
            </div>
            <button type="submit" disabled={searching || !keyword.trim()} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition disabled:opacity-50">
              {searching ? "⏳ Searching..." : "🔍 Search"}
            </button>
          </div>
        </form>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 text-sm text-red-400">❌ {error}</div>
      )}
      {successMsg && (
        <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-3 text-sm text-green-400">{successMsg}</div>
      )}

      {/* Results */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                📊 {visibleVideos.length} videos for &ldquo;{searchKeyword}&rdquo;
              </h2>
              <p className="text-xs text-gray-500">
                {hiddenCount > 0 && `${hiddenCount} hidden (already approved) • `}
                {skippedIds.size > 0 && `${skippedIds.size} skipped • `}
                {selectedIds.size} selected
                {sessionId && <span className="ml-1 text-gray-600">• Session: {sessionId.slice(0, 16)}</span>}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <button onClick={selectAll} className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] text-gray-300 text-xs font-semibold hover:bg-[#2a2a3e] transition">
                {selectedIds.size === visibleVideos.length ? "☐ Deselect All" : "☑ Select All"}
              </button>
              <button onClick={handleApproveSelected} disabled={selectedIds.size === 0 || approving} className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-500 transition disabled:opacity-50">
                {approving ? "⏳ Approving..." : `✅ Approve to Drafts (${selectedIds.size})`}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {visibleVideos.map((video) => (
              <VideoCard
                key={video.videoId}
                video={video}
                selected={selectedIds.has(video.videoId)}
                onSelect={toggleSelect}
                onApprove={handleApproveSingle}
                onSkip={handleSkip}
                disabled={approving}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!searching && videos.length === 0 && !error && (
        <div className="text-center py-12 bg-[#12121f] border border-[#1e1e30] rounded-xl">
          <div className="text-4xl mb-3">🎬</div>
          <p className="text-gray-400">Search for videos to get started</p>
          <p className="text-gray-500 text-sm mt-1">
            Results are auto-saved • Load past searches from 📜 History
          </p>
        </div>
      )}
    </div>
  );
}
