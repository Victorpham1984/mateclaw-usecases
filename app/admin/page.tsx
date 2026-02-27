"use client";

import { useState, useEffect, useCallback } from "react";
import { CATEGORIES } from "@/lib/categories";
import type { UseCase, CategoryKey, SourceType, DifficultyLevel } from "@/lib/types";

const SOURCE_TYPES: SourceType[] = ["youtube", "github", "twitter", "x", "reddit", "hackernews", "linkedin", "medium", "article", "forum", "web", "community"];
const DIFFICULTIES: DifficultyLevel[] = ["beginner", "intermediate", "expert"];

const EMPTY_FORM = {
  title: "", description: "", prompt: "", category: "setup" as CategoryKey,
  tags: "", sourceType: "web" as SourceType, sourceUrl: "", creator: "",
  channel: "", videoTitle: "", timestamp: "",
  difficulty: "beginner" as DifficultyLevel, timeEstimate: "", roi: "",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [cases, setCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState({ category: "", source: "", search: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchCases = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/cases");
    if (res.status === 401) { setAuthed(false); setLoading(false); return; }
    const data = await res.json();
    setCases(data.cases || []);
    setLoading(false);
  }, []);

  const handleLogin = async () => {
    setAuthError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setAuthed(true); setPassword(""); }
    else setAuthError("Wrong password");
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false);
    setCases([]);
  };

  useEffect(() => {
    // Check if already authed
    fetch("/api/admin/cases").then((r) => {
      if (r.ok) { setAuthed(true); r.json().then((d) => setCases(d.cases || [])); }
    });
  }, []);

  useEffect(() => { if (authed) fetchCases(); }, [authed, fetchCases]);

  const setField = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (uc: UseCase) => {
    setForm({
      title: uc.title, description: uc.description, prompt: uc.prompt,
      category: uc.category, tags: uc.tags.join(", "),
      sourceType: uc.source.type, sourceUrl: uc.source.url,
      creator: uc.source.creator || "", channel: uc.source.channel || "",
      videoTitle: uc.source.videoTitle || "",
      timestamp: uc.source.timestamp ? String(uc.source.timestamp) : "",
      difficulty: uc.difficulty || "beginner",
      timeEstimate: uc.timeEstimate || "", roi: uc.roi || "",
    });
    setEditId(uc.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const required = ["title", "category", "description", "prompt", "difficulty", "timeEstimate"];
    for (const f of required) {
      if (!(form as Record<string, string>)[f]) {
        setMsg(`Missing: ${f}`); return;
      }
    }
    setSaving(true);
    const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    const url = editId ? `/api/admin/cases/${editId}` : "/api/admin/cases";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (res.ok) {
      setCases(data.cases);
      setShowForm(false);
      const syncStatus = data.gitSynced ? "& committed to GitHub ✨" : "(⚠️ GitHub sync failed, will retry on next deploy)";
      setMsg(editId ? `✅ Updated ${syncStatus}` : `✅ Added ${syncStatus}`);
    } else {
      setMsg(`❌ ${data.error}`);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/cases/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setCases(data.cases);
      const syncStatus = data.gitSynced ? "& committed to GitHub" : "(⚠️ GitHub sync pending)";
      setMsg(`🗑 Deleted ${syncStatus}`);
    }
    setDeleteConfirm(null);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ useCases: cases }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cases-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  // Filter
  const filtered = cases.filter((c) => {
    if (filter.category && c.category !== filter.category) return false;
    if (filter.source && c.source.type !== filter.source) return false;
    if (filter.search && !c.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  // Login screen
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-[#FFD460] mb-4">🔒 MateClaw Admin</h1>
          <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-[#e6edf3] mb-3 focus:border-[#FFD460] outline-none" />
          {authError && <p className="text-red-400 text-sm mb-2">{authError}</p>}
          <button onClick={handleLogin} className="w-full bg-[#FFD460] text-[#0d1117] font-semibold rounded-lg py-2 hover:bg-[#ffe080] transition-colors">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Header */}
      <header className="border-b border-[#30363d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-[#FFD460]">⚡ MateClaw Admin</h1>
          <span className="text-xs text-[#8b949e]">{cases.length} cases</span>
          {msg && <span className="text-xs text-emerald-400 ml-2">{msg}</span>}
        </div>
        <div className="flex items-center gap-2">
          <a href="/admin/youtube" className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:text-red-300 hover:border-red-500/50 transition-colors">📺 YouTube Pipeline</a>
          <button onClick={exportJson} className="text-xs px-3 py-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#FFD460] hover:border-[#FFD460]/30 transition-colors">📥 Export JSON</button>
          <button onClick={openNew} className="text-xs px-3 py-1.5 rounded-lg bg-[#FFD460] text-[#0d1117] font-semibold hover:bg-[#ffe080] transition-colors">+ Add Case</button>
          <button onClick={handleLogout} className="text-xs px-3 py-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-red-400 transition-colors">Logout</button>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 py-3 flex gap-3 border-b border-[#30363d]">
        <input placeholder="Search title..." value={filter.search} onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-sm text-[#e6edf3] w-64 focus:border-[#FFD460] outline-none" />
        <select value={filter.category} onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value }))}
          className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-sm text-[#e6edf3] focus:border-[#FFD460] outline-none">
          <option value="">All Categories</option>
          {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filter.source} onChange={(e) => setFilter((f) => ({ ...f, source: e.target.value }))}
          className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-sm text-[#e6edf3] focus:border-[#FFD460] outline-none">
          <option value="">All Sources</option>
          {SOURCE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        {loading ? <p className="text-[#8b949e]">Loading...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#8b949e] border-b border-[#30363d]">
                  <th className="py-2 px-2 w-16">ID</th>
                  <th className="py-2 px-2">Title</th>
                  <th className="py-2 px-2 w-28">Category</th>
                  <th className="py-2 px-2 w-24">Source</th>
                  <th className="py-2 px-2 w-24">Difficulty</th>
                  <th className="py-2 px-2 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((uc) => (
                  <tr key={uc.id} className="border-b border-[#30363d]/50 hover:bg-[#161b22] transition-colors">
                    <td className="py-2 px-2 text-[#8b949e] font-mono text-xs">{uc.id}</td>
                    <td className="py-2 px-2">{uc.title.replace(/\*\*/g, "")}</td>
                    <td className="py-2 px-2 text-xs">{CATEGORIES[uc.category]?.label || uc.category}</td>
                    <td className="py-2 px-2 text-xs text-[#8b949e]">{uc.source.type}</td>
                    <td className="py-2 px-2 text-xs">{uc.difficulty || "-"}</td>
                    <td className="py-2 px-2">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(uc)} className="text-xs px-2 py-1 rounded border border-[#30363d] text-[#8b949e] hover:text-[#FFD460] hover:border-[#FFD460]/30 transition-colors">Edit</button>
                        {deleteConfirm === uc.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(uc.id)} className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30">Yes</button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-xs px-2 py-1 rounded border border-[#30363d] text-[#8b949e]">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(uc.id)} className="text-xs px-2 py-1 rounded border border-[#30363d] text-[#8b949e] hover:text-red-400 hover:border-red-500/30 transition-colors">Del</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-[#8b949e] py-8">No cases found</p>}
          </div>
        )}
      </div>

      {/* Note about SSG */}
      <div className="px-6 pb-4">
        <p className="text-xs text-[#8b949e]">💾 Changes are saved locally and committed to GitHub automatically. Vercel will auto-rebuild (~60 sec). Refresh homepage to see updates.</p>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center pt-10 z-50 overflow-y-auto">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 w-full max-w-2xl mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#FFD460]">{editId ? `Edit ${editId}` : "Add New Case"}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#8b949e] hover:text-[#e6edf3] text-xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-[#8b949e] mb-1 block">Title *</label>
                <input value={form.title} onChange={(e) => setField("title", e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#FFD460] outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Category *</label>
                <select value={form.category} onChange={(e) => setField("category", e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#FFD460] outline-none">
                  {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Difficulty *</label>
                <select value={form.difficulty} onChange={(e) => setField("difficulty", e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#FFD460] outline-none">
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[#8b949e] mb-1 block">Description *</label>
                <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#FFD460] outline-none resize-y" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[#8b949e] mb-1 block">Prompt *</label>
                <textarea value={form.prompt} onChange={(e) => setField("prompt", e.target.value)} rows={4}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#FFD460] outline-none resize-y" />
              </div>
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Time Estimate *</label>
                <input value={form.timeEstimate} onChange={(e) => setField("timeEstimate", e.target.value)} placeholder="e.g. 30 phút"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#FFD460] outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">ROI</label>
                <input value={form.roi} onChange={(e) => setField("roi", e.target.value)} placeholder="e.g. Save 2h/week"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#FFD460] outline-none" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[#8b949e] mb-1 block">Tags (comma-separated)</label>
                <input value={form.tags} onChange={(e) => setField("tags", e.target.value)} placeholder="ai, automation, startup"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#FFD460] outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Source Type</label>
                <select value={form.sourceType} onChange={(e) => setField("sourceType", e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#FFD460] outline-none">
                  {SOURCE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Source URL</label>
                <input value={form.sourceUrl} onChange={(e) => setField("sourceUrl", e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#FFD460] outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Creator</label>
                <input value={form.creator} onChange={(e) => setField("creator", e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#FFD460] outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#8b949e] mb-1 block">Video Title</label>
                <input value={form.videoTitle} onChange={(e) => setField("videoTitle", e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] focus:border-[#FFD460] outline-none" />
              </div>
            </div>

            {/* Live Preview */}
            <div className="mt-4 p-4 rounded-lg border border-[#30363d] bg-[#0d1117]">
              <p className="text-xs text-[#8b949e] mb-2">Preview:</p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full border border-[#30363d] text-[#8b949e]">{CATEGORIES[form.category]?.label}</span>
                <span className="text-xs text-[#8b949e]">{form.timeEstimate}</span>
                <span className="text-xs text-[#8b949e]">{form.difficulty}</span>
              </div>
              <h3 className="text-base font-semibold text-[#e6edf3]">{form.title || "Untitled"}</h3>
              <p className="text-sm text-[#8b949e] mt-1">{form.description.slice(0, 150) || "No description"}</p>
              {form.roi && <p className="text-xs text-[#FFD460]/80 mt-1">⚡ {form.roi}</p>}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] text-sm transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={saving}
                className="px-4 py-2 rounded-lg bg-[#FFD460] text-[#0d1117] font-semibold text-sm hover:bg-[#ffe080] transition-colors disabled:opacity-50">
                {saving ? "Saving..." : editId ? "Update" : "Add Case"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
