import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/admin-auth";
import { getSession, readSessions, buildSessionsPayload } from "@/lib/research/sessions";
import { updateFileViaGitHub } from "@/lib/github-file";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  return NextResponse.json({ session });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let sessions = readSessions();
  sessions = sessions.filter((s) => s.id !== id);
  await updateFileViaGitHub(
    "data/research-sessions.json",
    buildSessionsPayload(sessions),
    `[Research] Delete session ${id}`
  );
  return NextResponse.json({ success: true });
}
