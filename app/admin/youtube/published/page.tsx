"use client";
import { useState, useEffect } from "react";

type PublishedCase = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
  source: {
    type: string;
    url: string;
    creator?: string;
    channel?: string;
    videoTitle?: string;
  };
  addedAt: string;
  difficulty?: string;
  timeEstimate?: string;
  roi?: string;
};

const CATEGORIES = [
  "setup", "development", "marketing", "content", "automation",
  "customer-support", "analytics", "finance", "sales", "growth",
];

const SOURCE_TYPES = ["all", "youtube", "x", "reddit", "github", "web", "article"];

export default function PublishedPage() {
  const [cases, setCases] = useState<PublishedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Partial<PublishedCase>>({});

  useEffect(() => { loadCases(); }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cases", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load cases");
      const data = await res.json();
      setCases(data.cases || []);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const filtered = cases.filter((c) => {
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    if (filterSource !== "all" && c.source?.type !== filterSource) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    }
    return true;
  });

  const startEdit = (c: PublishedCase) => {
    setEditingId(c.id);
    setEditFields({ title: c.title, description: c.description, category: c.category, prompt: c.prompt });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/cases/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editFields),
      });
      if (!res.ok) throw new Error("Failed to save");
      setEditingId(null);
      setSuccessMsg("✅ Case updated!");
      await loadCases();
    } catch (err: any) { setError(err.message); }
  };

  const deleteCase = async (id: string) => {
    if (!confirm("Delete this case?")) return;
    try {
      const res = await fetch(`/api/admin/cases/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
      setSuccessMsg("🗑️ Case deleted");
      await loadCases();
    } catch (err: any) { setError(err.message); }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse text-4xl">📦</div>
        <p className="text-gray-400 mt-2">Loading published cases...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📦 Published Cases ({cases.length})</h1>
        <p className="text-gray-400 text-sm mt-1">Manage all published use cases across all sources</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-end flex-wrap">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Search</label>
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search title..." className="px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500 w-48" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Category</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm">
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Source</label>
          <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm">
            {SOURCE_TYPES.map((s) => <option key={s} value={s}>{s === "all" ? "All Sources" : s}</option>)}
          </select>
        </div>
        <div className="text-xs text-gray-500 py-2">
          Showing {filtered.length} of {cases.length}
        </div>
      </div>

      {error && <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 text-sm text-red-400">❌ {error}</div>}
      {successMsg && <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-3 text-sm text-green-400">{successMsg}</div>}

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-[#12121f] border border-[#1e1e30] rounded-xl">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-400">No published cases found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id} className="bg-[#12121f] border border-[#1e1e30] rounded-xl p-4">
              {editingId === c.id ? (
                <div className="space-y-3">
                  <input value={editFields.title || ""} onChange={(e) => setEditFields((p) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500" />
                  <textarea value={editFields.description || ""} onChange={(e) => setEditFields((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500" />
                  <textarea value={editFields.prompt || ""} onChange={(e) => setEditFields((p) => ({ ...p, prompt: e.target.value }))} rows={2} placeholder="Prompt" className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm font-mono focus:outline-none focus:border-blue-500" />
                  <div className="flex gap-2 items-center">
                    <select value={editFields.category} onChange={(e) => setEditFields((p) => ({ ...p, category: e.target.value }))} className="px-3 py-1.5 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm">
                      {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <button onClick={saveEdit} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition">💾 Save</button>
                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] text-gray-300 text-xs hover:bg-[#2a2a3e] transition">Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{c.title.replace(/\*\*/g, "")}</span>
                        <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          c.source?.type === "youtube" ? "bg-red-600/20 text-red-400" :
                          c.source?.type === "github" ? "bg-gray-600/20 text-gray-400" :
                          "bg-blue-600/20 text-blue-400"
                        }`}>
                          {c.source?.type || "web"}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1a1a2e] text-gray-400">{c.category}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {c.source?.creator && <span>👤 {c.source.creator} • </span>}
                        📅 {c.addedAt}
                        {c.difficulty && <span> • {c.difficulty}</span>}
                        {c.timeEstimate && <span> • ⏱ {c.timeEstimate}</span>}
                        {c.roi && <span> • {c.roi}</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.description}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {c.source?.url && (
                        <a href={c.source.url} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-lg bg-[#1a1a2e] text-gray-400 text-xs hover:bg-[#2a2a3e] transition">🔗</a>
                      )}
                      <button onClick={() => startEdit(c)} className="px-2 py-1 rounded-lg bg-blue-600/20 text-blue-400 text-xs hover:bg-blue-600/30 transition">✏️</button>
                      <button onClick={() => deleteCase(c.id)} className="px-2 py-1 rounded-lg bg-red-600/10 text-red-400/70 text-xs hover:bg-red-600/20 transition">🗑️</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
