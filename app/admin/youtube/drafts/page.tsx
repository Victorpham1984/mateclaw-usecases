"use client";
import { useState, useEffect } from "react";

type Draft = {
  id: string;
  videoId: string;
  sourceType?: string;
  contentId?: string;
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
  // AI fields
  summary?: string;
  prompt?: string;
  transcript?: string;
  transcriptSource?: string;
  aiGenerated?: boolean;
  difficulty?: string;
  timeEstimate?: string;
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
  return `${Math.floor(hours / 24)}d ago`;
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
  const [editFields, setEditFields] = useState<Partial<Draft>>({});
  const [publishing, setPublishing] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [expandedTranscript, setExpandedTranscript] = useState<Set<string>>(new Set());

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
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === drafts.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(drafts.map((d) => d.id)));
  };

  const startEdit = (draft: Draft) => {
    setEditingId(draft.id);
    setEditFields({
      title: draft.title,
      description: draft.description,
      category: draft.category || "automation",
      summary: draft.summary || "",
      prompt: draft.prompt || "",
      difficulty: draft.difficulty || "beginner",
      timeEstimate: draft.timeEstimate || "",
    });
  };

  const updateEdit = (field: string, value: string) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setError("");
    try {
      const res = await fetch(`/api/drafts/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editFields),
      });
      if (!res.ok) throw new Error("Failed to save");
      setEditingId(null);
      setSuccessMsg("✅ Draft updated!");
      await loadDrafts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const generateAIContent = async (draft: Draft) => {
    setGeneratingId(draft.id);
    setError("");
    try {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sourceType: draft.sourceType || "youtube",
          title: draft.title,
          videoId: draft.videoId,
          description: draft.description,
          creator: draft.video?.channel?.channelName,
          url: `https://www.youtube.com/watch?v=${draft.videoId}`,
        }),
      });
      if (!res.ok) throw new Error("AI generation failed");
      const data = await res.json();

      // Save generated content to draft
      const updates: any = {
        summary: data.summary,
        prompt: data.prompt,
        tags: data.tags,
        difficulty: data.difficulty,
        timeEstimate: data.timeEstimate,
        aiGenerated: true,
      };
      if (data.transcript) {
        updates.transcript = data.transcript.text;
        updates.transcriptSource = data.transcript.source;
      }

      const saveRes = await fetch(`/api/drafts/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!saveRes.ok) throw new Error("Failed to save AI content");

      setSuccessMsg(`🤖 AI content generated for "${draft.title.slice(0, 40)}..."`);
      await loadDrafts();
    } catch (err: any) {
      setError(err.message);
    }
    setGeneratingId(null);
  };

  const publishSingle = async (id: string) => {
    setPublishing(true);
    setError("");
    try {
      const res = await fetch(`/api/drafts/${id}/publish`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Publish failed");
      setSuccessMsg("✅ Published to cases!");
      await loadDrafts();
    } catch (err: any) { setError(err.message); }
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
    } catch (err: any) { setError(err.message); }
    setPublishing(false);
  };

  const deleteDraft = async (id: string) => {
    setError("");
    try {
      const res = await fetch(`/api/drafts/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
      setSuccessMsg("🗑️ Draft deleted");
      await loadDrafts();
    } catch (err: any) { setError(err.message); }
  };

  const toggleTranscript = (id: string) => {
    setExpandedTranscript((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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
            Review, generate AI content, edit, then publish to cases
          </p>
        </div>
        {drafts.length > 0 && (
          <div className="flex gap-2">
            <button onClick={selectAll} className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] text-gray-300 text-xs font-semibold hover:bg-[#2a2a3e] transition">
              {selectedIds.size === drafts.length ? "☐ Deselect" : "☑ Select All"}
            </button>
            <button onClick={publishSelected} disabled={selectedIds.size === 0 || publishing} className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-500 transition disabled:opacity-50">
              {publishing ? "⏳ Publishing..." : `✅ Publish Selected (${selectedIds.size})`}
            </button>
          </div>
        )}
      </div>

      {error && <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 text-sm text-red-400">❌ {error}</div>}
      {successMsg && <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-3 text-sm text-green-400">{successMsg}</div>}

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
                    /* ─── Edit Mode ─── */
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Title</label>
                        <input value={editFields.title || ""} onChange={(e) => updateEdit("title", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Summary (AI generated)</label>
                        <textarea value={editFields.summary || ""} onChange={(e) => updateEdit("summary", e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Prompt (what user pastes into OpenClaw)</label>
                        <textarea value={editFields.prompt || ""} onChange={(e) => updateEdit("prompt", e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="flex gap-3 items-end flex-wrap">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Category</label>
                          <select value={editFields.category} onChange={(e) => updateEdit("category", e.target.value)} className="px-3 py-1.5 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm">
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Difficulty</label>
                          <select value={editFields.difficulty} onChange={(e) => updateEdit("difficulty", e.target.value)} className="px-3 py-1.5 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm">
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="expert">Expert</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Time</label>
                          <input value={editFields.timeEstimate || ""} onChange={(e) => updateEdit("timeEstimate", e.target.value)} placeholder="e.g. 15 min" className="px-3 py-1.5 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm w-24 focus:outline-none focus:border-blue-500" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition">💾 Save</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] text-gray-300 text-xs hover:bg-[#2a2a3e] transition">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    /* ─── View Mode ─── */
                    <>
                      <div className="flex items-start gap-2">
                        <a href={`https://www.youtube.com/watch?v=${draft.videoId}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm hover:text-blue-400 transition line-clamp-2">
                          🎬 {draft.title}
                        </a>
                        {draft.aiGenerated && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-600/20 text-purple-400 border border-purple-600/30">
                            🤖 AI
                          </span>
                        )}
                        {draft.sourceType && draft.sourceType !== "youtube" && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-400">
                            {draft.sourceType}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 flex-wrap">
                        <span>👤 {draft.video?.channel?.channelName}</span>
                        <span className="text-gray-600">({formatNumber(draft.video?.channel?.subscriberCount || "0")} subs)</span>
                        <span className="text-gray-600">•</span>
                        <span>{formatNumber(draft.video?.viewCount || "0")} views</span>
                        <span className="text-gray-600">•</span>
                        <span>{draft.video?.duration}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500">{draft.category}</span>
                        {draft.difficulty && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className={`${draft.difficulty === "beginner" ? "text-green-500" : draft.difficulty === "intermediate" ? "text-yellow-500" : "text-red-500"}`}>
                              {draft.difficulty}
                            </span>
                          </>
                        )}
                      </div>

                      {/* AI Summary */}
                      {draft.summary && (
                        <div className="mt-2 p-2 rounded-lg bg-purple-900/10 border border-purple-800/20">
                          <div className="text-xs text-purple-400 font-semibold mb-1">📋 Summary</div>
                          <p className="text-xs text-gray-300 leading-relaxed">{draft.summary}</p>
                        </div>
                      )}

                      {/* AI Prompt */}
                      {draft.prompt && (
                        <div className="mt-2 p-2 rounded-lg bg-blue-900/10 border border-blue-800/20">
                          <div className="text-xs text-blue-400 font-semibold mb-1">💬 Prompt</div>
                          <p className="text-xs text-gray-300 leading-relaxed font-mono">{draft.prompt}</p>
                        </div>
                      )}

                      {/* Transcript (collapsible) */}
                      {draft.transcript && (
                        <div className="mt-2">
                          <button onClick={() => toggleTranscript(draft.id)} className="text-xs text-gray-500 hover:text-gray-300 transition">
                            {expandedTranscript.has(draft.id) ? "▼" : "▶"} Transcript ({draft.transcriptSource === "captions" ? "captions" : "description"}) • {(draft.transcript.length / 1000).toFixed(1)}K chars
                          </button>
                          {expandedTranscript.has(draft.id) && (
                            <div className="mt-1 p-2 rounded-lg bg-[#0a0a0f] border border-[#1e1e30] max-h-40 overflow-y-auto">
                              <p className="text-xs text-gray-400 whitespace-pre-wrap">{draft.transcript.slice(0, 3000)}{draft.transcript.length > 3000 ? "..." : ""}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mt-1.5">
                        📅 Approved {timeAgo(draft.createdAt)}
                        {draft.timeEstimate && <span className="ml-2">⏱ {draft.timeEstimate}</span>}
                      </div>

                      <div className="flex gap-2 mt-2.5 flex-wrap">
                        <a href={`https://www.youtube.com/watch?v=${draft.videoId}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-lg bg-[#1a1a2e] text-gray-300 text-xs hover:bg-[#2a2a3e] transition">
                          ▶ Preview
                        </a>
                        <button
                          onClick={() => generateAIContent(draft)}
                          disabled={generatingId === draft.id}
                          className="px-3 py-1 rounded-lg bg-purple-600/20 text-purple-400 text-xs font-semibold hover:bg-purple-600/30 transition disabled:opacity-50"
                        >
                          {generatingId === draft.id ? "⏳ Generating..." : draft.aiGenerated ? "🔄 Regenerate" : "🤖 Generate AI"}
                        </button>
                        <button onClick={() => startEdit(draft)} className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-semibold hover:bg-blue-600/30 transition">
                          ✏️ Edit
                        </button>
                        <button onClick={() => publishSingle(draft.id)} disabled={publishing} className="px-3 py-1 rounded-lg bg-green-600/20 text-green-400 text-xs font-semibold hover:bg-green-600/30 transition disabled:opacity-50">
                          ✅ Publish
                        </button>
                        <button onClick={() => deleteDraft(draft.id)} className="px-3 py-1 rounded-lg bg-red-600/10 text-red-400/70 text-xs hover:bg-red-600/20 transition">
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
