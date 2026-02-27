# 🦞 MateClaw.ai - OpenClaw Use Cases Hub

> **Tổng hợp use cases & prompts thực tế từ cộng đồng OpenClaw**  
> Từ YouTube, GitHub, Twitter/X, Reddit, và community submissions

🌐 **Live site:** Coming soon (Week 1)  
📦 **Repo:** https://github.com/Victorpham1984/mateclaw-usecases  
📖 **Chi tiết dự án:** [PROJECT.md](./PROJECT.md)

---

## ✨ Features

- 🔍 **Smart Search** — Fuzzy search with Fuse.js
- 🏷️ **Category Filters** — 10 categories from Setup to Growth
- 📋 **Copy-Paste Prompts** — Ready-to-use templates
- 🎯 **Source Attribution** — YouTube timestamps, GitHub links
- 📱 **Responsive Design** — Mobile-first with TailwindCSS
- 🌙 **Dark Mode** — Beautiful dark UI by default

---

## 🚀 Quick Start

```bash
# Clone repo
git clone https://github.com/Victorpham1984/mateclaw-usecases.git
cd mateclaw-usecases

# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Search:** Fuse.js
- **Icons:** Phosphor Icons
- **Deployment:** Vercel
- **Analytics:** Plausible (privacy-friendly)

---

## 📂 Project Structure

```
mateclaw-usecases/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Homepage (use case grid)
│   ├── [slug]/page.tsx    # Individual use case page
│   └── api/
│       └── cases/         # Optional API routes
├── components/
│   ├── CaseCard.tsx       # Use case display card
│   ├── SearchBar.tsx      # Fuzzy search input
│   ├── CategoryFilter.tsx # Category buttons
│   └── CopyButton.tsx     # Clipboard copy utility
├── data/
│   ├── cases.json         # Main use case database
│   └── pending-cases.json # Scraped content awaiting review
├── lib/
│   ├── search.ts          # Fuse.js search logic
│   ├── types.ts           # TypeScript interfaces
│   └── utils.ts           # Helper functions
├── public/
│   └── og-image.png       # Open Graph social preview
├── PROJECT.md             # Detailed project plan
└── README.md              # This file
```

---

## 📊 Roadmap

### Week 1: MVP Foundation
- [x] Setup Next.js + TypeScript + TailwindCSS
- [ ] Core UI components (CaseCard, SearchBar, Filters)
- [ ] 20 manual use cases (seed content)
- [ ] Deploy to Vercel

### Week 2: Content Pipeline
- [ ] Automated scraping (YouTube, GitHub, Twitter)
- [ ] GPT-4 content extraction
- [ ] Community submission form
- [ ] 100+ use cases live

### Week 3: Lead Capture
- [ ] Gated premium content (email wall)
- [ ] Interactive tools (ROI calculator, workflow quiz)
- [ ] Analytics & conversion tracking

### Week 4: SEO & Growth
- [ ] On-page SEO optimization
- [ ] Structured data (JSON-LD)
- [ ] Content expansion (videos, code snippets)
- [ ] Backlink outreach

---

## 🎯 Use Case Categories

1. 🤖 **AI Agent Setup** — Installation, config, customization
2. 💻 **Development** — Coding, GitHub workflows, debugging
3. 📢 **Marketing** — SEO, social media, ad campaigns
4. 🎬 **Content Creation** — Video, blog posts, newsletters
5. 🔄 **Workflow Automation** — Cron jobs, API integrations
6. 💬 **Customer Support** — Chatbots, ticketing, FAQs
7. 📊 **Analytics** — Dashboards, reports, data analysis
8. 💰 **Finance** — Invoicing, expense tracking
9. 🎯 **Sales & CRM** — Lead gen, outreach, pipelines
10. 📈 **Growth** — A/B testing, viral loops, experiments

---

## 🤝 Contributing

Chúng tôi hoan nghênh community submissions! 

### How to Submit a Use Case

1. Fork this repo
2. Add your use case to `data/cases.json`
3. Follow the schema in `lib/types.ts`
4. Open a Pull Request

**Or use our submission form** (coming Week 2): [Submit Use Case](https://mateclaw-usecases.vercel.app/submit)

---

## 📝 Use Case Schema

```typescript
{
  "id": "uc001",
  "title": "**Run a team** of specialized AI agents",
  "description": "Set up multiple agents with different roles and personalities",
  "prompt": "Help me set up 4 specialized agents: developer, marketer, PM, and sysadmin. Each needs a unique personality and Slack integration.",
  "category": "setup",
  "tags": ["multi-agent", "team", "slack"],
  "source": {
    "type": "youtube",
    "url": "https://www.youtube.com/watch?v=example",
    "creator": "Brian Casel",
    "timestamp": 45
  },
  "addedAt": "2026-02-27",
  "difficulty": "intermediate",
  "timeEstimate": "2 hours",
  "roi": "Save 10h/week"
}
```

---

## 📜 License

MIT License — feel free to use, modify, and distribute.

**Attribution appreciated** — link back to this repo if you build something cool!

---

## 🙏 Credits

**Inspired by:** [UseClaw](https://useclaw.vercel.app) by [RoboLabs](https://robolabs.so)  
**Built by:** [BizMate](https://bizmate.ai) team  
**Community:** [MateClaw.ai Telegram Group](https://t.me/mateclaw)

---

## 📞 Contact

- **Issues:** [GitHub Issues](https://github.com/Victorpham1984/mateclaw-usecases/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Victorpham1984/mateclaw-usecases/discussions)
- **Telegram:** [@mateclaw](https://t.me/mateclaw)
- **Email:** hello@mateclaw.ai

---

**🚀 Let's build the best OpenClaw resource together!**
