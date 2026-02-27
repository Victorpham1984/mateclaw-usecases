# MateClaw.ai - OpenClaw Use Cases Hub

**Tên dự án:** MateClaw.ai - OpenClaw Use Cases  
**Repo:** https://github.com/Victorpham1984/mateclaw-usecases  
**Tech Stack:** Next.js 14 + TypeScript + TailwindCSS  
**Mục tiêu:** Tổng hợp use cases & prompts thực tế từ cộng đồng OpenClaw → lead generation tool

---

## MỤC TIÊU KINH DOANH

### Value Proposition
Cung cấp **nơi tổng hợp tất cả use cases thực tế** về OpenClaw từ:
- YouTube tutorials
- GitHub discussions & repos
- Twitter/X posts
- Reddit threads
- Blog posts & articles
- Community submissions

### Lead Generation Strategy
1. **Free tier:** Browse all use cases, search, filter, copy prompts
2. **Gated content:** Advanced use cases + templates → email required
3. **Tools:** ROI calculator, workflow quiz → sign-up
4. **CTA:** "Try MateClaw Free" → conversion to BizMate ecosystem

### Success Metrics
- **Traffic:** 1,000 organic visitors/month (Month 3)
- **Conversion:** 5% email capture rate
- **SEO:** Rank top 3 for "OpenClaw use cases", "OpenClaw examples"
- **Community:** 50+ user submissions

---

## BUILD PLAN — 4 TUẦN

### WEEK 1: MVP Foundation (Feb 27 - Mar 6)
**Goal:** Deployed site với 20 sample use cases

#### Tasks
- [x] Create GitHub repo
- [x] Setup Next.js 14 + TypeScript + TailwindCSS
- [x] Install dependencies (Fuse.js, Phosphor Icons)
- [ ] **Day 1-2:** Core UI components
  - [ ] Homepage layout
  - [ ] CaseCard component
  - [ ] SearchBar component
  - [ ] CategoryFilter component
  - [ ] CopyButton component
- [ ] **Day 3:** Data structure & seed content
  - [ ] Define TypeScript types (UseCase, Category, Source)
  - [ ] Create `/data/cases.json` schema
  - [ ] Write 20 manual use cases (Vietnamese + English)
- [ ] **Day 4:** Search & filter logic
  - [ ] Fuse.js integration
  - [ ] Category filtering
  - [ ] Tag filtering
  - [ ] Source type filtering
- [ ] **Day 5:** Polish & deploy
  - [ ] Animations & hover effects
  - [ ] SEO meta tags
  - [ ] Open Graph images
  - [ ] Deploy to Vercel
  - [ ] Test on mobile/desktop

**Deliverable:** Live site at `mateclaw-usecases.vercel.app`

**Owner:** Kiến (lead), Thép (support)

---

### WEEK 2: Content Pipeline (Mar 7 - 13)
**Goal:** Automated content scraping → 100+ use cases

#### Tasks
- [ ] **Scraping bots:**
  - [ ] YouTube scraper (yt-dlp + Whisper transcription)
  - [ ] GitHub scraper (search API + discussions)
  - [ ] Twitter/X scraper (search mentions, threads)
  - [ ] Reddit scraper (r/OpenClaw, r/ClaudeAI)
- [ ] **Content extraction:**
  - [ ] GPT-4 prompt to extract use case from raw text
  - [ ] Validation schema (required fields)
  - [ ] Duplicate detection (similarity check)
- [ ] **Review workflow:**
  - [ ] Admin dashboard for pending cases
  - [ ] Approve/reject/edit interface
  - [ ] Batch publish
- [ ] **Community submission:**
  - [ ] Public submission form
  - [ ] Email notification on submit
  - [ ] Moderation queue

**Deliverable:** 100+ high-quality use cases live

**Owner:** Minh (automation), Soi (content review)

---

### WEEK 3: Lead Capture & Conversion (Mar 14 - 20)
**Goal:** Convert visitors to leads

#### Tasks
- [ ] **Gated content:**
  - [ ] "Premium Use Cases" collection (email wall)
  - [ ] Downloadable templates (config files, scripts)
  - [ ] Weekly digest newsletter signup
- [ ] **Interactive tools:**
  - [ ] "Find Your Workflow" quiz (Typeform-style)
  - [ ] ROI calculator (time saved × hourly rate)
  - [ ] Complexity estimator (beginner/intermediate/expert)
- [ ] **CTAs:**
  - [ ] "Try MateClaw Free" buttons
  - [ ] "Get Custom Setup Help" → calendly link
  - [ ] Exit-intent popup
- [ ] **Analytics:**
  - [ ] Plausible Analytics integration
  - [ ] Conversion funnel tracking
  - [ ] Heatmaps (optional: Hotjar)

**Deliverable:** 5%+ email capture rate

**Owner:** Phát (tools), Đệ (conversion optimization)

---

