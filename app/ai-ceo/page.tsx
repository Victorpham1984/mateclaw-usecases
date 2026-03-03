import type { Metadata } from "next";
import Link from "next/link";
import AICEOTracker from "./AICEOTracker";

export const metadata: Metadata = {
  title: "AI CEO Quick Start — Your Journey from 0 to Hero in 10 Days",
  description:
    "Follow the path 42 CEOs already walked. BizMate + community wisdom combined. Transform from overwhelmed to AI-powered leader in 10 days.",
  openGraph: {
    title: "Your Journey from Overwhelmed CEO to AI-Powered Leader",
    description:
      "42 CEOs walked this path from 0 to Hero in 10 days. Each saved 20+ hours/week and unlocked $10k+ revenue. Now it's your turn.",
    siteName: "MateClaw Use Cases",
  },
};

const GUMROAD_URL = "https://bizmate.gumroad.com/l/ai-ceo-quick-start";

const journeyMilestones = [
  { icon: "🚀", day: "Days 1-3", title: "Foundation", desc: "30-min setup, first automation, mindset shift" },
  { icon: "⚙️", day: "Days 4-7", title: "Scale", desc: "Memory systems, squad structure, HEARTBEAT monitoring" },
  { icon: "💰", day: "Days 8-10", title: "Revenue", desc: "Launch workflows, 5 proven monetization paths" },
];

const transformationStories = [
  {
    quote: "I was at 0 — drowning in operations. Built my AI squad in 10 days. Now agents handle content, research, ops. I focus on strategy.",
    author: "Victor",
    role: "BizMate Founder",
    from: "Manual everything",
    to: "AI-powered ops, 20+ hrs/week saved",
  },
];

const journeyChapters = [
  {
    num: 1,
    phase: "Foundation",
    title: "Days 1-3: Master the Basics",
    tagline: "Deploy your first AI agent",
    items: [
      "30-minute OpenClaw setup (Mac/Linux)",
      "Telegram bot integration (no coding required)",
      "First automation: file operations, web search, command execution",
      "Understanding tools vs chatbots (the mindset shift)",
    ],
  },
  {
    num: 2,
    phase: "Scale",
    title: "Days 4-7: Build Your AI Squad",
    tagline: "Automate operations at scale",
    items: [
      "Memory systems that actually work (QMD + Dream Cycle)",
      "Squad structure: CEO + specialist agents",
      "HEARTBEAT monitoring (detect issues before users do)",
      "Cron automation (scheduled tasks, wake events)",
      "Context management (avoid token bloat)",
    ],
  },
  {
    num: 3,
    phase: "Revenue",
    title: "Days 8-10: Unlock Income Streams",
    tagline: "Turn AI agents into revenue",
    items: [
      "Launch workflow (CommandMate case study)",
      "Customer support automation (ticket → resolution → close)",
      "Gumroad automation — Sales tracking → email sequences",
      "Stripe webhooks — Payment → fulfillment",
      "Content pipeline — Research → write → schedule → post",
      "Market research — Competitors → insights → strategy",
      "Service productization — Consulting → automated playbooks",
    ],
  },
];

const faqs = [
  {
    q: "I'm at 0. Can I really build this myself?",
    a: "Yes. If you can use ChatGPT, you can build an AI squad. This is a business playbook, not a programming course. 42 CEOs started at 0 and reached Hero — you're following their proven path.",
  },
  {
    q: "How long until I see results?",
    a: "First working agent: 24-48 hours. Full squad: 10 days. You'll start saving time immediately as you build.",
  },
  {
    q: "Is this just theory or real journeys?",
    a: "42 real transformation stories from actual CEOs. Every pattern is battle-tested. You're learning from people who walked the 0→Hero path before you.",
  },
  {
    q: "What if I get stuck on the journey?",
    a: "The guide includes common mistakes + troubleshooting for every step. Plus, 29 copy-paste prompts eliminate guesswork. You won't be alone.",
  },
  {
    q: "Will this work for my industry?",
    a: "The 42 examples span 10+ industries: SaaS, agencies, content, e-commerce, consulting, coaching, and more. At least 5 CEOs in your space already made this journey.",
  },
  {
    q: "What if it doesn't work for me?",
    a: "30-day money-back guarantee. If you don't save 10+ hours in week 1, email us for instant refund. Zero risk.",
  },
];

