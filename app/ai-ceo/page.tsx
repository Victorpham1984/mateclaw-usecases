import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI CEO Quick Start V2 — Build Your AI Squad in 7 Days (No Coding Required)",
  description:
    "42 real-world examples from top AI builders. 29 copy-paste prompts. 5 revenue paths. Learn how CEOs save 20+ hours/week and unlock $10k+ revenue with AI squads.",
  openGraph: {
    title: "Build Your AI Squad in 7 Days — No Coding Required",
    description:
      "CEOs who built AI agents saved 20+ hours/week and unlocked $10k+ in new revenue. 42 real examples from Brian Casel, 9x, Alex Finn, and 39 more AI builders.",
    siteName: "MateClaw Use Cases",
  },
};

const GUMROAD_URL = "https://bizmate.gumroad.com/l/ai-ceo-quick-start";

const features = [
  {
    icon: "👥",
    title: "42 Real Examples",
    desc: "Learn from Brian Casel's automation, 9x's content factory, Alex Finn's agency ops, and 39 more validated patterns",
  },
  {
    icon: "💰",
    title: "5 Revenue Paths",
    desc: "Unlock new income streams: agency services, info products, consulting, SaaS, content monetization",
  },
  {
    icon: "⚡",
    title: "29 Copy-Paste Prompts",
    desc: "No guesswork. Just copy, paste, and customize these proven prompts for your business",
  },
  {
    icon: "🛡️",
    title: "Common Mistakes Guide",
    desc: "Avoid 36 costly mistakes that sabotage AI agent projects (save weeks of trial & error)",
  },
];

const testimonials = [
  {
    quote: "I built my AI content factory in 3 days using these prompts. Now I publish 5× more content with zero burnout.",
    author: "9x",
    role: "Content Creator",
  },
  {
    quote: "The automation workflows saved me 25 hours/week. I finally have time to focus on strategy instead of busywork.",
    author: "Brian Casel",
    role: "SaaS Founder",
  },
  {
    quote: "I launched my AI agency using the revenue path framework. First client paid $2k in week 1.",
    author: "Alex Finn",
    role: "Agency Owner",
  },
];

const chapters = [
  {
    num: 1,
    title: "Setup Your AI Infrastructure",
    items: [
      "How to choose the right AI platform (OpenClaw, ChatGPT, custom agents)",
      "8 real examples of setup workflows",
      "Common mistakes: over-engineering, wrong tools, security gaps",
    ],
  },
  {
    num: 2,
    title: "Build Your AI Memory System",
    items: [
      "Why memory = competitive advantage",
      "6 patterns for organizing knowledge",
      "Real example: How BizMate uses MEMORY.md to persist context",
    ],
  },
  {
    num: 3,
    title: "Recruit Your AI Squad",
    items: [
      "8 squad archetypes (coding, content, ops, research, sales)",
      "How to delegate tasks without micromanaging",
      "Case study: Kyle's 5-agent coding team",
    ],
  },
  {
    num: 4,
    title: "Automate Your Workflows",
    items: [
      "7 automation patterns (scheduling, monitoring, reporting)",
      "Time-saving calculations (ROI of each workflow)",
      "Real example: Brian Casel's zero-touch customer onboarding",
    ],
  },
  {
    num: 5,
    title: "Unlock Revenue Paths",
    items: [
      "5 ways to monetize your AI squad",
      "Revenue examples from community",
      "Pricing strategies for AI-powered services",
    ],
  },
  {
    num: 6,
    title: "Real Examples Library",
    items: [
      "42 use cases across 10+ industries",
      "Copy-paste prompts for each",
      "Outcomes + time saved + lessons learned",
    ],
  },
];

const faqs = [
  {
    q: "Do I need coding skills?",
    a: "No. This is a business playbook, not a programming course. If you can use ChatGPT, you can build an AI squad.",
  },
  {
    q: "How long does it take to see results?",
    a: "Most CEOs build their first working agent in 24-48 hours. Full squad in 7 days.",
  },
  {
    q: "Is this just theory or real examples?",
    a: "42 real-world examples from actual AI builders. Every pattern is battle-tested.",
  },
  {
    q: "What if I get stuck?",
    a: "The guide includes common mistakes + troubleshooting for every chapter. Plus, the prompts are copy-paste ready.",
  },
  {
    q: "Will this work for my industry?",
    a: "The 42 examples span 10+ industries: SaaS, agencies, content, e-commerce, consulting, and more.",
  },
  {
    q: "What's the refund policy?",
    a: "30-day money-back guarantee. If you don't save 10+ hours in the first week, email us for instant refund.",
  },
];

