"use client";
import { useState, useEffect, useCallback } from "react";

type UseCase = {
  id: string;
  title: string;
  description: string;
  detailed_content: string;
  category_id: string | null;
  suggested_category: string | null;
  tags: string[];
  difficulty: string;
  source_video_url: string;
  source_video_title: string;
  source_channel_name: string;
  ai_confidence: number;
  ai_model: string;
  status: string;
  created_at: string;
  yt_categories: { name: string; icon: string; color: string } | null;
  yt_sources: { name: string } | null;
};

type Category = {
  id: string;
  name: string;
  icon: string;
};

function ConfidenceBadge({ score }: { score: number }) {
  const color =
    score >= 0.8
      ? "text-green-400 bg-green-900/20"
      : score >= 0.5
      ? "text-yellow-400 bg-yellow-900/20"
      : "text-red-400 bg-red-900/20";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>
      {Math.round(score * 100)}% confidence
    </span>
  );
}

function DifficultyBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    beginner: "text-green-400 bg-green-900/20",
    intermediate: "text-blue-400 bg-blue-900/20",
    advanced: "text-purple-400 bg-purple-900/20",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${styles[level] || styles.intermediate}`}>
      {level}
    </span>
  );
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<UseCase[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("draft");
  const [selectedDraft, setSelectedDraft] = useState<UseCase | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<UseCase>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchDrafts = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/yt-drafts?status=${statusFilter}&limit=50`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setDrafts(data.data || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch drafts:", err);
    }
    setLoading(false);
  }, [statusFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/yt-categories?status=active", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
    fetchCategories();
  }, [fetchDrafts, fetchCategories]);

  const handleAction = async (
    id: string,
    action: "approve" | "reject" | "publish" | "edit",
    extraData?: any
  ) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/yt-drafts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action, ...extraData }),
      });
      if (res.ok) {
        fetchDrafts();
        if (action !== "edit") setSelectedDraft(null);
      }
    } catch (err) {
      console.error("Action failed:", err);
    }
    setActionLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this draft permanently?")) return;
    try {
      await fetch(`/api/admin/yt-drafts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchDrafts();
      setSelectedDraft(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const statusTabs = [
    { key: "draft", label: "Drafts", icon: "📝" },
    { key: "approved", label: "Approved", icon: "✅" },
    { key: "published", label: "Published", icon: "🚀" },
    { key: "rejected", label: "Rejected", icon: "❌" },
    { key: "all", label: "All", icon: "📋" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Use Case Drafts</h1>
        <span className="text-sm text-gray-400">{total} total</span>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key);
              setLoading(true);
            }}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition ${
              statusFilter === tab.key
                ? "bg-blue-600/20 text-blue-400 font-semibold border border-blue-600/30"
                : "text-gray-400 hover:bg-[#1a1a2e] border border-transparent"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse text-4xl mb-2">📝</div>
          <p className="text-gray-400">Loading drafts...</p>
        </div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-12 bg-[#12121f] rounded-xl border border-[#1e1e30]">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-400">No {statusFilter} use cases found</p>
          <p className="text-gray-500 text-sm mt-1">
            Run the pipeline from the Dashboard to generate drafts
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Draft List */}
          <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                onClick={() => {
                  setSelectedDraft(draft);
                  setEditMode(false);
                  setEditData({});
                }}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  selectedDraft?.id === draft.id
                    ? "bg-blue-600/10 border-blue-600/30"
                    : "bg-[#12121f] border-[#1e1e30] hover:border-[#2e2e40]"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm leading-tight">
                    {draft.title}
                  </h3>
                  <ConfidenceBadge score={draft.ai_confidence} />
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                  {draft.description}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {draft.yt_categories ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-[#1a1a2e]">
                      {draft.yt_categories.icon} {draft.yt_categories.name}
                    </span>
                  ) : draft.suggested_category ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-900/20 text-yellow-400">
                      🆕 {draft.suggested_category}
                    </span>
                  ) : null}
                  <DifficultyBadge level={draft.difficulty} />
                  <span className="text-xs text-gray-500 ml-auto">
                    {draft.source_channel_name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Draft Detail Panel */}
          <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
            {selectedDraft ? (
              <div className="bg-[#12121f] border border-[#1e1e30] rounded-xl p-5 sticky top-0">
                {editMode ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-2">Edit Draft</h3>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Title</label>
                      <input
                        value={editData.title ?? selectedDraft.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Description</label>
                      <textarea
                        value={editData.description ?? selectedDraft.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm resize-y focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Detailed Content</label>
                      <textarea
                        value={editData.detailed_content ?? selectedDraft.detailed_content}
                        onChange={(e) => setEditData({ ...editData, detailed_content: e.target.value })}
                        rows={8}
                        className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm resize-y focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Category</label>
                        <select
                          value={editData.category_id ?? selectedDraft.category_id ?? ""}
                          onChange={(e) => setEditData({ ...editData, category_id: e.target.value || null })}
                          className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm"
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Difficulty</label>
                        <select
                          value={editData.difficulty ?? selectedDraft.difficulty}
                          onChange={(e) => setEditData({ ...editData, difficulty: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Tags (comma separated)</label>
                      <input
                        value={(editData.tags ?? selectedDraft.tags)?.join(", ") || ""}
                        onChange={(e) => setEditData({
                          ...editData,
                          tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                        })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          handleAction(selectedDraft.id, "edit", editData);
                          setEditMode(false);
                        }}
                        disabled={actionLoading}
                        className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition disabled:opacity-50"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => { setEditMode(false); setEditData({}); }}
                        className="px-4 py-2 rounded-lg bg-[#1a1a2e] text-gray-400 text-sm hover:bg-[#2a2a3e] transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg leading-tight pr-4">
                        {selectedDraft.title}
                      </h3>
                      <ConfidenceBadge score={selectedDraft.ai_confidence} />
                    </div>

                    <p className="text-sm text-gray-300">{selectedDraft.description}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedDraft.yt_categories ? (
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            background: selectedDraft.yt_categories.color + "20",
                            color: selectedDraft.yt_categories.color,
                          }}
                        >
                          {selectedDraft.yt_categories.icon} {selectedDraft.yt_categories.name}
                        </span>
                      ) : selectedDraft.suggested_category ? (
                        <span className="text-xs px-2 py-1 rounded bg-yellow-900/20 text-yellow-400 border border-yellow-800/30">
                          🆕 Suggested: {selectedDraft.suggested_category}
                        </span>
                      ) : null}
                      <DifficultyBadge level={selectedDraft.difficulty} />
                      {selectedDraft.tags?.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded bg-[#1a1a2e] text-gray-400">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Source */}
                    <div className="p-3 rounded-lg bg-[#0a0a0f] border border-[#1e1e30]">
                      <div className="text-xs text-gray-500 mb-1">Source</div>
                      <a
                        href={selectedDraft.source_video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:underline"
                      >
                        🎬 {selectedDraft.source_video_title}
                      </a>
                      <div className="text-xs text-gray-500 mt-1">
                        📺 {selectedDraft.source_channel_name} • AI: {selectedDraft.ai_model}
                      </div>
                    </div>

                    {/* Detailed Content */}
                    <div>
                      <div className="text-xs text-gray-500 mb-2">Detailed Content</div>
                      <div className="text-sm text-gray-300 whitespace-pre-wrap bg-[#0a0a0f] p-4 rounded-lg border border-[#1e1e30] max-h-60 overflow-y-auto">
                        {selectedDraft.detailed_content}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-[#1e1e30]">
                      {selectedDraft.status === "draft" && (
                        <>
                          <button
                            onClick={() => handleAction(selectedDraft.id, "publish")}
                            disabled={actionLoading}
                            className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-500 transition disabled:opacity-50"
                          >
                            🚀 Publish
                          </button>
                          <button
                            onClick={() => handleAction(selectedDraft.id, "approve")}
                            disabled={actionLoading}
                            className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition disabled:opacity-50"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => setEditMode(true)}
                            className="px-3 py-2 rounded-lg bg-[#1a1a2e] text-gray-400 text-sm hover:bg-[#2a2a3e] transition"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleAction(selectedDraft.id, "reject", {
                              rejection_reason: prompt("Rejection reason:") || "Not relevant",
                            })}
                            disabled={actionLoading}
                            className="px-3 py-2 rounded-lg bg-red-900/20 text-red-400 text-sm hover:bg-red-900/30 transition"
                          >
                            ❌
                          </button>
                        </>
                      )}
                      {selectedDraft.status === "approved" && (
                        <button
                          onClick={() => handleAction(selectedDraft.id, "publish")}
                          disabled={actionLoading}
                          className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-500 transition disabled:opacity-50"
                        >
                          🚀 Publish
                        </button>
                      )}
                      {selectedDraft.status === "rejected" && (
                        <button
                          onClick={() => handleAction(selectedDraft.id, "approve")}
                          disabled={actionLoading}
                          className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition disabled:opacity-50"
                        >
                          ♻️ Reconsider
                        </button>
                      )}
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-3 py-2 rounded-lg bg-[#1a1a2e] text-gray-400 text-sm hover:bg-[#2a2a3e] transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(selectedDraft.id)}
                        className="px-3 py-2 rounded-lg bg-red-900/10 text-red-500 text-sm hover:bg-red-900/20 transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#12121f] border border-[#1e1e30] rounded-xl p-8 text-center">
                <div className="text-4xl mb-3">👈</div>
                <p className="text-gray-400">Select a draft to review</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
