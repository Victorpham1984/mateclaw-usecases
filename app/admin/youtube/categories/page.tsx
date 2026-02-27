"use client";
import { useState, useEffect, useCallback } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  sort_order: number;
  status: string;
  use_case_count: number;
  created_at: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    icon: "📁",
    color: "#60a5fa",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/yt-categories", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/yt-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowAdd(false);
        setForm({ name: "", icon: "📁", color: "#60a5fa", description: "" });
        fetchCategories();
      }
    } catch (err) {
      console.error("Failed to add category:", err);
    }
    setSaving(false);
  };

  const handleEdit = async (id: string) => {
    try {
      await fetch("/api/admin/yt-categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, ...editForm }),
      });
      setEditingId(null);
      setEditForm({});
      fetchCategories();
    } catch (err) {
      console.error("Failed to edit category:", err);
    }
  };

  const handleToggleStatus = async (cat: Category) => {
    const newStatus = cat.status === "active" ? "archived" : "active";
    try {
      await fetch("/api/admin/yt-categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: cat.id, status: newStatus }),
      });
      fetchCategories();
    } catch (err) {
      console.error("Failed to toggle category:", err);
    }
  };

  const handleMerge = async (sourceId: string) => {
    const targetId = prompt("Enter target category ID to merge into (copy from list):");
    if (!targetId) return;
    try {
      await fetch("/api/admin/yt-categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: sourceId, merge_into: targetId }),
      });
      fetchCategories();
    } catch (err) {
      console.error("Merge failed:", err);
    }
  };

  const active = categories.filter((c) => c.status === "active");
  const pending = categories.filter((c) => c.status === "pending");
  const archived = categories.filter((c) => c.status === "archived");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-gray-400 text-sm mt-1">Manage use case categories</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition text-sm"
        >
          + Add Category
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-[#12121f] border border-[#1e1e30] rounded-xl p-5">
          <h3 className="font-semibold mb-4">Add New Category</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Icon (emoji)</label>
                <input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Color</label>
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-full h-10 rounded-lg bg-[#0a0a0f] border border-[#2e2e40] cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add Category"}
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

      {/* Pending (AI-suggested) */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-yellow-400">🆕</span> Pending Review ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((cat) => (
              <div
                key={cat.id}
                className="bg-yellow-900/10 border border-yellow-800/20 rounded-xl p-4 flex items-center gap-4"
              >
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{cat.name}</h3>
                  <div className="text-xs text-gray-500">{cat.use_case_count} use cases</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus({ ...cat, status: "pending" })}
                    className="px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 text-xs font-semibold"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleMerge(cat.id)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-semibold"
                  >
                    🔗 Merge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Categories */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse text-4xl mb-2">📁</div>
          <p className="text-gray-400">Loading categories...</p>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-3">Active Categories ({active.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {active.map((cat) => (
              <div key={cat.id} className="bg-[#12121f] border border-[#1e1e30] rounded-xl p-4">
                {editingId === cat.id ? (
                  <div className="space-y-2">
                    <input
                      value={editForm.name ?? cat.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-[#0a0a0f] border border-[#2e2e40] text-sm"
                    />
                    <div className="flex gap-2">
                      <input
                        value={editForm.icon ?? cat.icon}
                        onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                        className="w-16 px-2 py-1 rounded bg-[#0a0a0f] border border-[#2e2e40] text-sm"
                      />
                      <input
                        type="color"
                        value={editForm.color ?? cat.color}
                        onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                        className="w-10 h-8 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(cat.id)}
                        className="px-3 py-1 rounded bg-blue-600 text-white text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditForm({}); }}
                        className="px-3 py-1 rounded bg-[#1a1a2e] text-gray-400 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ background: cat.color + "20" }}
                    >
                      {cat.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{cat.name}</h3>
                      <div className="text-xs text-gray-500">{cat.use_case_count} use cases</div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingId(cat.id); setEditForm({}); }}
                        className="p-1.5 rounded text-gray-400 hover:bg-[#1a1a2e] text-xs"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        className="p-1.5 rounded text-gray-400 hover:bg-[#1a1a2e] text-xs"
                      >
                        📦
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Archived */}
      {archived.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-500">Archived ({archived.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {archived.map((cat) => (
              <div
                key={cat.id}
                className="bg-[#0a0a0f] border border-[#1e1e30] rounded-xl p-4 opacity-60 flex items-center gap-3"
              >
                <span className="text-lg">{cat.icon}</span>
                <div className="flex-1">
                  <h3 className="text-sm">{cat.name}</h3>
                </div>
                <button
                  onClick={() => handleToggleStatus(cat)}
                  className="text-xs text-blue-400 hover:underline"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
