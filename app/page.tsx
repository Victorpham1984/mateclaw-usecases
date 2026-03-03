"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Fuse from "fuse.js";
import { MagnifyingGlass, X, GithubLogo, BookOpen } from "@phosphor-icons/react";
import useCaseData from "@/data/cases.json";
import type { UseCase } from "@/lib/types";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/categories";
import CaseCard from "./components/CaseCard";
import { CATEGORY_COLORS } from "./components/CategoryChart";
import ThemeToggle from "./components/ThemeToggle";
import AnimatedBackground from "./components/AnimatedBackground";

const CategoryChart = dynamic(() => import("./components/CategoryChart"), {
  ssr: false,
  loading: () => <div className="w-[200px] h-[200px] mx-auto" />,
});

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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allCases.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return CATEGORY_KEYS.map((key) => ({
      key,
      label: CATEGORIES[key].label,
      count: counts[key] || 0,
    }));
  }, []);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
    setActiveTag(null);
  };

  const handleTagClick = (tag: string) => {
    setActiveTag((prev) => (prev === tag ? null : tag));
  };

  return (
    <div className="min-h-screen bg-main">
      <AnimatedBackground />

      {/* Sticky Header */}
      <nav className="sticky top-0 z-50 bg-nav backdrop-blur-md border-b border-theme h-14 flex items-center px-4">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          {/* Left: Branding */}
          <div className="flex flex-col">
            <span className="text-base font-bold text-primary leading-tight">
              <span className="text-[#FFD460]">Mate</span>Claw
            </span>
            <span className="hidden sm:block text-[10px] text-muted leading-tight">
              Built by BizMate ·{" "}
              <a
                href="https://www.skool.com/bizmate-ai-community-9131"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FFD460] hover:underline"
              >
                Learn how at BizMate
              </a>
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="https://github.com/openclaw/openclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-primary transition-colors"
            >
              <GithubLogo size={20} />
            </a>
            <a
              href="https://www.skool.com/bizmate-ai-community-9131"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FFD460] text-[#2D4059] hover:bg-[#FFE895] transition-colors"
            >
              <BookOpen size={14} />
              Learn AI
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-10 sm:pt-20 sm:pb-14">
          {/* Two-column layout: left = title + search, right = stats */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center lg:items-start">
            {/* Left side: Title + Description + Search */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-primary mb-3">
                <span className="text-[#FFD460]">{stats.total}</span> Use Cases of OpenClaw
              </h1>
              <p className="text-base sm:text-lg text-muted max-w-2xl mb-8">
                Battle-tested playbook with OpenClaw AI agents — copy prompt & start now
              </p>

              {/* Search */}
              <div className="relative max-w-xl mb-6">
                <MagnifyingGlass
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search use cases, tags, prompts..."
                  className="w-full pl-11 pr-10 py-3 rounded-xl bg-card border border-theme text-primary placeholder:text-muted/50 focus:outline-none focus:border-[#FFD460]/50 focus:ring-1 focus:ring-[#FFD460]/20 transition-all text-sm"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Upsell CTA */}
              <div className="mb-6">
                <p className="text-muted mb-3 text-sm">
                  💡 Using OpenClaw use cases is great.{" "}
                  <strong className="text-primary">Building your own AI CEO is better.</strong>
                </p>
                <a
                  href="/ai-ceo"
                  data-cta="homepage-hero"
                  className="inline-block bg-[#FFD460] text-[#2D4059] font-bold px-5 py-2.5 rounded-lg hover:bg-[#FFE895] transition text-sm"
                >
                  Learn to build your AI squad in 7 days →
                </a>
              </div>
            </div>

            {/* Right side: Stats + Donut */}
            <div
              className={`flex flex-col items-center gap-6 transition-opacity duration-500 ${
                mounted ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary">{stats.total}</div>
                  <div className="text-xs text-muted mt-1">use cases</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary">{stats.categories}</div>
                  <div className="text-xs text-muted mt-1">categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary">{stats.creators}</div>
                  <div className="text-xs text-muted mt-1">creators</div>
                </div>
              </div>

              {/* Donut Chart */}
              <div>
                <CategoryChart categoryCounts={categoryCounts} />
              </div>
            </div>
          </div>

          {/* Category filters - full width below */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-10 mb-2">
            <button
              onClick={() => {
                setActiveCategory(null);
                setActiveTag(null);
              }}
              className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                !activeCategory && !activeTag
                  ? "border-[#FFD460] bg-[#FFD460]/10 text-[#FFD460]"
                  : "border-theme text-muted hover:border-[#484f58]"
              }`}
            >
              All
            </button>
            {CATEGORY_KEYS.map((key) => {
              const color = CATEGORY_COLORS[key] || "#8b949e";
              const isActive = activeCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => handleCategoryClick(key)}
                  className="text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors"
                  style={
                    isActive
                      ? { borderColor: color, backgroundColor: `${color}20`, color }
                      : { borderColor: "var(--border)", color: "var(--text-muted)" }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = `${color}80`;
                      e.currentTarget.style.color = color;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }
                  }}
                >
                  {CATEGORIES[key].label}
                </button>
              );
            })}
          </div>

          {/* Active tag indicator */}
          {activeTag && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-xs text-muted">Filter by tag:</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD460]/20 text-[#FFD460] border border-[#FFD460]/30">
                #{activeTag}
              </span>
              <button
                onClick={() => setActiveTag(null)}
                className="text-muted hover:text-primary cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted">
            {filtered.length} results
            {query && <span className="opacity-60"> for &ldquo;{query}&rdquo;</span>}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg mb-2">No use cases found</p>
            <p className="text-muted opacity-60 text-sm">Try searching with different keywords</p>
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
      <footer className="border-t border-theme py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted opacity-70">
            Built with 💛 by{" "}
            <a
              href="https://www.skool.com/bizmate-ai-community-9131"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FFD460] hover:underline"
            >
              BizMate
            </a>{" "}
            — Powered by OpenClaw
          </p>
          <a
            href="https://github.com/openclaw/openclaw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted opacity-70 hover:opacity-100 transition-opacity"
          >
            Contribute on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
