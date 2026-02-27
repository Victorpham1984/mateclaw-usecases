// AI Scoring Engine for YouTube Channel Relevance
// Uses OpenRouter API (Claude 3.5 Sonnet) to analyze channel fit

import type { DiscoveredChannel } from "./youtube-search";

export type AIScore = {
  score: number;
  suggestedCategories: string[];
  sampleUseCases: string[];
  reasoning: string;
};

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// Cost-effective model for scoring
const SCORING_MODEL = "anthropic/claude-3.5-sonnet";

function getOpenRouterKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("Missing OPENROUTER_API_KEY environment variable");
  return key;
}

// Build scoring prompt for a channel
function buildScoringPrompt(channel: DiscoveredChannel): string {
  const videoTitles = channel.recentVideos
    .map((v) => `- ${v.title}`)
    .join("\n");

  return `You are analyzing a YouTube channel for relevance to OpenClaw/MateClaw use cases.

**OpenClaw/MateClaw context:**
- Personal AI assistant platform (like having a smart AI teammate)
- Automation: email, calendar, research, content creation, scheduling
- AI agents: productivity tools, coding assistants, workflow automation
- Use cases: anything where AI helps people be more productive
- Target audience: people who want to automate tasks with AI

**Channel data:**
- Name: ${channel.channelName}
- Subscribers: ${formatNumber(channel.subscribers)}
- Total videos: ${channel.totalVideos}
- Recent videos (last 30 days): ${channel.recentVideoCount}
- Average views: ${formatNumber(channel.avgViews)}
- Description: ${channel.channelDescription.slice(0, 500)}
${videoTitles ? `\n- Recent video titles:\n${videoTitles}` : "- No recent videos available"}

**Task:**
1. Score 0-100: How relevant is this channel for sourcing AI/automation use cases?
   - 90-100: Directly about AI assistants, automation, or productivity tools
   - 70-89: Related to AI, tech, or productivity
   - 40-69: Somewhat related (general tech, business)
   - 0-39: Unrelated or very tangential

2. Suggest 2-3 use case categories this channel could provide content for.

3. List 2-3 specific use case ideas that could be extracted from this channel.

4. Explain in 1 sentence why this score.

**Output ONLY valid JSON (no markdown, no backticks):**
{
  "score": <number 0-100>,
  "suggestedCategories": ["category1", "category2"],
  "sampleUseCases": ["specific use case 1", "specific use case 2"],
  "reasoning": "one sentence explanation"
}`;
}

function formatNumber(num: string): string {
  const n = parseInt(num, 10);
  if (isNaN(n)) return num;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// Score a single channel using AI
export async function scoreChannel(
  channel: DiscoveredChannel
): Promise<AIScore> {
  const apiKey = getOpenRouterKey();
  const prompt = buildScoringPrompt(channel);

  try {
    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mateclaw-usecases.vercel.app",
        "X-Title": "MateClaw YouTube Research",
      },
      body: JSON.stringify({
        model: SCORING_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`OpenRouter API error: ${res.status} - ${err}`);
      return fallbackScore(channel);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return fallbackScore(channel);
    }

    // Parse JSON response (handle possible markdown wrapping)
    let jsonStr = content;
    // Strip markdown code blocks if present
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonStr);

    return {
      score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
      suggestedCategories: Array.isArray(parsed.suggestedCategories)
        ? parsed.suggestedCategories.slice(0, 3)
        : [],
      sampleUseCases: Array.isArray(parsed.sampleUseCases)
        ? parsed.sampleUseCases.slice(0, 3)
        : [],
      reasoning: String(parsed.reasoning || "").slice(0, 200),
    };
  } catch (err) {
    console.error(`AI scoring failed for ${channel.channelName}:`, err);
    return fallbackScore(channel);
  }
}

// Fallback scoring using keyword heuristics (no API call)
function fallbackScore(channel: DiscoveredChannel): AIScore {
  const text = `${channel.channelName} ${channel.channelDescription} ${channel.recentVideos.map((v) => v.title).join(" ")}`.toLowerCase();

  const highRelevanceKeywords = [
    "ai assistant",
    "openclaw",
    "mateclaw",
    "automation",
    "ai agent",
    "chatgpt",
    "claude",
    "copilot",
    "productivity ai",
    "workflow automation",
  ];
  const mediumRelevanceKeywords = [
    "artificial intelligence",
    "machine learning",
    "ai tools",
    "tech tutorial",
    "productivity",
    "no code",
    "low code",
    "saas",
    "api",
  ];

  let score = 20; // base
  for (const kw of highRelevanceKeywords) {
    if (text.includes(kw)) score += 12;
  }
  for (const kw of mediumRelevanceKeywords) {
    if (text.includes(kw)) score += 5;
  }

  score = Math.min(75, score); // Cap fallback at 75

  return {
    score,
    suggestedCategories: ["AI & Automation"],
    sampleUseCases: ["General AI use case content"],
    reasoning: "Scored by keyword heuristic (AI scoring unavailable)",
  };
}

// Score multiple channels with rate limiting
export async function scoreChannels(
  channels: DiscoveredChannel[],
  concurrency: number = 3
): Promise<Map<string, AIScore>> {
  const results = new Map<string, AIScore>();

  // Process in batches to respect rate limits
  for (let i = 0; i < channels.length; i += concurrency) {
    const batch = channels.slice(i, i + concurrency);
    const promises = batch.map(async (channel) => {
      const score = await scoreChannel(channel);
      results.set(channel.channelId, score);
    });
    await Promise.all(promises);

    // Small delay between batches to avoid rate limiting
    if (i + concurrency < channels.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}
