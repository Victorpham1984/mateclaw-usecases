"use client";
import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function YouTubeAdminLayout({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Check if already authenticated
  useEffect(() => {
    fetch("/api/admin/yt-drafts", { credentials: "include" })
      .then((res) => {
        if (res.ok) setAuthenticated(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "include",
    });
    if (res.ok) {
      setAuthenticated(true);
    } else {
      setError("Invalid password");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-4xl">🐾</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🐾</div>
            <h1 className="text-2xl font-bold text-white">MateClaw Admin</h1>
            <p className="text-gray-400 text-sm mt-1">YouTube Use Cases Pipeline</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-center text-lg tracking-wider"
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin/youtube", label: "Dashboard", icon: "📊" },
    { href: "/admin/youtube/drafts", label: "Drafts", icon: "📝" },
    { href: "/admin/youtube/sources", label: "Sources", icon: "📺" },
    { href: "/admin/youtube/categories", label: "Categories", icon: "📁" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top nav */}
      <header className="h-14 bg-[#12121f] border-b border-[#1e1e30] flex items-center px-4 md:px-6 gap-4">
        <Link href="/admin/youtube" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🐾</span>
          <span className="font-bold text-lg">MateClaw</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">YouTube</span>
        </Link>

        <nav className="flex gap-1 ml-4 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${
                pathname === item.href
                  ? "bg-blue-600/20 text-blue-400 font-semibold"
                  : "text-gray-400 hover:bg-[#1a1a2e] hover:text-white"
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/admin"
            className="text-xs text-gray-500 hover:text-gray-300 transition"
          >
            ← Cases Admin
          </Link>
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-gray-300 transition"
          >
            ← Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">{children}</main>
    </div>
  );
}
