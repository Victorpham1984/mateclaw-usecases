// Pipeline admin auth - uses MateClaw's existing auth system
// Checks the mateclaw_admin cookie (SHA256 hash of ADMIN_PASSWORD)

import { NextRequest } from "next/server";
import { createHash } from "crypto";

function getExpectedHash(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD not set");
  return createHash("sha256").update(pw).digest("hex");
}

export function verifyAdminAuth(request: NextRequest): boolean {
  // Check cookie (MateClaw stores SHA256 hash)
  const cookie = request.cookies.get("mateclaw_admin");
  if (cookie?.value === getExpectedHash()) return true;

  // Check Authorization header (for API calls)
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const pw = process.env.ADMIN_PASSWORD || "mateclaw2026";
    if (authHeader === `Bearer ${pw}`) return true;
  }

  return false;
}

export function createAuthResponse(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