const pricingFeatures = [
  "51,833 words — your complete roadmap from 0 to Hero",
  "42 real CEO journeys (BizMate + Brian Casel + 9x + 39 more)",
  "29 copy-paste prompts (skip trial & error)",
  "5 proven revenue paths (turn AI into income)",
  "Common mistakes guide (avoid 36 pitfalls that keep CEOs stuck)",
  "Bonus: 913-line prompt library + troubleshooting checklist",
  "Lifetime access + future updates as more CEOs reach Hero",
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
      {label || "Start Your Journey — $29"}
    </a>
  );
}

export default function AICEOPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <AICEOTracker />
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
            Start Your Journey — $29
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#FFD460]/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <p className="text-[#FFD460] text-sm font-semibold tracking-wider uppercase mb-4">
            AI CEO Quick Start
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            Your Journey from{" "}
            <span className="text-red-400">Overwhelmed CEO</span> to{" "}
            <span className="text-[#FFD460]">AI-Powered Leader</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#8b949e] max-w-2xl mx-auto mb-6">
            42 CEOs walked this path from <strong className="text-red-400">0</strong> to <strong className="text-[#FFD460]">Hero</strong>. 
            Each saved 20+ hours/week and unlocked $10k+ revenue.
          </p>
          <p className="text-sm text-[#8b949e] max-w-2xl mx-auto mb-10">
            BizMate + Brian Casel + 9x + 39 more CEOs share their complete roadmap
          </p>
          <CTAButton />
          <p className="mt-4 text-sm text-[#484f58]">
            Your 10-day transformation · $29 · 30-day guarantee
          </p>
        </div>
      </section>

      {/* Where You Are Now: 0 */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
          Where You Are Now: <span className="text-red-400">0</span>
        </h2>
        <p className="text-center text-[#8b949e] mb-12 max-w-2xl mx-auto">
          We&apos;ve been there. So have the 42 CEOs who walked this journey before you.
        </p>
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {[
            "Drowning in content creation, customer support, and ops tasks",
            "ChatGPT feels like a toy, not a business tool you can rely on",
            "Hiring is expensive and slow — you need leverage NOW",
            "You're stuck doing $10/hour work when you should lead strategy",
          ].map((pain) => (
            <div
              key={pain}
              className="flex items-start gap-3 rounded-lg border border-[#30363d] bg-[#161b22] p-5"
            >
              <span className="text-red-400 mt-0.5 text-xl font-bold">0</span>
              <p className="text-sm text-[#8b949e]">{pain}</p>
            </div>
          ))}
        </div>
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-lg text-[#e6edf3] font-semibold mb-4">
            You&apos;re stuck at <span className="text-red-400">0</span>. But there&apos;s a proven path to <span className="text-[#FFD460]">Hero</span>.
          </p>
          <p className="text-sm text-[#8b949e]">
            42 CEOs transformed in 10 days. You&apos;re next.
          </p>
        </div>
      </section>

      {/* Your Roadmap: 0 to Hero in 10 Days */}
      <section className="bg-[#161b22] border-y border-[#30363d]">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            Your Roadmap: <span className="text-red-400">0</span> → <span className="text-[#FFD460]">Hero</span> in 10 Days
          </h2>
          <p className="text-center text-[#8b949e] mb-12 max-w-2xl mx-auto">
            Collective wisdom of 42 CEOs (BizMate + Brian Casel + 9x + 40 more)
          </p>
          
          {/* Journey Timeline */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {journeyMilestones.map((milestone, idx) => (
              <div
                key={milestone.day}
                className="relative rounded-xl border border-[#30363d] bg-[#0d1117] p-6 flex flex-col items-center text-center"
              >
                {idx < journeyMilestones.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[#FFD460]/30" />
                )}
                <div className="text-4xl mb-3">{milestone.icon}</div>
                <div className="text-[#FFD460] text-xs font-semibold mb-2">{milestone.day}</div>
                <h3 className="font-bold text-sm mb-2">{milestone.title}</h3>
                <p className="text-xs text-[#8b949e]">{milestone.desc}</p>
              </div>
            ))}
          </div>

          {/* What You Get */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "👥", stat: "42", label: "Real CEO journeys" },
              { icon: "⚡", stat: "29", label: "Copy-paste prompts" },
              { icon: "💰", stat: "5", label: "Revenue paths" },
              { icon: "🛡️", stat: "36", label: "Mistakes to avoid" },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 rounded-lg border border-[#30363d] bg-[#0d1117]">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-2xl font-bold text-[#FFD460] mb-1">{item.stat}</div>
                <div className="text-xs text-[#8b949e]">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CEOs Who Walked the Journey from 0 to Hero */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
          Real CEO Journeys from <span className="text-red-400">0</span> to <span className="text-[#FFD460]">Hero</span>
        </h2>
        <p className="text-center text-[#8b949e] mb-12">
          Based on documented use cases from 42 CEOs who built AI squads
        </p>
        
        {/* Transformation Stories */}
        <div className="grid md:grid-cols-1 gap-6 max-w-2xl mx-auto">
          {transformationStories.map((story) => (
            <div
              key={story.author}
              className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 flex flex-col"
            >
              <p className="text-sm text-[#8b949e] mb-4 italic flex-grow">
                &quot;{story.quote}&quot;
              </p>
              <div className="border-t border-[#30363d] pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-sm">{story.author}</p>
                    <p className="text-xs text-[#484f58]">{story.role}</p>
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">0:</span>
                    <span className="text-[#8b949e]">{story.from}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#FFD460]">Hero:</span>
                    <span className="text-[#8b949e]">{story.to}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Community Patterns */}
        <div className="mt-12 p-8 rounded-xl border border-[#30363d] bg-[#161b22]">
          <h3 className="text-xl font-bold text-center mb-6 text-[#FFD460]">
            Community Patterns from 42 CEO Journeys
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <p className="font-semibold mb-2">Content Creators</p>
              <p className="text-sm text-[#8b949e]">5× content output with AI content factories</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💼</div>
              <p className="font-semibold mb-2">SaaS Founders</p>
              <p className="text-sm text-[#8b949e]">20-25 hrs/week saved on operations</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🏢</div>
              <p className="font-semibold mb-2">Agency Owners</p>
              <p className="text-sm text-[#8b949e]">New $2k-10k AI service offerings</p>
            </div>
          </div>
          <p className="text-xs text-center text-[#484f58] mt-6">
            Based on documented use cases — no individual attribution, aggregate patterns only
          </p>
        </div>

        {/* Journey Stats */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { icon: "⏰", stat: "20+", label: "Hours saved/week (average)" },
            { icon: "💵", stat: "$10k+", label: "Revenue unlocked (community)" },
            { icon: "🚀", stat: "10 days", label: "From 0 to Hero" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-2xl font-bold text-[#FFD460] mb-1">{item.stat}</div>
              <div className="text-xs text-[#8b949e]">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Your 10-Day Journey — Step by Step */}
      <section className="bg-[#161b22] border-y border-[#30363d]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            Your 10-Day Journey — Step by Step
          </h2>
          <p className="text-center text-[#8b949e] mb-12 max-w-2xl mx-auto">
            Follow the same path 42 CEOs walked from <span className="text-red-400">0</span> to <span className="text-[#FFD460]">Hero</span>
          </p>
          <div className="space-y-6">
            {journeyChapters.map((chapter) => (
              <details
                key={chapter.num}
                className="group rounded-xl border border-[#30363d] bg-[#0d1117] overflow-hidden"
              >
                <summary className="cursor-pointer p-6 flex items-center justify-between hover:bg-[#161b22] transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-1">
                      <span className="text-[#FFD460] font-bold text-lg">{chapter.phase}</span>
                      <h3 className="font-semibold">{chapter.title}</h3>
                    </div>
                    <p className="text-xs text-[#8b949e] ml-12">{chapter.tagline}</p>
                  </div>
                  <span className="text-[#8b949e] group-open:rotate-180 transition-transform ml-4">▼</span>
                </summary>
                <div className="px-6 pb-6 border-t border-[#30363d] pt-4">
                  <ul className="space-y-2">
                    {chapter.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[#8b949e]">
                        <span className="text-[#FFD460] mt-0.5">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
          
          {/* Bonus Section */}
          <div className="mt-8 rounded-xl border-2 border-[#FFD460]/30 bg-[#0d1117] p-6">
            <h3 className="font-bold text-lg mb-4 text-[#FFD460]">🎁 Bonus: Shortcuts to Hero</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-[#FFD460]">✓</span>
                <span>913-line prompt library (copy-paste, don&apos;t reinvent)</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-[#FFD460]">✓</span>
                <span>36 common mistakes guide (avoid getting stuck at 0)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
          Start Your Journey from <span className="text-red-400">0</span> to <span className="text-[#FFD460]">Hero</span>
        </h2>
        <p className="text-center text-[#8b949e] mb-12">
          42 CEOs invested $29. You&apos;re at <span className="text-red-400">0</span> today. In 10 days, you&apos;ll be <span className="text-[#FFD460]">Hero</span>.
        </p>
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl border-2 border-[#FFD460]/30 bg-[#161b22] p-8">
            <h3 className="text-xl font-bold mb-6 text-center">AI CEO Quick Start</h3>
            
            <ul className="space-y-3 mb-8">
              {pricingFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <span className="text-[#FFD460] mt-0.5">✅</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-2xl text-[#484f58] line-through">$97</span>
                <span className="text-5xl font-bold text-[#FFD460]">$29</span>
              </div>
              <p className="text-sm text-[#8b949e]">(launch special)</p>
            </div>

            <CTAButton className="w-full text-center" label="Begin My Journey ($29)" />

            <div className="mt-6 p-4 rounded-lg bg-[#0d1117] border border-[#30363d]">
              <p className="text-sm text-center text-[#8b949e]">
                <span className="text-[#FFD460] font-semibold">30-day transformation guarantee.</span>
                <br />
                If you don&apos;t save 10+ hours in week 1, full refund — no questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#161b22] border-y border-[#30363d]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Questions from CEOs at <span className="text-red-400">0</span>
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-[#30363d] bg-[#0d1117] overflow-hidden"
              >
                <summary className="cursor-pointer p-5 flex items-center justify-between hover:bg-[#161b22] transition-colors">
                  <h3 className="font-semibold text-sm">{faq.q}</h3>
                  <span className="text-[#8b949e] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-5 border-t border-[#30363d] pt-4">
                  <p className="text-sm text-[#8b949e]">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#2D4059] to-[#1a2535] py-16">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#FFD460]/[0.08] rounded-full blur-[100px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Join 42 CEOs Who Made the Journey from <span className="text-red-400">0</span> to <span className="text-[#FFD460]">Hero</span>
          </h2>
          <p className="text-[#8b949e] mb-2 max-w-lg mx-auto">
            You&apos;re at <span className="text-red-400">0</span> today. In 10 days, you&apos;ll be <span className="text-[#FFD460]">Hero</span>.
          </p>
          <p className="text-sm text-[#8b949e] mb-8 max-w-lg mx-auto">
            The path is proven. The roadmap is clear. Now it&apos;s your turn.
          </p>
          <CTAButton label="Start My Journey — $29" />
          
          {/* Urgency + Trust Badges */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-sm text-[#FFD460] font-semibold">
              🔥 Launch special: $29 (regular price $97) — limited time only
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#8b949e]">
              <div className="flex items-center gap-2">
                <span>💳</span>
                <span>Secure checkout (Gumroad)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>30-day guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>Instant PDF delivery</span>
              </div>
            </div>
          </div>
        </div>
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
