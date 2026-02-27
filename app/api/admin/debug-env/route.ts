import { NextResponse } from "next/server";
import { createHash } from "crypto";

export async function GET() {
  const pw = process.env.ADMIN_PASSWORD;
  const hash = pw ? createHash("sha256").update(pw).digest("hex") : null;
  return NextResponse.json({
    exists: !!pw,
    length: pw?.length,
    firstChar: pw?.[0],
    lastChar: pw?.[pw.length - 1],
    hash,
    expectedHash: "5105a24f8ca6eefe94f2ad660e42b45c708b436ae36afa290780e7ed9c7f09eb",
    match: hash === "5105a24f8ca6eefe94f2ad660e42b45c708b436ae36afa290780e7ed9c7f09eb",
  });
}
