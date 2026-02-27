"use client";
import { useState, useEffect, useCallback } from "react";

type ResearchChannel = {
  channelId: string;
  channelName: string;
  channelUrl: string;
  channelDescription: string;
  thumbnailUrl: string;
  subscribers: string;
  totalVideos: string;
  recentVideos: number;
  avgViews: string;
  recentVideoTitles: string[];
  aiScore: number;
  aiReasoning: string;
  suggestedCategories: string[];
  sampleUseCases: string[];
  status: "suggested" | "approved" | "rejected" | "later";
};

type ResearchResult = {
  id: string;
  keyword: string;
  language: string;
  minSubscribers: number;
  totalFound: number;
  channels: ResearchChannel[];
  searchedAt: string;
  completedAt: string | null;
  status: "searching" | "scoring" | "completed" | "failed";
  error?: string;
};

function formatNumber(num: string): string {
  const n = parseInt(num, 10);
  if (isNaN(n)) return num;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function ScoreBar({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };
  const getStars = () => {
    if (score >= 90) return "⭐⭐⭐⭐⭐";
    if (score >= 75) return "⭐⭐⭐⭐";
    if (score >= 60) return "⭐⭐⭐";
    if (score >= 40) return "⭐⭐";
    return "⭐";
  };
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${getColor()}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-semibold">{score}/100</span>
      <span className="text-xs">{getStars()}</span>
    </div>
  );
}

