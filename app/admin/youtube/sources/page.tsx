"use client";
import { useState, useEffect, useCallback } from "react";

type Source = {
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

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "channel" as "channel" | "playlist",
    youtube_id: "",
    url: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [crawling, setCrawling] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/yt-sources", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (err) {
      console.error("Failed to fetch sources:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/yt-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowAdd(false);
        setForm({ name: "", type: "channel", youtube_id: "", url: "", description: "" });
        fetchSources();
      }
    } catch (err) {
      console.error("Failed to add source:", err);
    }
    setSaving(false);
  };

  const toggleEnabled = async (source: Source) => {
    try {
      await fetch("/api/admin/yt-sources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: source.id, enabled: !source.enabled }),
      });
      fetchSources();
    } catch (err) {
      console.error("Failed to toggle source:", err);
    }
  };

  const handleCrawl = async (sourceId: string) => {
    setCrawling(sourceId);
    try {
      const res = await fetch("/api/pipeline/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ source_id: sourceId }),
      });
      if (res.ok) {
        fetchSources();
      }
    } catch (err) {
      console.error("Crawl failed:", err);
    }
    setCrawling(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this source?")) return;
    try {
      await fetch(`/api/admin/yt-sources?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchSources();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">YouTube Sources</h1>
          <p className="text-gray-400 text-sm mt-1">
            Channels and playlists to crawl for AI use cases
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition text-sm"
        >
          + Add Source
        </button>
      </div>

      {/* Add Source Form */}
      {showAdd && (
        <div className="bg-[#12121f] border border-[#1e1e30] rounded-xl p-5">
          <h3 className="font-semibold mb-4">Add New Source</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., AI Jason"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as "channel" | "playlist" })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm"
                >
                  <option value="channel">Channel</option>
                  <option value="playlist">Playlist</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">YouTube ID</label>
                <input
                  value={form.youtube_id}
                  onChange={(e) => setForm({ ...form, youtube_id: e.target.value })}
                  placeholder="Channel ID or Playlist ID"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Channel ID: UC... or Playlist ID: PL...</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">URL (optional)</label>
                <input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description (optional)</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this source"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add Source"}
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-5 py-2 rounded-lg bg-[#1a1a2e] text-gray-400 text-sm hover:bg-[#2a2a3e] transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sources List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse text-4xl mb-2">📺</div>
          <p className="text-gray-400">Loading sources...</p>
        </div>
      ) : sources.length === 0 ? (
        <div className="text-center py-12 bg-[#12121f] rounded-xl border border-[#1e1e30]">
          <div className="text-4xl mb-3">📺</div>
          <p className="text-gray-400">No sources added yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Add a YouTube channel or playlist to start crawling
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map((source) => (
            <div
              key={source.id}
              className="bg-[#12121f] border border-[#1e1e30] rounded-xl p-4 flex items-center gap-4"
            >
              <div
                className={`w-3 h-3 rounded-full shrink-0 ${
                  source.enabled ? "bg-green-400" : "bg-gray-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{source.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#1a1a2e] text-gray-400">
                    {source.type}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  ID: {source.youtube_id}
                  {source.last_crawled_at && (
                    <span className="ml-3">
                      Last crawled: {new Date(source.last_crawled_at).toLocaleString()}
                    </span>
                  )}
                </div>
                {source.description && (
                  <div className="text-xs text-gray-400 mt-1">{source.description}</div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleCrawl(source.id)}
                  disabled={crawling === source.id}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-semibold hover:bg-blue-600/30 transition disabled:opacity-50"
                >
                  {crawling === source.id ? "⏳" : "🚀"} Crawl
                </button>
                <button
                  onClick={() => toggleEnabled(source)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    source.enabled
                      ? "bg-green-900/20 text-green-400 hover:bg-green-900/30"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {source.enabled ? "✅ Active" : "⏸️ Paused"}
                </button>
                <button
                  onClick={() => handleDelete(source.id)}
                  className="px-2 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-900/20 transition"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
