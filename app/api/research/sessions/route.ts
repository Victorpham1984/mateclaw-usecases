import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/admin-auth";
import { readSessions } from "@/lib/research/sessions";

export async function GET() {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessions = readSessions();
  // Return newest first, limit 50
  const sorted = sessions.sort(
    (a, b) => new Date(b.searchedAt).getTime() - new Date(a.searchedAt).getTime()
  );
  return NextResponse.json({ sessions: sorted.slice(0, 50) });
}