function ChannelCard({
  channel,
  researchId,
  onAction,
  actionLoading,
}: {
  channel: ResearchChannel;
  researchId: string;
  onAction: (channel: ResearchChannel, action: string, researchId: string) => void;
  actionLoading: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLoading = actionLoading === channel.channelId;

  return (
    <div
      className={`bg-[#12121f] border rounded-xl p-5 transition-all ${
        channel.status === "approved"
          ? "border-green-800/50"
          : channel.status === "rejected"
          ? "border-red-800/30 opacity-60"
          : channel.status === "later"
          ? "border-yellow-800/30 opacity-80"
          : "border-[#1e1e30]"
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        {channel.thumbnailUrl && (
          <img
            src={channel.thumbnailUrl}
            alt={channel.channelName}
            className="w-14 h-14 rounded-full object-cover shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={channel.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-lg hover:text-blue-400 transition"
            >
              🎥 {channel.channelName}
            </a>
            {channel.status !== "suggested" && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  channel.status === "approved"
                    ? "bg-green-900/30 text-green-400"
                    : channel.status === "rejected"
                    ? "bg-red-900/30 text-red-400"
                    : "bg-yellow-900/30 text-yellow-400"
                }`}
              >
                {channel.status === "approved"
                  ? "✅ Approved"
                  : channel.status === "rejected"
                  ? "❌ Rejected"
                  : "⏸️ Later"}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400 mt-0.5">
            {formatNumber(channel.subscribers)} subs •{" "}
            {channel.recentVideos} recent videos •{" "}
            {formatNumber(channel.avgViews)} avg views
          </div>
          <div className="mt-2">
            <ScoreBar score={channel.aiScore} />
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="mt-3 bg-[#0a0a15] rounded-lg p-3">
        <div className="text-sm">
          <span className="text-blue-400">💡</span>{" "}
          <span className="text-gray-300">{channel.aiReasoning}</span>
        </div>
        {channel.suggestedCategories.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {channel.suggestedCategories.map((cat) => (
              <span
                key={cat}
                className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sample Use Cases */}
      {channel.sampleUseCases.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-1">Sample use cases:</div>
          <ul className="text-sm text-gray-300 space-y-0.5">
            {channel.sampleUseCases.map((uc, i) => (
              <li key={i}>• {uc}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Expandable: Recent Video Titles */}
      {channel.recentVideoTitles.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-500 hover:text-gray-300 transition"
          >
            {expanded ? "▼" : "▶"} Recent videos ({channel.recentVideoTitles.length})
          </button>
          {expanded && (
            <ul className="mt-1 text-xs text-gray-400 space-y-0.5 pl-3">
              {channel.recentVideoTitles.map((title, i) => (
                <li key={i} className="truncate">
                  📹 {title}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Actions */}
      {channel.status === "suggested" && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onAction(channel, "approve", researchId)}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-500 transition disabled:opacity-50"
          >
            {isLoading ? "⏳" : "✅"} Approve
          </button>
          <button
            onClick={() => onAction(channel, "later", researchId)}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-lg bg-yellow-600/20 text-yellow-400 text-sm font-semibold hover:bg-yellow-600/30 transition disabled:opacity-50"
          >
            ⏸️ Later
          </button>
          <button
            onClick={() => onAction(channel, "reject", researchId)}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-sm font-semibold hover:bg-red-600/30 transition disabled:opacity-50"
          >
            ❌ Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default function ResearchPage() {
  // Search form state
  const [keyword, setKeyword] = useState("");
  const [language, setLanguage] = useState<string>("all");
  const [minSubs, setMinSubs] = useState<string>("1000");
  const [searching, setSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string>("");

  // Results state
  const [currentResult, setCurrentResult] = useState<ResearchResult | null>(null);
  const [pastResults, setPastResults] = useState<ResearchResult[]>([]);
  const [sortBy, setSortBy] = useState<"aiScore" | "subscribers">("aiScore");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [loadingPast, setLoadingPast] = useState(true);

  // Load past research results
  const loadPastResults = useCallback(async () => {
    try {
      const res = await fetch("/api/research/youtube?limit=20", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPastResults(data);
      }
    } catch (err) {
      console.error("Failed to load past results:", err);
    }
    setLoadingPast(false);
  }, []);

  useEffect(() => {
    loadPastResults();
  }, [loadPastResults]);

  // Run new research
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setSearching(true);
    setSearchStatus("🔍 Searching YouTube channels...");
    setCurrentResult(null);

    try {
      const res = await fetch("/api/research/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          keyword: keyword.trim(),
          limit: 20,
          language,
          minSubscribers: parseInt(minSubs, 10),
          recentDaysFilter: 30,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Search failed (${res.status})`);
      }

      const result: ResearchResult = await res.json();
      setCurrentResult(result);
      setSearchStatus("");

      // Refresh past results
      loadPastResults();
    } catch (err: any) {
      setSearchStatus(`❌ Error: ${err.message}`);
    }
    setSearching(false);
  };

  // Handle channel actions (approve/reject/later)
  const handleAction = async (
    channel: ResearchChannel,
    action: string,
    researchId: string
  ) => {
    const channelId = channel.channelId;
    setActionLoading(channelId);
    try {
      const res = await fetch(`/api/research/youtube/${channelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action, researchId, channelData: channel }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(`Action failed: ${errData.error || res.status}`);
      } else {
        // Update local state
        if (currentResult) {
          setCurrentResult({
            ...currentResult,
            channels: currentResult.channels.map((ch) =>
              ch.channelId === channelId
                ? { ...ch, status: action === "approve" ? "approved" : action === "reject" ? "rejected" : "later" }
                : ch
            ),
          });
        }
        // Refresh past results to reflect changes
        loadPastResults();
      }
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
    setActionLoading(null);
  };

  // Bulk approve
  const handleBulkApprove = async (minScore: number) => {
    if (!currentResult) return;
    const toApprove = currentResult.channels.filter(
      (ch) => ch.status === "suggested" && ch.aiScore >= minScore
    );
    if (toApprove.length === 0) {
      alert("No channels matching criteria");
      return;
    }
    if (!confirm(`Approve ${toApprove.length} channels with score ≥ ${minScore}?`)) return;

    for (const ch of toApprove) {
      await handleAction(ch, "approve", currentResult.id);
    }
  };

  // Get sorted & filtered channels
  const getDisplayChannels = (result: ResearchResult) => {
    let channels = [...result.channels];

    // Filter by status
    if (filterStatus !== "all") {
      channels = channels.filter((ch) => ch.status === filterStatus);
    }

    // Sort
    channels.sort((a, b) => {
      if (sortBy === "aiScore") return b.aiScore - a.aiScore;
      return parseInt(b.subscribers, 10) - parseInt(a.subscribers, 10);
    });

    return channels;
  };

  // View a past result
  const loadPastResult = (result: ResearchResult) => {
    setCurrentResult(result);
    setKeyword(result.keyword);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">🔍 Research YouTube Channels</h1>
        <p className="text-gray-400 text-sm mt-1">
          Discover channels by keyword → AI scores relevance → Approve to add as sources
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-[#12121f] border border-[#1e1e30] rounded-xl p-5">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <label className="text-xs text-gray-400 mb-1 block">Keyword</label>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder='e.g., "AI automation tools", "productivity AI"'
                required
                disabled={searching}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={searching}
                className="px-3 py-2.5 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm"
              >
                <option value="all">All</option>
                <option value="en">English</option>
                <option value="vi">Vietnamese</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Min Subscribers</label>
              <select
                value={minSubs}
                onChange={(e) => setMinSubs(e.target.value)}
                disabled={searching}
                className="px-3 py-2.5 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm"
              >
                <option value="0">Any</option>
                <option value="1000">1K+</option>
                <option value="10000">10K+</option>
                <option value="50000">50K+</option>
                <option value="100000">100K+</option>
                <option value="500000">500K+</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={searching || !keyword.trim()}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition disabled:opacity-50"
            >
              {searching ? "⏳ Searching..." : "🔍 Search"}
            </button>
          </div>

          {/* Search Status */}
          {searching && (
            <div className="flex items-center gap-3 text-sm text-blue-400">
              <div className="animate-spin text-lg">🔄</div>
              <span>{searchStatus || "Processing... This may take 30-60 seconds for AI scoring."}</span>
            </div>
          )}
          {searchStatus && !searching && (
            <div className="text-sm text-red-400">{searchStatus}</div>
          )}
        </form>
      </div>

      {/* Current Research Results */}
      {currentResult && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                📊 {currentResult.totalFound} channels for &ldquo;{currentResult.keyword}&rdquo;
              </h2>
              <p className="text-xs text-gray-500">
                Searched: {new Date(currentResult.searchedAt).toLocaleString()} •
                Status: {currentResult.status}
                {currentResult.error && ` • Error: ${currentResult.error}`}
              </p>
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "aiScore" | "subscribers")}
                className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2e2e40] text-xs"
              >
                <option value="aiScore">Sort: AI Score</option>
                <option value="subscribers">Sort: Subscribers</option>
              </select>

              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2e2e40] text-xs"
              >
                <option value="all">All Status</option>
                <option value="suggested">Suggested</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="later">Later</option>
              </select>

              {/* Bulk Actions */}
              <button
                onClick={() => handleBulkApprove(80)}
                className="px-3 py-1.5 rounded-lg bg-green-900/20 text-green-400 text-xs font-semibold hover:bg-green-900/30 transition"
              >
                ✅ Approve All ≥80
              </button>
              <button
                onClick={() => {
                  const suggested = currentResult.channels.filter(c => c.status === "suggested");
                  const top5 = suggested.sort((a, b) => b.aiScore - a.aiScore).slice(0, 5);
                  if (top5.length === 0) return;
                  if (!confirm(`Approve top ${top5.length} channels?`)) return;
                  top5.forEach(ch => handleAction(ch, "approve", currentResult.id));
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-900/20 text-blue-400 text-xs font-semibold hover:bg-blue-900/30 transition"
              >
                🏆 Approve Top 5
              </button>
            </div>
          </div>

          {/* Channel Cards */}
          <div className="space-y-3">
            {getDisplayChannels(currentResult).map((channel) => (
              <ChannelCard
                key={channel.channelId}
                channel={channel}
                researchId={currentResult.id}
                onAction={handleAction}
                actionLoading={actionLoading}
              />
            ))}
            {getDisplayChannels(currentResult).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No channels match the current filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Past Research History */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">📜 Research History</h2>
        {loadingPast ? (
          <div className="text-center py-6">
            <div className="animate-pulse text-2xl mb-1">🔍</div>
            <p className="text-gray-400 text-sm">Loading history...</p>
          </div>
        ) : pastResults.length === 0 ? (
          <div className="text-center py-8 bg-[#12121f] border border-[#1e1e30] rounded-xl">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-gray-400">No research history yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Enter a keyword above to discover YouTube channels
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {pastResults.map((result) => (
              <button
                key={result.id}
                onClick={() => loadPastResult(result)}
                className={`text-left bg-[#12121f] border rounded-lg p-3 transition hover:border-blue-600/50 ${
                  currentResult?.id === result.id
                    ? "border-blue-600/50"
                    : "border-[#1e1e30]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm">
                      &ldquo;{result.keyword}&rdquo;
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {result.totalFound} channels found
                    </span>
                    {result.channels.filter((c) => c.status === "approved")
                      .length > 0 && (
                      <span className="text-xs text-green-400 ml-2">
                        ✅{" "}
                        {
                          result.channels.filter((c) => c.status === "approved")
                            .length
                        }{" "}
                        approved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        result.status === "completed"
                          ? "bg-green-900/20 text-green-400"
                          : result.status === "failed"
                          ? "bg-red-900/20 text-red-400"
                          : "bg-yellow-900/20 text-yellow-400"
                      }`}
                    >
                      {result.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(result.searchedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
