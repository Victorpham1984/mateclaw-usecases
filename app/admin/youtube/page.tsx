"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Stats = {
  use_cases: number;
  categories: number;
  sources: number;
  drafts: number;
  recent_crawls: any[];
};

function CircularMetric({
  value,
  label,
  icon,
  color,
  max,
}: {
  value: number;
  label: string;
  icon: string;
  color: string;
  max: number;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="42"
            fill="none" stroke="#1e1e30" strokeWidth="6"
          />
          <circle
            cx="50" cy="50" r="42"
            fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl">{icon}</span>
          <span className="text-xl font-bold">{value}</span>
        </div>
      </div>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  );
}

export default function YouTubeDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [crawling, setCrawling] = useState(false);
  const [crawlResult, setCrawlResult] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/pipeline/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleCrawl = async () => {
    setCrawling(true);
    setCrawlResult(null);
    try {
      const res = await fetch("/api/pipeline/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setCrawlResult(
          `✅ ${data.summary.total_use_cases_created} use cases created from ${data.summary.sources_processed} sources`
        );
        fetchStats();
      } else {
        setCrawlResult(`❌ ${data.error}`);
      }
    } catch (err) {
      setCrawlResult(`❌ Network error`);
    }
    setCrawling(false);
  };

  const maxMetric = Math.max(
    stats?.use_cases || 1,
    stats?.categories || 1,
    stats?.sources || 1,
    50
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">YouTube Pipeline Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Auto-extract AI use cases from YouTube videos
          </p>
        </div>
        <button
          onClick={handleCrawl}
          disabled={crawling}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition disabled:opacity-50 flex items-center gap-2"
        >
          {crawling ? (
            <>
              <span className="animate-spin">⏳</span> Crawling...
            </>
          ) : (
            <>🚀 Run Pipeline</>
          )}
        </button>
      </div>

      {crawlResult && (
        <div
          className={`p-4 rounded-xl ${
            crawlResult.startsWith("✅")
              ? "bg-green-900/20 border border-green-800/30 text-green-300"
              : "bg-red-900/20 border border-red-800/30 text-red-300"
          }`}
        >
          {crawlResult}
        </div>
      )}

      {/* Circular Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <CircularMetric
          value={stats?.use_cases || 0}
          label="Published Use Cases"
          icon="📚"
          color="#4ade80"
          max={maxMetric}
        />
        <CircularMetric
          value={stats?.drafts || 0}
          label="Pending Drafts"
          icon="📝"
          color="#fbbf24"
          max={maxMetric}
        />
        <CircularMetric
          value={stats?.categories || 0}
          label="Categories"
          icon="📁"
          color="#60a5fa"
          max={maxMetric}
        />
        <CircularMetric
          value={stats?.sources || 0}
          label="Active Sources"
          icon="📺"
          color="#a78bfa"
          max={maxMetric}
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/youtube/drafts"
          className="p-5 rounded-xl bg-[#12121f] border border-[#1e1e30] hover:border-blue-500/30 transition group"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📝</span>
            <h3 className="font-semibold group-hover:text-blue-400 transition">
              Review Drafts
            </h3>
          </div>
          <p className="text-sm text-gray-400">
            {stats?.drafts || 0} drafts waiting for review
          </p>
        </Link>

        <Link
          href="/admin/youtube/sources"
          className="p-5 rounded-xl bg-[#12121f] border border-[#1e1e30] hover:border-purple-500/30 transition group"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📺</span>
            <h3 className="font-semibold group-hover:text-purple-400 transition">
              Manage Sources
            </h3>
          </div>
          <p className="text-sm text-gray-400">
            {stats?.sources || 0} YouTube channels/playlists
          </p>
        </Link>

        <Link
          href="/admin/youtube/categories"
          className="p-5 rounded-xl bg-[#12121f] border border-[#1e1e30] hover:border-green-500/30 transition group"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📁</span>
            <h3 className="font-semibold group-hover:text-green-400 transition">
              Categories
            </h3>
          </div>
          <p className="text-sm text-gray-400">
            {stats?.categories || 0} active categories
          </p>
        </Link>
      </div>

      {/* Recent Crawls */}
      <div className="bg-[#12121f] border border-[#1e1e30] rounded-xl p-5">
        <h3 className="font-semibold mb-4">Recent Crawl Activity</h3>
        {!stats?.recent_crawls?.length ? (
          <p className="text-gray-500 text-sm">
            No crawls yet. Add a source and run the pipeline!
          </p>
        ) : (
          <div className="space-y-3">
            {stats.recent_crawls.map((crawl: any) => (
              <div
                key={crawl.id}
                className="flex items-center justify-between py-2 border-b border-[#1e1e30] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      crawl.status === "completed"
                        ? "bg-green-400"
                        : crawl.status === "running"
                        ? "bg-yellow-400 animate-pulse"
                        : "bg-red-400"
                    }`}
                  />
                  <div>
                    <div className="text-sm">
                      {crawl.videos_found || 0} videos → {crawl.use_cases_created || 0} use cases
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(crawl.started_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    crawl.status === "completed"
                      ? "bg-green-900/30 text-green-400"
                      : crawl.status === "running"
                      ? "bg-yellow-900/30 text-yellow-400"
                      : "bg-red-900/30 text-red-400"
                  }`}
                >
                  {crawl.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