### WEEK 4: SEO & Growth (Mar 21 - 27)
**Goal:** Organic discovery engine

#### Tasks
- [ ] **On-page SEO:**
  - [ ] Unique meta descriptions (each case)
  - [ ] Structured data (JSON-LD)
  - [ ] Internal linking strategy
  - [ ] Alt text for images
  - [ ] XML sitemap
- [ ] **Content expansion:**
  - [ ] Video walkthroughs (embed YouTube)
  - [ ] Code snippets (syntax highlight)
  - [ ] Before/after examples
  - [ ] Success metrics per case
- [ ] **Off-page SEO:**
  - [ ] Submit to directories
  - [ ] Share on Hacker News, Reddit
  - [ ] Reach out to creators for backlinks
  - [ ] Guest post on AI blogs
- [ ] **Performance:**
  - [ ] Core Web Vitals optimization
  - [ ] Image optimization (next/image)
  - [ ] Lazy loading
  - [ ] Caching strategy

**Deliverable:** Top 10 ranking for target keywords

**Owner:** Squad collab, Đệ oversight

---

## DATA STRUCTURE

### TypeScript Schema
```typescript
interface UseCase {
  id: string;                    // uc001, uc002...
  title: string;                 // **Bold title**
  description: string;           // Rich explanation
  prompt: string;                // Copy-paste ready prompt
  category: CategoryKey;         // setup, development, marketing...
  tags: string[];               // multi-agent, slack, github...
  source: {
    type: SourceType;           // youtube, github, twitter...
    url: string;
    creator?: string;
    channel?: string;
    timestamp?: number;          // For YouTube
  };
  addedAt: string;              // YYYY-MM-DD
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  timeEstimate?: string;        // "5 min", "1 hour", "1 day"
  roi?: string;                 // "Save 2h/week", "$500/month"
}

interface Category {
  label: string;                // 🤖 AI Agent Setup
  color: string;                // tailwind color class
  description?: string;
}

type CategoryKey = 
  | 'setup'
  | 'development' 
  | 'marketing'
  | 'content'
  | 'automation'
  | 'customer-support'
  | 'analytics'
  | 'finance'
  | 'sales'
  | 'growth';

type SourceType =
  | 'youtube'
  | 'github'
  | 'twitter'
  | 'x'
  | 'reddit'
  | 'hackernews'
  | 'linkedin'
  | 'medium'
  | 'article'
  | 'forum'
  | 'web'
  | 'community';
```

---

## CATEGORIES (MateClaw Focused)

```json
{
  "setup": {
    "label": "🤖 AI Agent Setup",
    "color": "blue",
    "description": "Cài đặt, cấu hình, và tùy chỉnh OpenClaw agents"
  },
  "development": {
    "label": "💻 Development & Coding",
    "color": "purple",
    "description": "Build apps, debug code, manage GitHub workflows"
  },
  "marketing": {
    "label": "📢 Marketing & Ads",
    "color": "pink",
    "description": "Social media, SEO, content distribution, ad campaigns"
  },
  "content": {
    "label": "🎬 Content Creation",
    "color": "orange",
    "description": "Video scripts, blog posts, newsletters, creative writing"
  },
  "automation": {
    "label": "🔄 Workflow Automation",
    "color": "green",
    "description": "Zapier-style automations, cron jobs, API integrations"
  },
  "customer-support": {
    "label": "💬 Customer Support",
    "color": "cyan",
    "description": "Chatbots, ticket management, FAQ automation"
  },
  "analytics": {
    "label": "📊 Analytics & Reporting",
    "color": "indigo",
    "description": "Data analysis, dashboards, business intelligence"
  },
  "finance": {
    "label": "💰 Finance & Accounting",
    "color": "yellow",
    "description": "Expense tracking, invoicing, financial reports"
  },
  "sales": {
    "label": "🎯 Sales & CRM",
    "color": "red",
    "description": "Lead generation, outreach, pipeline management"
  },
  "growth": {
    "label": "📈 Growth & Experimentation",
    "color": "emerald",
    "description": "A/B testing, growth hacks, viral loops"
  }
}
```

---

## TECH DECISIONS

### Why Next.js 14?
- **App Router:** Better SEO with React Server Components
- **File-based routing:** Easy `/cases/[slug]` pages
- **Built-in optimization:** Image, font, script optimization
- **Vercel deployment:** Zero-config, free tier generous

### Why TypeScript?
- **Type safety:** Catch bugs early
- **Better DX:** IntelliSense, autocomplete
- **Refactoring confidence:** Large-scale changes safe

### Why TailwindCSS?
- **Rapid development:** No custom CSS files
- **Consistent design:** Utility-first approach
- **Small bundle:** Tree-shaking by default
- **Dark mode:** Built-in with `dark:` variant

### Why Fuse.js?
- **Fuzzy search:** Typo-tolerant
- **Client-side:** No backend needed
- **Fast:** Search 1000s of items instantly
- **Customizable:** Weight different fields

