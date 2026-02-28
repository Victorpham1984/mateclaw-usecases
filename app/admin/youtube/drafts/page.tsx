"use client";
import { useState, useEffect } from "react";

type Draft = {
  id: string;
  videoId: string;
  fromSessionId: string;
  video: {
    title: string;
    viewCount: string;
    likeCount: string;
    engagementRate: number;
    duration: string;
    channel: { channelName: string; subscriberCount: string };
  };
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  status: string;
};

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
  return `${days}d ago`;
}

const CATEGORIES = [
  "setup", "development", "marketing", "content", "automation",
  "customer-support", "analytics", "finance", "sales", "growth",
];

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCat, setEditCat] = useState("");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => { loadDrafts(); }, []);

  const loadDrafts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/drafts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load drafts");
      const data = await res.json();
      setDrafts(data.drafts);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === drafts.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(drafts.map((d) => d.id)));
  };

  const startEdit = (draft: Draft) => {
    setEditingId(draft.id);
    setEditTitle(draft.title);
    setEditDesc(draft.description);
    setEditCat(draft.category || "automation");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setError("");
    try {
      const res = await fetch(`/api/drafts/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: editTitle, description: editDesc, category: editCat }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setEditingId(null);
      setSuccessMsg("✅ Draft updated!");
      await loadDrafts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const publishSingle = async (id: string) => {
    setPublishing(true);
    setError("");
    try {
      const res = await fetch(`/api/drafts/${id}/publish`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Publish failed");
      setSuccessMsg("✅ Published to cases!");
      await loadDrafts();
    } catch (err: any) {
      setError(err.message);
    }
    setPublishing(false);
  };

  const publishSelected = async () => {
    if (selectedIds.size === 0) return;
    setPublishing(true);
    setError("");
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ draftIds: Array.from(selectedIds) }),
      });
      if (!res.ok) throw new Error("Bulk publish failed");
      const data = await res.json();
      setSuccessMsg(`✅ Published ${data.published} case(s)!`);
      setSelectedIds(new Set());
      await loadDrafts();
    } catch (err: any) {
      setError(err.message);
    }
    setPublishing(false);
  };

  const deleteDraft = async (id: string) => {
    setError("");
    try {
      const res = await fetch(`/api/drafts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      setSuccessMsg("🗑️ Draft deleted");
      await loadDrafts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse text-4xl">📝</div>
        <p className="text-gray-400 mt-2">Loading drafts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📝 Drafts ({drafts.length})</h1>
          <p className="text-gray-400 text-sm mt-1">
            Review and edit approved videos before publishing to cases
          </p>
        </div>
        {drafts.length > 0 && (
          <div className="flex gap-2">
            <button onClick={selectAll} className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] text-gray-300 text-xs font-semibold hover:bg-[#2a2a3e] transition">
              {selectedIds.size === drafts.length ? "☐ Deselect" : "☑ Select All"}
            </button>
            <button
              onClick={publishSelected}
              disabled={selectedIds.size === 0 || publishing}
              className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-500 transition disabled:opacity-50"
            >
              {publishing ? "⏳ Publishing..." : `✅ Publish Selected (${selectedIds.size})`}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 text-sm text-red-400">❌ {error}</div>
      )}
      {successMsg && (
        <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-3 text-sm text-green-400">{successMsg}</div>
      )}

      {drafts.length === 0 ? (
        <div className="text-center py-12 bg-[#12121f] border border-[#1e1e30] rounded-xl">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-400">No drafts yet</p>
          <p className="text-gray-500 text-sm mt-1">Approve videos from the Videos tab to create drafts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className={`bg-[#12121f] border rounded-xl p-4 transition-all ${
                selectedIds.has(draft.id) ? "border-blue-500/60 bg-blue-900/10" : "border-[#1e1e30]"
              }`}
            >
              <div className="flex items-start gap-3">
                <label className="mt-1 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(draft.id)}
                    onChange={() => toggleSelect(draft.id)}
                    className="w-4 h-4 rounded bg-[#0a0a0f] border-[#2e2e40] text-blue-500 cursor-pointer"
                  />
                </label>
                <div className="flex-1 min-w-0">
                  {editingId === draft.id ? (
                    /* Edit mode */
                    <div className="space-y-3">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500"
                      />
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex gap-2 items-center">
                        <select
                          value={editCat}
                          onChange={(e) => setEditCat(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <button onClick={saveEdit} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition">
                          💾 Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] text-gray-300 text-xs hover:bg-[#2a2a3e] transition">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <>
                      <a
                        href={`https://www.youtube.com/watch?v=${draft.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-sm hover:text-blue-400 transition line-clamp-2"
                      >
                        🎬 {draft.title}
                      </a>
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 flex-wrap">
                        <span>👤 {draft.video.channel.channelName}</span>
                        <span className="text-gray-600">({formatNumber(draft.video.channel.subscriberCount)} subs)</span>
                        <span className="text-gray-600">•</span>
                        <span>{formatNumber(draft.video.viewCount)} views</span>
                        <span className="text-gray-600">•</span>
                        <span>{draft.video.duration}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500">{draft.category}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        📅 Approved {timeAgo(draft.createdAt)}
                      </div>
                      <div className="flex gap-2 mt-2.5">
                        <a
                          href={`https://www.youtube.com/watch?v=${draft.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-lg bg-[#1a1a2e] text-gray-300 text-xs hover:bg-[#2a2a3e] transition"
                        >
                          ▶ Preview
                        </a>
                        <button onClick={() => startEdit(draft)} className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-semibold hover:bg-blue-600/30 transition">
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => publishSingle(draft.id)}
                          disabled={publishing}
                          className="px-3 py-1 rounded-lg bg-green-600/20 text-green-400 text-xs font-semibold hover:bg-green-600/30 transition disabled:opacity-50"
                        >
                          ✅ Publish
                        </button>
                        <button
                          onClick={() => deleteDraft(draft.id)}
                          className="px-3 py-1 rounded-lg bg-red-600/10 text-red-400/70 text-xs hover:bg-red-600/20 transition"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
