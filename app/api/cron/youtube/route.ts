import { NextRequest, NextResponse } from "next/server";
import { runFullPipeline } from "@/lib/pipeline/orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Cron endpoint - triggered by Vercel Cron or external scheduler
// Secured by CRON_SECRET header
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runFullPipeline();

    const totalUseCases = results.reduce((s, r) => s + r.use_cases_created, 0);

    // Send Telegram notification if new drafts were created
    if (totalUseCases > 0) {
      await sendTelegramNotification(totalUseCases, results);
    }

    return NextResponse.json({
      success: true,
      message: `Cron completed: ${totalUseCases} new drafts from ${results.length} sources`,
      results,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cron failed" },
      { status: 500 }
    );
  }
}

async function sendTelegramNotification(
  totalUseCases: number,
  results: any[]
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("Telegram notification skipped: missing bot token or chat ID");
    return;
  }

  const sourceDetails = results
    .filter((r) => r.use_cases_created > 0)
    .map((r) => `  • ${r.source_name}: ${r.use_cases_created} use cases`)
    .join("\n");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mateclaw-usecases.vercel.app";
  const message = `🐾 *MateClaw YouTube Pipeline*\n\n` +
    `📝 *${totalUseCases} new drafts* ready for review!\n\n` +
    `${sourceDetails}\n\n` +
    `👉 [Review Drafts](${appUrl}/admin/youtube/drafts)`;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error("Telegram notification failed:", err);
  }
}