---

## DEPLOYMENT STRATEGY

### Development
```bash
npm run dev  # localhost:3000
```

### Staging (Vercel Preview)
- Every PR → automatic preview deploy
- Test before merge

### Production
- Main branch → auto-deploy to `mateclaw-usecases.vercel.app`
- Custom domain (optional): `usecases.mateclaw.ai`

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=mateclaw-usecases.vercel.app
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX (optional)
OPENAI_API_KEY=sk-... (for content extraction)
GITHUB_TOKEN=ghp_... (for scraping)
TWITTER_BEARER_TOKEN=... (for scraping)
```

---

## CONTENT PIPELINE AUTOMATION

### Daily Scraping Cron (OpenClaw job)
```javascript
// Runs every day at 2 AM
{
  "schedule": { "kind": "cron", "expr": "0 2 * * *" },
  "payload": { 
    "kind": "agentTurn",
    "message": "Run daily content scraping: YouTube (last 24h), GitHub (new discussions), Twitter (mentions). Extract new use cases, save to /data/pending-cases.json for review."
  },
  "sessionTarget": "isolated",
  "delivery": { "mode": "announce", "channel": "telegram" }
}
```

### Review Workflow
1. Agent scrapes → saves to `pending-cases.json`
2. Human reviews in admin dashboard (Week 2 deliverable)
3. Approve → merge to `cases.json` → auto-deploy
4. Reject → delete or edit

---

## SUCCESS CRITERIA

### Week 1 (MVP)
- ✅ Site deployed and accessible
- ✅ 20 high-quality use cases
- ✅ Search & filter working
- ✅ Mobile-responsive

### Week 2 (Content)
- ✅ 100+ use cases
- ✅ Automated scraping working
- ✅ Community submission form live

### Week 3 (Conversion)
- ✅ Email capture implemented
- ✅ 5%+ conversion rate
- ✅ Analytics tracking

### Week 4 (Growth)
- ✅ Top 10 Google ranking for "OpenClaw use cases"
- ✅ 500+ organic visitors
- ✅ 25+ emails collected

---

## SQUAD ASSIGNMENTS

| Role | Agent | Responsibilities |
|------|-------|-----------------|
| **Tech Lead** | Kiến | Next.js architecture, core components, deployment |
| **Backend/Automation** | Thép | Scraping bots, data pipeline, cron jobs |
| **Content & QA** | Minh | Manual use cases, content review, testing |
| **Tools & Analytics** | Soi | Interactive tools (quiz, calculator), tracking |
| **Optimization** | Phát | SEO, performance, conversion rate optimization |
| **CEO & Oversight** | Đệ | Strategy, prioritization, stakeholder updates |

---

## RISKS & MITIGATION

### Risk 1: Low-quality scraped content
**Mitigation:** Human review required before publish (Week 2 workflow)

### Risk 2: Copyright issues
**Mitigation:** Always attribute sources, rewrite in our voice, don't copy verbatim

### Risk 3: Low traffic
**Mitigation:** Strong SEO foundation, community seeding (Reddit, HN), backlink outreach

### Risk 4: Poor conversion
**Mitigation:** A/B test CTAs, offer high-value gated content, optimize funnel

---

## BUDGET

### One-time
- **Development:** $0 (in-house squad)
- **Design assets:** $0 (TailwindCSS + open fonts)
- **Domain:** $15/year (mateclaw.ai or usecases.mateclaw.ai)

### Monthly Recurring
- **Vercel hosting:** $0 (free tier sufficient for start)
- **Plausible Analytics:** $9/month
- **OpenAI API:** ~$20/month (content extraction)
- **Twitter API:** $100/month (scraping)
- **GitHub API:** $0 (free tier)
- **YouTube API:** $0 (free quota)

**Total monthly:** ~$130

### Upgrade Path
- If traffic >100K/month → Vercel Pro ($20/month)
- If email list >1000 → ConvertKit ($29/month)

---

## NEXT STEPS (Immediate)

### Today (Feb 27)
- [x] Create repo
- [x] Setup Next.js project
- [ ] **Kiến:** Build homepage layout (2-3h)
- [ ] **Soi:** Write 5 sample use cases manually (1-2h)
- [ ] **Đệ:** Create project brief for squad (done ✅)

### Tomorrow (Feb 28)
- [ ] **Kiến:** CaseCard + SearchBar components
- [ ] **Thép:** Setup data structure + TypeScript types
- [ ] **Minh:** Write 10 more use cases (reach 15 total)

### End of Week 1 (Mar 6)
- [ ] Deploy MVP to Vercel
- [ ] Share with BizMate team for feedback
- [ ] Post on MateClaw Telegram group

---

**Status:** 🚀 Project initiated  
**Next milestone:** Week 1 MVP (Mar 6)  
**Owner:** Đệ (CEO)  
**Last updated:** 2026-02-27
