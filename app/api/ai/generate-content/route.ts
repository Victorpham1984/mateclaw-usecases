import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/admin-auth";
import { generateContent, type ContentInput } from "@/lib/research/content-generator";
import { extractTranscript } from "@/lib/research/transcript";

// POST: Generate AI content for a draft
export async function POST(req: NextRequest) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { sourceType, title, rawContent, creator, url, videoId } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    let content = rawContent || "";
    let transcript = null;

    // If YouTube and no rawContent provided, extract transcript
    if (sourceType === "youtube" && videoId && !rawContent) {
      const result = await extractTranscript(videoId, title, body.description);
      content = result.transcript;
      transcript = result;
    }

    const input: ContentInput = {
      sourceType: sourceType || "youtube",
      title,
      rawContent: content,
      creator,
      url,
    };

    const generated = await generateContent(input);

    return NextResponse.json({
      ...generated,
      transcript: transcript ? {
        text: transcript.transcript,
        language: transcript.language,
        source: transcript.source,
        charCount: transcript.charCount,
      } : null,
    });
  } catch (error: any) {
    console.error("Content generation error:", error);
    return NextResponse.json({ error: error.message || "Generation failed" }, { status: 500 });
  }
}
