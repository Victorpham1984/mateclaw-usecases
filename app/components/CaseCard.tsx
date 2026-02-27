"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Copy, Check, ArrowSquareOut, Clock, Lightning } from "@phosphor-icons/react";
import type { UseCase } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";

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

const difficultyConfig = {
  beginner: { label: "Beginner", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  intermediate: { label: "Intermediate", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  expert: { label: "Expert", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

interface Props {
  useCase: UseCase;
  onTagClick: (tag: string) => void;
  onCategoryClick: (cat: string) => void;
}

export default function CaseCard({ useCase, onTagClick, onCategoryClick }: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(useCase.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const desc = useCase.description;
  const truncated = desc.length > 150;
  const displayDesc = expanded || !truncated ? desc : desc.slice(0, 150) + "...";
  const cat = CATEGORIES[useCase.category];
  const diff = useCase.difficulty ? difficultyConfig[useCase.difficulty] : null;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="card-spotlight group rounded-xl border border-[#30363d] bg-[#161b22] p-5 flex flex-col gap-3"
    >
      {/* Header: category + difficulty */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <button
          onClick={() => onCategoryClick(useCase.category)}
          className="text-xs px-2 py-0.5 rounded-full border border-[#30363d] text-[#8b949e] hover:text-[#FFD460] hover:border-[#FFD460]/30 transition-colors cursor-pointer"
        >
          {cat?.label || useCase.category}
        </button>
        <div className="flex items-center gap-2">
          {useCase.timeEstimate && (
            <span className="flex items-center gap-1 text-xs text-[#8b949e]">
              <Clock size={12} /> {useCase.timeEstimate}
            </span>
          )}
          {diff && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${diff.color}`}>
              {diff.label}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <Link href={`/cases/${useCase.id}`} className="relative z-10">
        <h3 className="text-base font-semibold leading-snug text-[#e6edf3] group-hover:text-[#FFD460] transition-colors">
          {parseBold(useCase.title)}
        </h3>
      </Link>

      {/* Description */}
      <p className="text-sm text-[#8b949e] leading-relaxed relative z-10">
        {displayDesc}
        {truncated && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-[#FFD460] hover:underline ml-1 cursor-pointer"
          >
            show more
          </button>
        )}
      </p>

      {/* ROI badge */}
      {useCase.roi && (
        <div className="flex items-center gap-1.5 text-xs text-[#FFD460]/80 relative z-10">
          <Lightning size={12} weight="fill" />
          <span>{useCase.roi}</span>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 relative z-10">
        {useCase.tags.slice(0, 4).map((tag) => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className="chip text-xs px-2 py-0.5 rounded-md border border-[#30363d] text-[#8b949e] cursor-pointer"
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Footer: source + copy */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#30363d] relative z-10">
        <a
          href={useCase.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#FFD460] transition-colors"
        >
          <ArrowSquareOut size={12} />
          <span className="truncate max-w-[140px]">
            {useCase.source.creator || "Source"}
          </span>
        </a>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            copied
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-[#FFD460]/10 text-[#FFD460] hover:bg-[#FFD460]/20"
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy prompt"}
        </button>
      </div>
    </div>
  );
}