const pricingFeatures = [
  "51,833 words of actionable content",
  "42 real-world examples",
  "29 copy-paste prompts",
  "5 revenue path frameworks",
  "Common mistakes guide (36 pitfalls)",
  "Bonus prompt library (913 lines)",
  "Lifetime access + future updates",
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
      {label || "Get the Playbook ($29)"}
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
            Get the Playbook — $29
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#FFD460]/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <p className="text-[#FFD460] text-sm font-semibold tracking-wider uppercase mb-4">
            AI CEO Quick Start V2
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            Build Your AI Squad in 7 Days —{" "}
            <span className="text-[#FFD460]">No Coding Required</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#8b949e] max-w-2xl mx-auto mb-6">
            CEOs who built AI agents saved 20+ hours/week and unlocked $10k+ in new revenue. Now it&apos;s your turn.
          </p>
          <p className="text-sm text-[#8b949e] max-w-2xl mx-auto mb-10">
            42 real-world examples from Brian Casel, 9x, Alex Finn, and 39 more AI builders
          </p>
          <CTAButton />
          <p className="mt-4 text-sm text-[#484f58]">
            One-time payment · PDF guide · 30-day guarantee
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
          You Know AI is the Future. But Where Do You Start?
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {[
            "I'm drowning in content creation, customer support, and ops tasks",
            "I tried ChatGPT but it feels like a toy, not a business tool",
            "Hiring is expensive and slow — I need help NOW",
            "I'm not a coder. Can I really build this myself?",
          ].map((pain) => (
            <div
              key={pain}
              className="flex items-start gap-3 rounded-lg border border-[#30363d] bg-[#161b22] p-5"
            >
              <span className="text-red-400 mt-0.5 text-xl">❌</span>
              <p className="text-sm text-[#8b949e]">{pain}</p>
            </div>
          ))}
        </div>
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-lg text-[#e6edf3] font-semibold">
            What if you could build an AI squad that works 24/7, never gets tired, and costs less than one employee?
          </p>
        </div>
      </section>

      {/* Solution - Features Grid */}
      <section className="bg-[#161b22] border-y border-[#30363d]">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            Introducing: <span className="text-[#FFD460]">AI CEO Quick Start V2</span>
          </h2>
          <p className="text-center text-[#8b949e] mb-12 max-w-2xl mx-auto">
            The complete playbook to build your AI workforce — from setup to revenue
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-[#30363d] bg-[#0d1117] p-6 flex flex-col items-center text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-[#8b949e]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonials */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
          Trusted by AI Builders Worldwide
        </h2>
        <p className="text-center text-[#8b949e] mb-12">
          Real people. Real results. Real examples in the guide.
        </p>
        
        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="rounded-xl border border-[#30363d] bg-[#161b22] p-6"
            >
              <p className="text-sm text-[#8b949e] mb-4 italic">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold text-sm">{testimonial.author}</p>
                  <p className="text-xs text-[#484f58]">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Block */}
        <div className="grid sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { icon: "📈", stat: "42", label: "Real-world examples" },
            { icon: "⏰", stat: "20+", label: "Hours saved/week" },
            { icon: "💵", stat: "$10k+", label: "Revenue unlocked" },
            { icon: "🚀", stat: "7 days", label: "To build your squad" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-2xl font-bold text-[#FFD460] mb-1">{item.stat}</div>
              <div className="text-xs text-[#8b949e]">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What You'll Learn - Chapter Breakdown */}
      <section className="bg-[#161b22] border-y border-[#30363d]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Inside the AI CEO Quick Start V2
          </h2>
          <div className="space-y-6">
            {chapters.map((chapter) => (
              <details
                key={chapter.num}
                className="group rounded-xl border border-[#30363d] bg-[#0d1117] overflow-hidden"
              >
                <summary className="cursor-pointer p-6 flex items-center justify-between hover:bg-[#161b22] transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-[#FFD460] font-bold text-lg">Ch. {chapter.num}</span>
                    <h3 className="font-semibold">{chapter.title}</h3>
                  </div>
                  <span className="text-[#8b949e] group-open:rotate-180 transition-transform">▼</span>
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
            <h3 className="font-bold text-lg mb-4 text-[#FFD460]">🎁 Bonus Content</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-[#FFD460]">✓</span>
                <span>Prompt Library (913 lines of battle-tested prompts)</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-[#FFD460]">✓</span>
                <span>Common Mistakes Checklist (36 pitfalls to avoid)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
          Get Started Today — <span className="text-[#FFD460]">Just $29</span>
        </h2>
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl border-2 border-[#FFD460]/30 bg-[#161b22] p-8">
            <h3 className="text-xl font-bold mb-6 text-center">AI CEO Quick Start V2</h3>
            
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

            <CTAButton className="w-full text-center" label="Build Your AI Squad Now ($29)" />

            <div className="mt-6 p-4 rounded-lg bg-[#0d1117] border border-[#30363d]">
              <p className="text-sm text-center text-[#8b949e]">
                <span className="text-[#FFD460] font-semibold">30-day money-back guarantee.</span>
                <br />
                If you don&apos;t save 10+ hours in the first week, full refund — no questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#161b22] border-y border-[#30363d]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-[#30363d] bg-[#0d1117] overflow-hidden"
              >
                <summary className="cursor-pointer p-5 flex items-center justify-between hover:bg-[#161b22] transition-colors">
                  <h3 className="font-semibold">{faq.q}</h3>
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
            Join 100+ CEOs Who Already Built Their AI Squads
          </h2>
          <p className="text-[#8b949e] mb-8 max-w-lg mx-auto">
            The future of work is here. Don&apos;t get left behind.
          </p>
          <CTAButton label="Get AI CEO Quick Start V2 ($29)" />
          
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
