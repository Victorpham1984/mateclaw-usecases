import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI CEO Quick Start — Build Your AI Workforce in 7 Days",
  description:
    "A complete 43-page guide teaching you to build your own AI CEO assistant. Same system that built a $21K ARR platform in 12 weeks with $125 budget.",
  openGraph: {
    title: "AI CEO Quick Start — Build Your AI Workforce in 7 Days",
    description:
      "Stop copy-pasting prompts. Start building your own AI workforce.",
    siteName: "MateClaw",
  },
};

const GUMROAD_URL = "https://bizmate.gumroad.com/l/ai-ceo-quick-start";

const chapters = [
  { icon: "🚀", title: "OpenClaw Setup", desc: "30 min install → working bot" },
  { icon: "🧠", title: "Memory Systems", desc: "QMD, PARA, Dream Cycle" },
  { icon: "👥", title: "Squad Structure", desc: "CEO, specialists, model selection" },
  { icon: "⚙️", title: "Automation", desc: "HEARTBEAT monitoring, cron jobs" },
  { icon: "💰", title: "Revenue Setup", desc: "Gumroad, payments, launch" },
  { icon: "📊", title: "Real Example", desc: "BizMate's CommandMate journey" },
];

const results = [
  "Built CommandMate platform (Next.js + Supabase + MCP)",
  "12 weeks from idea to production",
  "$125 total budget — no freelancers, no agencies",
  "$21K ARR potential (7 paid users @ $3K each)",
  "3 critical bugs fixed in 10 minutes by AI squad",
  "Automated: research, QA, deployment, docs",
];

const faqs = [
  {
    q: "Do I need coding skills?",
    a: "Basic terminal comfort helpful, but the guide walks through everything step-by-step.",
  },
  {
    q: "Works on Windows?",
    a: "macOS/Linux native. Docker available for Windows users.",
  },
  {
    q: "Refund policy?",
    a: "30-day money-back guarantee via Gumroad. No questions asked.",
  },
];

