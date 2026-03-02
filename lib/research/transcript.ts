// YouTube transcript extraction via timedtext API
// Serverless-compatible (no yt-dlp dependency)

export type TranscriptResult = {
  transcript: string;
  language: string;
  source: "captions" | "description-only";
  charCount: number;
};

// Fetch YouTube auto-generated or manual captions
export async function extractTranscript(videoId: string, videoTitle?: string, videoDescription?: string): Promise<TranscriptResult> {
  try {
    // Try fetching the video page to extract caption tracks
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MateClaw/1.0)" },
    });
    
    if (!pageRes.ok) throw new Error(`Failed to fetch video page: ${pageRes.status}`);
    const html = await pageRes.text();

    // Extract captions URL from playerCaptionsTracklistRenderer
    const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (captionMatch) {
      const tracks = JSON.parse(captionMatch[1]);
      // Prefer English, then any language
      const enTrack = tracks.find((t: any) => t.languageCode === "en") || tracks[0];
      if (enTrack?.baseUrl) {
        const captionRes = await fetch(enTrack.baseUrl + "&fmt=srv3");
        if (captionRes.ok) {
          const xml = await captionRes.text();
          const transcript = parseTranscriptXml(xml);
          if (transcript.length > 50) {
            return {
              transcript: transcript.slice(0, 15000), // Cap at ~15K chars
              language: enTrack.languageCode || "en",
              source: "captions",
              charCount: transcript.length,
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Caption extraction failed for ${videoId}:`, err);
  }

  // Fallback: use title + description
  const fallbackText = [videoTitle, videoDescription].filter(Boolean).join("\n\n");
  return {
    transcript: fallbackText || `Video: ${videoId}`,
    language: "unknown",
    source: "description-only",
    charCount: fallbackText.length,
  };
}

function parseTranscriptXml(xml: string): string {
  // Parse srv3 format: extract text from <p> or <text> elements
  const textParts: string[] = [];
  
  // Match <text start="..." dur="...">content</text> or <p t="..." d="...">content</p>
  const textRegex = /<(?:text|p)[^>]*>([\s\S]*?)<\/(?:text|p)>/g;
  let match;
  while ((match = textRegex.exec(xml)) !== null) {
    let text = match[1]
      .replace(/<[^>]+>/g, "") // Strip nested tags
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n/g, " ")
      .trim();
    if (text) textParts.push(text);
  }

  return textParts.join(" ");
}
