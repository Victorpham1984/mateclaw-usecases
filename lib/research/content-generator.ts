// LLM content generation — source-agnostic
// Uses Anthropic Claude API when available, template fallback otherwise

export type GeneratedContent = {
  summary: string;
  prompt: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "expert";
  timeEstimate: string;
  generatedBy: "ai" | "template";
};

export type ContentInput = {
  sourceType: "youtube" | "x" | "reddit" | "github";
  title: string;
  rawContent: string; // transcript, tweet text, post body, etc.
  creator?: string;
  url?: string;
  metadata?: Record<string, any>; // source-specific extra data
};

const SYSTEM_PROMPT = `You are MateClaw — an AI content curator for OpenClaw (an AI agent platform).
Your job: analyze content and generate actionable use case summaries that help users leverage OpenClaw effectively.

Output JSON only. No markdown fences. Fields:
- summary: 2-3 sentences describing the use case. Vietnamese-friendly (clear, no jargon).
- prompt: A specific, actionable prompt the user can paste into OpenClaw to replicate this use case. Start with a verb. Be detailed.
- tags: 3-7 relevant tags (lowercase, kebab-case)
- difficulty: "beginner" | "intermediate" | "expert"
- timeEstimate: e.g. "5 min", "30 min", "1 hour", "2 hours"`;

export async function generateContent(input: ContentInput): Promise<GeneratedContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return templateGenerate(input);
  }

  try {
    const userMsg = buildUserMessage(input);
    
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    if (!res.ok) {
      console.warn(`Anthropic API error: ${res.status}`, await res.text());
      return templateGenerate(input);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return templateGenerate(input);
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      summary: parsed.summary || templateGenerate(input).summary,
      prompt: parsed.prompt || templateGenerate(input).prompt,
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 7) : ["ai", "automation"],
      difficulty: ["beginner", "intermediate", "expert"].includes(parsed.difficulty) ? parsed.difficulty : "beginner",
      timeEstimate: parsed.timeEstimate || "10 min",
      generatedBy: "ai",
    };
  } catch (err) {
    console.warn("AI generation failed, using template:", err);
    return templateGenerate(input);
  }
}

function buildUserMessage(input: ContentInput): string {
  const sourceLabel = {
    youtube: "YouTube video",
    x: "X/Twitter post",
    reddit: "Reddit post",
    github: "GitHub repository",
  }[input.sourceType] || "content";

  // Truncate content to ~4000 chars to keep costs low
  const content = input.rawContent.slice(0, 4000);

  return `Analyze this ${sourceLabel} and generate an OpenClaw use case.

Title: ${input.title}
Creator: ${input.creator || "Unknown"}
URL: ${input.url || "N/A"}

Content:
${content}

Generate the JSON response.`;
}

function templateGenerate(input: ContentInput): GeneratedContent {
  const title = input.title.replace(/\*\*/g, "");
  return {
    summary: `Hướng dẫn cách sử dụng OpenClaw dựa trên nội dung "${title}" bởi ${input.creator || "Unknown"}. Bài viết này trình bày các bước cụ thể để tự động hóa công việc với AI agent.`,
    prompt: `Dựa trên nội dung "${title}", hãy tạo một workflow tự động hóa với OpenClaw. Liệt kê từng bước cụ thể, tool cần dùng, và kết quả mong đợi.`,
    tags: ["automation", "ai-agent", input.sourceType],
    difficulty: "beginner",
    timeEstimate: "15 min",
    generatedBy: "template",
  };
}
