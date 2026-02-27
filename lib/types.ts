// Type definitions for MateClaw Use Cases

export type CategoryKey =
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

export type SourceType =
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

export type DifficultyLevel = 'beginner' | 'intermediate' | 'expert';

export interface UseCase {
  id: string;                    // e.g., "uc001"
  title: string;                 // Rich markdown (e.g., "**Run a team** of specialized agents")
  description: string;           // Detailed explanation
  prompt: string;                // Ready-to-copy prompt for OpenClaw
  category: CategoryKey;
  tags: string[];               // e.g., ["multi-agent", "slack", "team"]
  source: {
    type: SourceType;
    url: string;
    creator?: string;           // Author/channel name
    channel?: string;           // YouTube channel, subreddit, etc.
    videoTitle?: string;        // For YouTube sources
    timestamp?: number;         // Seconds into video
  };
  addedAt: string;              // ISO date string (YYYY-MM-DD)
  difficulty?: DifficultyLevel;
  timeEstimate?: string;        // e.g., "5 min", "1 hour", "1 day"
  roi?: string;                 // e.g., "Save 2h/week", "$500/month"
}

export interface Category {
  label: string;                // e.g., "🤖 AI Agent Setup"
  color: string;                // Tailwind color class (blue, purple, etc.)
  description?: string;
}

export interface CategoryMap {
  [key: string]: Category;
}

export interface UseCaseData {
  useCases: UseCase[];
  categories: CategoryMap;
}

// Search-related types
export interface SearchOptions {
  keys: string[];               // Fields to search
  threshold: number;            // Fuzzy match threshold (0-1)
  includeScore: boolean;
}

export interface FilterOptions {
  category?: CategoryKey;
  tags?: string[];
  sourceType?: SourceType;
  difficulty?: DifficultyLevel;
  searchQuery?: string;
}
