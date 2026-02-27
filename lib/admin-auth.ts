import { cookies } from "next/headers";
import { createHash } from "crypto";

const TOKEN_NAME = "mateclaw_admin";

function hashPassword(pw: string): string {
  return createHash("sha256").update(pw).digest("hex");
}

export function getExpectedHash(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD not set");
  return hashPassword(pw);
}

export async function verifyAuth(): Promise<boolean> {
  try {
    const c = await cookies();
    const token = c.get(TOKEN_NAME)?.value;
    return token === getExpectedHash();
  } catch {
    return false;
  }
}

export function checkPassword(password: string): boolean {
  return hashPassword(password) === getExpectedHash();
}

export { TOKEN_NAME };