function CTAButton({ className = "", label }: { className?: string; label?: string }) {
  return (
    <a
      href={GUMROAD_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-cta="ai-ceo-primary"
      className={`inline-block bg-[#FFD460] text-[#2D4059] font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#FFE895] hover:shadow-[0_0_30px_rgba(255,212,96,0.3)] transition-all ${className}`}
    >
      {label || "Get Instant Access — $29"}
    </a>
  );
}

export default function AICEOPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Nav */}
      <nav className="border-b border-[#30363d]/50 bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm text-[#8b949e] hover:text-[#FFD460] transition-colors">
            ← MateClaw Use Cases
          </Link>
          <a
            href={GUMROAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold bg-[#FFD460] text-[#2D4059] px-4 py-1.5 rounded-lg hover:bg-[#FFE895] transition"
          >
            Get Access — $29
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#FFD460]/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <p className="text-[#FFD460] text-sm font-semibold tracking-wider uppercase mb-4">
            AI CEO Quick Start Guide
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            From OpenClaw User to{" "}
            <span className="text-[#FFD460]">AI CEO Operator</span>{" "}
            in 7 Days
          </h1>
          <p className="text-lg sm:text-xl text-[#8b949e] max-w-2xl mx-auto mb-10">
            Stop copy-pasting prompts. Start building your own AI workforce.
          </p>
          <CTAButton />
          <p className="mt-4 text-sm text-[#484f58]">
            One-time payment · 43-page PDF · Lifetime access
          </p>
        </div>
      </section>

      {/* Pain */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              emoji: "😩",
              title: "Still overwhelmed",
              desc: "You're using AI tools, but drowning in tabs, prompts, and context-switching.",
            },
            {
              emoji: "📋",
              title: "Manual labor in disguise",
              desc: "Copy-pasting prompts one by one isn't automation — it's busywork with extra steps.",
            },
            {
              emoji: "🤖",
              title: "What if AI actually executed?",
              desc: "Imagine AI agents that research, code, test, and deploy — autonomously.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 text-center"
            >
              <div className="text-3xl mb-3">{item.emoji}</div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-[#8b949e]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section className="bg-[#161b22] border-y border-[#30363d]">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            The <span className="text-[#FFD460]">AI CEO Quick Start</span> Guide
          </h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto mb-3">
            A complete 43-page guide teaching you to build your own AI CEO assistant.
          </p>
          <p className="text-[#8b949e] max-w-2xl mx-auto">
            Same system BizMate used to build a{" "}
            <strong className="text-[#FFD460]">$21K ARR platform</strong> in 12 weeks with a{" "}
            <strong className="text-[#FFD460]">$125 budget</strong>.
          </p>
        </div>
      </section>

      {/* Chapters */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
          What&apos;s Inside
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map((ch, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 flex flex-col gap-2"
            >
              <div className="text-2xl">{ch.icon}</div>
              <h3 className="font-semibold">
                Ch. {i + 1}: {ch.title}
              </h3>
              <p className="text-sm text-[#8b949e]">{ch.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-[#8b949e]">
            <strong className="text-[#FFD460]">Bonus:</strong> Config templates, prompt library, cron examples
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-[#161b22] border-y border-[#30363d]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
            Real Results from BizMate
          </h2>
          <p className="text-center text-[#8b949e] mb-10">
            This isn&apos;t theory — it&apos;s a proven system.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-[#30363d] bg-[#0d1117] p-4"
              >
                <span className="text-[#FFD460] mt-0.5">✓</span>
                <span className="text-sm">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8">
          One Guide. One Price. <span className="text-[#FFD460]">Lifetime Access.</span>
        </h2>
        <div className="max-w-md mx-auto rounded-2xl border-2 border-[#FFD460]/30 bg-[#161b22] p-8">
          <p className="text-5xl font-bold text-[#FFD460] mb-2">$29</p>
          <p className="text-sm text-[#8b949e] mb-6">One-time payment</p>
          <ul className="text-left text-sm space-y-3 mb-8">
            {[
              "43-page PDF guide (EN + VI)",
              "Config templates bundle",
              "Prompt library",
              "Lifetime access + updates",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-[#FFD460]">✓</span> {item}
              </li>
            ))}
          </ul>
          <CTAButton className="w-full text-center" />
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Hiring a VA", cost: "$500/mo" },
              { label: "Agency project", cost: "$5,000" },
              { label: "DIY trial & error", cost: "Months" },
            ].map((c) => (
              <div key={c.label} className="text-xs text-[#484f58]">
                <span className="line-through">{c.cost}</span>
                <br />
                {c.label}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 text-sm text-[#8b949e]">
          Learn the system in 7 days. Save 5-10 hours every week.
        </p>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">FAQ</h2>
        <div className="space-y-4 max-w-2xl mx-auto">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-xl border border-[#30363d] bg-[#161b22] p-5"
            >
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-sm text-[#8b949e]">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#2D4059] py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Ready to Build Your AI Squad?
        </h2>
        <p className="text-[#8b949e] mb-8 max-w-lg mx-auto">
          Join creators who replaced busywork with autonomous AI agents.
        </p>
        <CTAButton label="Get Instant Access — $29 →" />
        <p className="mt-4 text-sm text-[#8b949e]">
          30-day money-back guarantee via Gumroad
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#30363d] py-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#484f58]">
            Built with 💛 by <span className="text-[#FFD460]">BizMate</span> — Powered by OpenClaw
          </p>
          <div className="flex gap-4">
            <Link href="/" className="text-xs text-[#484f58] hover:text-[#8b949e] transition-colors">
              MateClaw Use Cases
            </Link>
            <span className="text-xs text-[#30363d]">·</span>
            <span className="text-xs text-[#484f58]">Privacy Policy</span>
            <span className="text-xs text-[#30363d]">·</span>
            <span className="text-xs text-[#484f58]">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
