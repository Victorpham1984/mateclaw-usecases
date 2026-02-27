import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/admin-auth";
import { updateCase, deleteCase } from "@/lib/cases-db";

async function guard() {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard();
  if (err) return err;

  const { id } = await params;
  const body = await req.json();

  try {
    // Rebuild source object if source fields provided
    const updates: Record<string, unknown> = { ...body };
    if (body.sourceType !== undefined) {
      updates.source = {
        type: body.sourceType,
        url: body.sourceUrl || "",
        creator: body.creator || "",
        channel: body.channel || "",
        videoTitle: body.videoTitle || "",
        timestamp: body.timestamp ? Number(body.timestamp) : undefined,
      };
      delete updates.sourceType;
      delete updates.sourceUrl;
      delete updates.creator;
      delete updates.channel;
      delete updates.videoTitle;
      delete updates.timestamp;
    }

    const cases = updateCase(id, updates);
    return NextResponse.json({ cases });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard();
  if (err) return err;

  const { id } = await params;
  try {
    const cases = deleteCase(id);
    return NextResponse.json({ cases });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}
