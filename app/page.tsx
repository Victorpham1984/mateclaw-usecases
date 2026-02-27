"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import { MagnifyingGlass, X, Cube, UsersThree, FolderOpen } from "@phosphor-icons/react";
import useCaseData from "@/data/cases.json";
import type { UseCase } from "@/lib/types";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/categories";
import CaseCard from "./components/CaseCard";

const allCases = useCaseData.useCases as UseCase[];

const fuse = new Fuse(allCases, {
  keys: ["title", "description", "tags", "prompt", "source.creator"],
  threshold: 0.3,
  includeScore: true,
});

export default function Page() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}

function Home() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cat = searchParams.get("category");
    const tag = searchParams.get("tag");
    if (cat) setActiveCategory(cat);
    if (tag) setActiveTag(tag);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let results = allCases;

    if (query.trim()) {
      results = fuse.search(query).map((r) => r.item);
    }

    if (activeCategory) {
      results = results.filter((c) => c.category === activeCategory);
    }

    if (activeTag) {
      results = results.filter((c) => c.tags.includes(activeTag));
    }

    return results;
  }, [query, activeCategory, activeTag]);

  const stats = useMemo(() => {
    const creators = new Set(allCases.map((c) => c.source.creator).filter(Boolean));
    return {
      total: allCases.length,
      categories: CATEGORY_KEYS.length,
      creators: creators.size,
    };
  }, []);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
    setActiveTag(null);
  };

  const handleTagClick = (tag: string) => {
    setActiveTag((prev) => (prev === tag ? null : tag));
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Hero */}
      <header className="relative overflow-hidden">
        {/* Glow effect behind hero */}
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#FFD460]/[0.04] rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-10 sm:pt-24 sm:pb-14">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#e6edf3] mb-3">
              <span className="text-[#FFD460]">MateClaw</span> Use Cases
            </h1>
            <p className="text-base sm:text-lg text-[#8b949e] max-w-2xl mx-auto mb-8">
              Battle-tested playbook with OpenClaw AI agents — copy prompt & start now
            </p>

            {/* Stats */}
            <div
              className={`flex items-center justify-center gap-6 sm:gap-10 mb-10 transition-opacity duration-500 ${
                mounted ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                <Cube size={18} className="text-[#FFD460]" />
                <span>
                  <strong className="text-[#e6edf3]">{stats.total}</strong> use cases
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                <FolderOpen size={18} className="text-[#FFD460]" />
                <span>
                  <strong className="text-[#e6edf3]">{stats.categories}</strong> categories
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                <UsersThree size={18} className="text-[#FFD460]" />
                <span>
                  <strong className="text-[#e6edf3]">{stats.creators}</strong> creators
                </span>
              </div>
            </div>

            {/* Upsell CTA */}
            <div className="text-center mb-8">
              <p className="text-gray-400 mb-4">
                💡 Using OpenClaw use cases is great. <strong className="text-[#e6edf3]">Building your own AI CEO is better.</strong>
              </p>
              <a
                href="/ai-ceo"
                data-cta="homepage-hero"
                className="inline-block bg-[#FFD460] text-[#2D4059] font-bold px-6 py-3 rounded-lg hover:bg-[#FFE895] transition"
              >
                Learn to build your AI squad in 7 days →
              </a>
            </div>

            {/* Search */}
            <div className="relative max-w-xl mx-auto mb-8">
              <MagnifyingGlass
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b949e]"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search use cases, tags, prompts..."
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#161b22] border border-[#30363d] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#FFD460]/50 focus:ring-1 focus:ring-[#FFD460]/20 transition-all text-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#e6edf3] cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setActiveTag(null);
                }}
                className={`chip text-xs px-3 py-1.5 rounded-full border cursor-pointer ${
                  !activeCategory && !activeTag
                    ? "active"
                    : "border-[#30363d] text-[#8b949e]"
                }`}
              >
                All
              </button>
              {CATEGORY_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => handleCategoryClick(key)}
                  className={`chip text-xs px-3 py-1.5 rounded-full border cursor-pointer ${
                    activeCategory === key
                      ? "active"
                      : "border-[#30363d] text-[#8b949e]"
                  }`}
                >
                  {CATEGORIES[key].label}
                </button>
              ))}
            </div>

            {/* Active tag indicator */}
            {activeTag && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="text-xs text-[#8b949e]">Filter by tag:</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD460]/20 text-[#FFD460] border border-[#FFD460]/30">
                  #{activeTag}
                </span>
                <button
                  onClick={() => setActiveTag(null)}
                  className="text-[#8b949e] hover:text-[#e6edf3] cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#8b949e]">
            {filtered.length} results
            {query && <span className="text-[#484f58]"> for &ldquo;{query}&rdquo;</span>}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#8b949e] text-lg mb-2">No use cases found</p>
            <p className="text-[#484f58] text-sm">Try searching with different keywords</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((uc) => (
              <CaseCard
                key={uc.id}
                useCase={uc}
                onTagClick={handleTagClick}
                onCategoryClick={handleCategoryClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Upsell Footer Banner */}
      <div className="bg-[#2D4059] border-t border-[#FFD460]/20 py-4 text-center">
        <p className="text-gray-300">
          Ready to 10x your productivity?
          <a href="/ai-ceo" data-cta="footer-banner" className="text-[#FFD460] hover:underline ml-2 font-semibold">
            Build your AI squad →
          </a>
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#30363d] py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#484f58]">
            Built with 💛 by{" "}
            <span className="text-[#FFD460]">BizMate</span> — Powered by OpenClaw
          </p>
          <a
            href="https://github.com/nicenemo/mateclaw-usecases"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#484f58] hover:text-[#8b949e] transition-colors"
          >
            Contribute on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
