// AI Extraction Engine
// Parses YouTube video transcript → structured use case data

export type ExtractedUseCase = {
  title: string;
  description: string;
  detailed_content: string;
  suggested_category: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  ai_confidence: number;
};

export type ExtractionResult = {
  use_cases: ExtractedUseCase[];
  model: string;
  tokens_used?: number;
};

const SYSTEM_PROMPT = `You are an AI use case extraction expert. Your job is to analyze YouTube video content about AI tools and extract structured use cases.

For each distinct AI use case discussed in the video, extract:
1. **title**: A clear, concise title for the use case (max 80 chars)
2. **description**: A 1-2 sentence summary of what this use case does
3. **detailed_content**: A detailed markdown explanation (3-5 paragraphs) covering:
   - What the use case is
   - How it works (step by step)
   - Tools/AI models mentioned
   - Benefits and results
4. **suggested_category**: One of these categories or suggest a new one:
   - Content Creation, Marketing & SEO, Customer Service, Data Analysis, 
   - Code Generation, Automation, Research, Education, Design, Business Strategy
5. **tags**: 3-7 relevant tags (lowercase, hyphenated)
6. **difficulty**: beginner | intermediate | advanced
7. **ai_confidence**: Your confidence that this is a valid, useful AI use case (0.0-1.0)

Rules:
- Extract ALL distinct use cases from the video (often 1-5 per video)
- Skip generic talk, intros, outros — focus on actionable use cases
- If the video doesn't contain AI use cases, return empty array
- Be specific about tools and techniques mentioned
- Write in English
- For confidence: >0.8 = clearly demonstrated, 0.5-0.8 = mentioned but not fully shown, <0.5 = tangential

Respond ONLY with valid JSON:
{
  "use_cases": [
    {
      "title": "...",
      "description": "...",
      "detailed_content": "...",
      "suggested_category": "...",
      "tags": ["..."],
      "difficulty": "...",
      "ai_confidence": 0.85
    }
  ]
}`;

export async function extractUseCases(
  videoTitle: string,
  channelName: string,
  transcript: string,
  videoDescription: string
): Promise<ExtractionResult> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY or LLM_API_KEY");

  // Truncate transcript to ~12k chars to stay within context limits
  const maxTranscript = 12000;
  const truncatedTranscript = transcript.length > maxTranscript
    ? transcript.slice(0, maxTranscript) + "... [transcript truncated]"
    : transcript;

  const userPrompt = `Analyze this YouTube video and extract AI use cases:

**Video Title:** ${videoTitle}
**Channel:** ${channelName}
**Description:** ${videoDescription.slice(0, 500)}

**Transcript:**
${truncatedTranscript}`;

  const model = "anthropic/claude-sonnet-4";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://mateclaw-usecases.vercel.app",
      "X-Title": "MateClaw YouTube Pipeline",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "{}";

  // Parse JSON from response (handle markdown code blocks)
  let parsed: { use_cases: ExtractedUseCase[] };
  try {
    const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    parsed = JSON.parse(jsonStr);
  } catch {
    console.error("Failed to parse AI response:", content);
    parsed = { use_cases: [] };
  }

  // Validate and clean
  const validUseCases = (parsed.use_cases || [])
    .filter((uc: any) => uc.title && uc.description)
    .map((uc: any) => ({
      title: String(uc.title).slice(0, 200),
      description: String(uc.description).slice(0, 500),
      detailed_content: String(uc.detailed_content || uc.description),
      suggested_category: String(uc.suggested_category || "Automation"),
      tags: Array.isArray(uc.tags) ? uc.tags.map(String).slice(0, 10) : [],
      difficulty: ["beginner", "intermediate", "advanced"].includes(uc.difficulty)
        ? uc.difficulty
        : "intermediate",
      ai_confidence: typeof uc.ai_confidence === "number"
        ? Math.max(0, Math.min(1, uc.ai_confidence))
        : 0.5,
    }));

  return {
    use_cases: validUseCases,
    model,
    tokens_used: data.usage?.total_tokens,
  };
}

// Extract with video description only (no transcript available)
export async function extractFromDescription(
  videoTitle: string,
  channelName: string,
  videoDescription: string
): Promise<ExtractionResult> {
  return extractUseCases(
    videoTitle,
    channelName,
    `[No transcript available. Using video description and title only.]`,
    videoDescription
  );
}
