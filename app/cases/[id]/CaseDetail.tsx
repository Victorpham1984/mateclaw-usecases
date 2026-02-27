"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Check,
  ArrowSquareOut,
  Clock,
  Lightning,
  ShareNetwork,
  TwitterLogo,
  TelegramLogo,
  Link as LinkIcon,
  CaretRight,
  House,
} from "@phosphor-icons/react";
import useCaseData from "@/data/cases.json";
import type { UseCase } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";

const allCases = useCaseData.useCases as UseCase[];

function getCaseById(id: string): UseCase | undefined {
  return allCases.find((c) => c.id === id);
}

function getRelatedCases(current: UseCase): UseCase[] {
  return allCases
    .filter((c) => c.category === current.category && c.id !== current.id)
    .slice(0, 3);
}

function parseBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-[#FFD460]">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function stripBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, "$1");
}

const difficultyConfig = {
  beginner: { label: "Beginner", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  intermediate: { label: "Intermediate", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  expert: { label: "Expert", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

// ── BreadcrumbNav ──────────────────────────────────────────────
function BreadcrumbNav({ useCase }: { useCase: UseCase }) {
  const cat = CATEGORIES[useCase.category];
  return (
    <nav className="flex items-center gap-1.5 text-sm text-[#8b949e] flex-wrap">
      <Link href="/" className="hover:text-[#FFD460] transition-colors flex items-center gap-1">
        <House size={14} />
        Home
      </Link>
      <CaretRight size={12} className="text-[#484f58]" />
      <Link
        href={`/?category=${useCase.category}`}
        className="hover:text-[#FFD460] transition-colors"
      >
        {cat?.label || useCase.category}
      </Link>
      <CaretRight size={12} className="text-[#484f58]" />
      <span className="text-[#e6edf3] truncate max-w-[250px]">{stripBold(useCase.title)}</span>
    </nav>
  );
}

// ── PromptBlock ────────────────────────────────────────────────
function PromptBlock({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = blockRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={blockRef}
      onMouseMove={handleMouseMove}
      className="relative group rounded-xl border border-[#30363d] bg-[#0d1117] overflow-hidden
                 before:absolute before:w-[300px] before:h-[300px] before:rounded-full
                 before:bg-[#FFD460]/[0.06] before:blur-[80px] before:pointer-events-none
                 before:top-[var(--mouse-y,50%)] before:left-[var(--mouse-x,50%)]
                 before:-translate-x-1/2 before:-translate-y-1/2 before:opacity-0
                 hover:before:opacity-100 before:transition-opacity before:duration-300"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d] bg-[#161b22]">
        <span className="text-xs text-[#8b949e] font-mono">📋 Prompt</span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg transition-all cursor-pointer font-medium ${
            copied
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-[#FFD460]/10 text-[#FFD460] hover:bg-[#FFD460]/20"
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Đã copy!" : "Copy prompt"}
        </button>
      </div>
      <pre className="p-5 text-sm text-[#e6edf3] font-mono leading-relaxed whitespace-pre-wrap break-words relative z-10">
        {prompt}
      </pre>
    </div>
  );
}

// ── ShareButtons ───────────────────────────────────────────────
function ShareButtons({ useCase }: { useCase: UseCase }) {
  const [copied, setCopied] = useState(false);
  const title = stripBold(useCase.title);

  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => {
    const url = window.location.href;
    const text = `${title} — MateClaw Use Cases`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  };

  const shareTelegram = () => {
    const url = window.location.href;
    const text = `${title} — MateClaw Use Cases`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#8b949e] mr-1">
        <ShareNetwork size={14} className="inline -mt-0.5" /> Share:
      </span>
      <button
        onClick={handleCopyLink}
        className={`p-2 rounded-lg border transition-all cursor-pointer ${
          copied
            ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
            : "border-[#30363d] text-[#8b949e] hover:text-[#FFD460] hover:border-[#FFD460]/30"
        }`}
        title="Copy link"
      >
        {copied ? <Check size={16} /> : <LinkIcon size={16} />}
      </button>
      <button
        onClick={shareTwitter}
        className="p-2 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#FFD460] hover:border-[#FFD460]/30 transition-all cursor-pointer"
        title="Share on X/Twitter"
      >
        <TwitterLogo size={16} />
      </button>
      <button
        onClick={shareTelegram}
        className="p-2 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#FFD460] hover:border-[#FFD460]/30 transition-all cursor-pointer"
        title="Share on Telegram"
      >
        <TelegramLogo size={16} />
      </button>
    </div>
  );
}

// ── RelatedCases ───────────────────────────────────────────────
function RelatedCases({ cases }: { cases: UseCase[] }) {
  if (cases.length === 0) return null;
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">Related Use Cases</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cases.map((uc) => {
          const cat = CATEGORIES[uc.category];
          const diff = uc.difficulty ? difficultyConfig[uc.difficulty] : null;
          return (
            <Link
              key={uc.id}
              href={`/cases/${uc.id}`}
              className="group rounded-xl border border-[#30363d] bg-[#161b22] p-4 flex flex-col gap-2 hover:border-[#FFD460]/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-0.5 rounded-full border border-[#30363d] text-[#8b949e]">
                  {cat?.label || uc.category}
                </span>
                {diff && (
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${diff.color}`}>
                    {diff.label}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-[#e6edf3] leading-snug group-hover:text-[#FFD460] transition-colors">
                {parseBold(uc.title)}
              </h3>
              <p className="text-xs text-[#8b949e] line-clamp-2">{uc.description}</p>
              {uc.timeEstimate && (
                <span className="flex items-center gap-1 text-xs text-[#8b949e] mt-auto">
                  <Clock size={12} /> {uc.timeEstimate}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function CaseDetailPage({ id }: { id: string }) {
  const router = useRouter();

  const useCase = getCaseById(id);

  if (!useCase) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#e6edf3] mb-2">Use case not found</h1>
          <p className="text-[#8b949e] mb-6">The requested use case does not exist.</p>
          <Link href="/" className="text-[#FFD460] hover:underline">
            ← Back to all use cases
          </Link>
        </div>
      </div>
    );
  }

  const cat = CATEGORIES[useCase.category];
  const diff = useCase.difficulty ? difficultyConfig[useCase.difficulty] : null;
  const related = getRelatedCases(useCase);

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-[#0d1117]/80 backdrop-blur-md border-b border-[#30363d]/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-[#8b949e] hover:text-[#FFD460] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <ShareButtons useCase={useCase} />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <BreadcrumbNav useCase={useCase} />
        </div>

        {/* Title + meta */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-[#e6edf3] leading-tight mb-4">
            {parseBold(useCase.title)}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {diff && (
              <span className={`text-xs px-3 py-1 rounded-full border ${diff.color}`}>
                {diff.label}
              </span>
            )}
            {useCase.timeEstimate && (
              <span className="flex items-center gap-1 text-sm text-[#8b949e]">
                <Clock size={14} /> {useCase.timeEstimate}
              </span>
            )}
            {useCase.roi && (
              <span className="flex items-center gap-1 text-sm text-[#FFD460]/80">
                <Lightning size={14} weight="fill" /> {useCase.roi}
              </span>
            )}
          </div>

          {/* Creator + source */}
          <div className="flex items-center gap-2 text-sm text-[#8b949e]">
            <span>by</span>
            <a
              href={useCase.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#FFD460] hover:underline"
            >
              {useCase.source.creator || "Source"}
              <ArrowSquareOut size={12} />
            </a>
          </div>
        </div>

        {/* Description */}
        <section id="description" className="mb-8">
          <p className="text-base text-[#8b949e] leading-relaxed">{useCase.description}</p>
        </section>

        {/* Prompt */}
        <section id="prompt" className="mb-8">
          <PromptBlock prompt={useCase.prompt} />
        </section>

        {/* Tags */}
        <section id="tags" className="mb-8">
          <h2 className="text-lg font-semibold text-[#e6edf3] mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {useCase.tags.map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${tag}`}
                className="text-sm px-3 py-1 rounded-full border border-[#30363d] text-[#8b949e] hover:text-[#FFD460] hover:border-[#FFD460]/30 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </section>

        {/* Prerequisites placeholder */}
        {(useCase as any).prerequisites && (
          <section id="prerequisites" className="mb-8">
            <h2 className="text-lg font-semibold text-[#e6edf3] mb-3">Prerequisites</h2>
            <ul className="list-disc list-inside text-sm text-[#8b949e] space-y-1">
              {((useCase as any).prerequisites as string[]).map((p: string, i: number) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Expected results placeholder */}
        {(useCase as any).expectedResults && (
          <section id="expected-results" className="mb-8">
            <h2 className="text-lg font-semibold text-[#e6edf3] mb-3">Expected Results</h2>
            <p className="text-sm text-[#8b949e] leading-relaxed">{(useCase as any).expectedResults}</p>
          </section>
        )}

        <hr className="border-[#30363d] my-10" />

        {/* Related cases */}
        <section id="related" className="mb-12">
          <RelatedCases cases={related} />
        </section>

        {/* Footer nav */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#FFD460] hover:underline"
          >
            <ArrowLeft size={14} />
            Quay lại tất cả use cases
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363d] py-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#484f58]">
            Built with 💛 by <span className="text-[#FFD460]">BizMate</span> — Powered by OpenClaw
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
