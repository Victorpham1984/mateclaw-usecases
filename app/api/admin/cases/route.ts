import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/admin-auth";
import { readCases, addCase, getNextId } from "@/lib/cases-db";
import type { UseCase } from "@/lib/types";

async function guard() {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const err = await guard();
  if (err) return err;
  return NextResponse.json({ cases: readCases() });
}

export async function POST(req: NextRequest) {
  const err = await guard();
  if (err) return err;

  const body = await req.json();

  // Validate required fields
  const required = ["title", "category", "description", "prompt", "difficulty", "timeEstimate"];
  for (const f of required) {
    if (!body[f]) {
      return NextResponse.json({ error: `Missing required field: ${f}` }, { status: 400 });
    }
  }

  const cases = readCases();
  const newCase: UseCase = {
    id: getNextId(cases),
    title: body.title,
    description: body.description,
    prompt: body.prompt,
    category: body.category,
    tags: body.tags || [],
    source: {
      type: body.sourceType || "web",
      url: body.sourceUrl || "",
      creator: body.creator || "",
      channel: body.channel || "",
      videoTitle: body.videoTitle || "",
      timestamp: body.timestamp ? Number(body.timestamp) : undefined,
    },
    addedAt: new Date().toISOString().split("T")[0],
    difficulty: body.difficulty,
    timeEstimate: body.timeEstimate,
    roi: body.roi || "",
  };

  const updated = addCase(newCase);
  return NextResponse.json({ cases: updated, added: newCase });
}
