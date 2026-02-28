"use client";
import type { ResearchVideo } from "@/lib/research/youtube-search";

function formatNumber(num: string): string {
  const n = parseInt(num, 10);
  if (isNaN(n)) return num;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function engagementColor(rate: number): string {
  if (rate >= 5) return "text-green-400";
  if (rate >= 2) return "text-yellow-400";
  return "text-gray-400";
}

export default function VideoCard({
  video,
  selected,
  onSelect,
  onApprove,
  onSkip,
  disabled,
}: {
  video: ResearchVideo;
  selected: boolean;
  onSelect: (videoId: string) => void;
  onApprove: (videoId: string) => void;
  onSkip: (videoId: string) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`bg-[#12121f] border rounded-xl p-4 transition-all ${
        selected
          ? "border-blue-500/60 bg-blue-900/10"
          : "border-[#1e1e30] hover:border-[#2e2e40]"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <label className="mt-1 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(video.videoId)}
            className="w-4 h-4 rounded bg-[#0a0a0f] border-[#2e2e40] text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
          />
        </label>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sm hover:text-blue-400 transition line-clamp-2"
          >
            🎬 {video.title}
          </a>

          {/* Channel + stats */}
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 flex-wrap">
            <span>👤 {video.channel.channelName}</span>
            <span className="text-gray-600">({formatNumber(video.channel.subscriberCount)} subs)</span>
            <span className="text-gray-600">•</span>
            <span>{formatNumber(video.viewCount)} views</span>
            <span className="text-gray-600">•</span>
            <span>{formatNumber(video.likeCount)} 👍</span>
          </div>

          {/* Date + duration + engagement */}
          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 flex-wrap">
            <span>📅 {timeAgo(video.publishedAt)}</span>
            <span className="text-gray-600">•</span>
            <span>{video.duration}</span>
            {video.videoType === "short" && (
              <span className="px-1.5 py-0 rounded bg-red-900/30 text-red-400 text-[10px]">SHORT</span>
            )}
            <span className="text-gray-600">•</span>
            <span className={engagementColor(video.engagementRate)}>
              Engagement: {video.engagementRate}%
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-2.5">
            <a
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg bg-[#1a1a2e] text-gray-300 text-xs hover:bg-[#2a2a3e] transition"
            >
              ▶ Preview
            </a>
            <button
              onClick={() => onApprove(video.videoId)}
              disabled={disabled}
              className="px-3 py-1 rounded-lg bg-green-600/20 text-green-400 text-xs font-semibold hover:bg-green-600/30 transition disabled:opacity-50"
            >
              ✅ Approve
            </button>
            <button
              onClick={() => onSkip(video.videoId)}
              disabled={disabled}
              className="px-3 py-1 rounded-lg bg-red-600/10 text-red-400/70 text-xs hover:bg-red-600/20 transition disabled:opacity-50"
            >
              ❌ Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
