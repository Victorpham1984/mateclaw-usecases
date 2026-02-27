# YouTube Auto-Research Pipeline

Intelligent keyword-based YouTube channel discovery system for MateClaw Use Cases Hub.

## Overview

The Research Pipeline replaces manual channel input with an automated discovery workflow:

1. **Admin inputs keyword** (e.g., "AI automation tools")
2. **YouTube Search API** finds relevant channels
3. **AI scoring** (Claude 3.5 Sonnet via OpenRouter) rates relevance 0-100
4. **Admin reviews** suggestions (approve/reject/later)
5. **Approved channels** auto-added to sources → existing crawl pipeline handles the rest

## How to Use

### Admin UI

Navigate to `/admin/youtube/research` (requires admin login).

1. **Enter a keyword** in the search box
2. **Set filters**: language (all/en/vi), minimum subscribers
3. **Click Search** — takes 30-60 seconds for YouTube API + AI scoring
4. **Review results** sorted by AI score
5. **Approve** channels to add them as crawl sources
6. **Bulk approve**: "Approve All ≥80" or "Approve Top 5"

### API Endpoints

#### Search Channels
```
POST /api/research/youtube
Authorization: Bearer <ADMIN_PASSWORD>
Content-Type: application/json

{
  "keyword": "AI automation tools",
  "limit": 20,
  "language": "all",          // "en" | "vi" | "all"
  "minSubscribers": 10000,
  "recentDaysFilter": 30
}
```

#### Get Past Research Results
```
GET /api/research/youtube?limit=10
Authorization: Bearer <ADMIN_PASSWORD>
```

#### Approve/Reject a Channel
```
PATCH /api/research/youtube/{channelId}
Authorization: Bearer <ADMIN_PASSWORD>
Content-Type: application/json

{
  "action": "approve",   // "approve" | "reject" | "later"
  "researchId": "res-..."
}
```

## YouTube API Quota

**Daily quota: 10,000 units** (free tier)

Per research query:
| Operation | Units | Notes |
|-----------|-------|-------|
| Channel search | 100 | One search call |
| Channel stats | 1 | Batch call for all channels |
| Recent videos (per channel) | 100 | Only top 10 channels |
| Video stats (per batch) | 1 | Batch call |
| **Total per research** | **~1,100** | For 10 channels with videos |

**Estimate: ~9 researches per day** on free tier.

### Quota Optimization
- Channel stats fetched in batch (1 API call for all)
- Video stats fetched in batch
- Only top 10 channels get recent video details
- Results cached in `data/youtube-research-cache.json`

## AI Scoring

**Model:** Claude 3.5 Sonnet (via OpenRouter)
**Cost:** ~$0.01-0.02 per research query

**Scoring criteria:**
- 90-100: Directly about AI assistants, automation, productivity tools
- 70-89: Related to AI, tech, or productivity
- 40-69: Somewhat related (general tech, business)
- 0-39: Unrelated or very tangential

**Fallback:** If OpenRouter API fails, keyword heuristic scoring is used (capped at 75).

## Example Keywords That Work Well

| Keyword | Expected Results |
|---------|-----------------|
| `AI automation tools` | Channels about AI productivity tools |
| `ChatGPT productivity` | ChatGPT/LLM use case channels |
| `AI agent tutorial` | AI agent development channels |
| `no code automation` | No-code/low-code automation channels |
| `AI workflow automation` | Workflow automation with AI |
| `personal AI assistant` | Personal assistant AI channels |

## File Structure

```
app/admin/youtube/research/page.tsx   # Admin UI
app/api/research/youtube/route.ts     # POST search, GET history
app/api/research/youtube/[channelId]/route.ts  # PATCH approve/reject
lib/research/
  types.ts            # TypeScript types
  youtube-search.ts   # YouTube API wrapper
  ai-scorer.ts        # AI scoring engine
  research-data.ts    # File-based data layer
data/
  youtube-research-cache.json  # Cached research results
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `YOUTUBE_API_KEY` | Yes | YouTube Data API v3 |
| `OPENROUTER_API_KEY` | Yes | AI scoring via Claude |
| `ADMIN_PASSWORD` | Yes | Admin authentication |
| `GITHUB_TOKEN` | Optional | Auto-commit approved sources |

## Integration with Existing Pipeline

Approved channels are automatically added to `data/youtube-sources.json` with:
- `addedFrom: "research"` metadata
- AI score in description
- `enabled: true`

They are then picked up by:
- Manual crawl: `/api/pipeline/crawl`
- Cron job: `/api/cron/youtube`

**No changes needed to the existing crawl pipeline.**
