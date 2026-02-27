// Research pipeline types

export type ResearchChannel = {
  channelId: string;
  channelName: string;
  channelUrl: string;
  channelDescription: string;
  thumbnailUrl: string;
  subscribers: string;
  totalVideos: string;
  recentVideos: number;
  avgViews: string;
  recentVideoTitles: string[];
  aiScore: number;
  aiReasoning: string;
  suggestedCategories: string[];
  sampleUseCases: string[];
  status: "suggested" | "approved" | "rejected" | "later";
  approvedAt?: string;
  rejectedAt?: string;
};

export type ResearchResult = {
  id: string;
  keyword: string;
  language: string;
  minSubscribers: number;
  recentDaysFilter: number;
  totalFound: number;
  channels: ResearchChannel[];
  searchedAt: string;
  completedAt: string | null;
  status: "searching" | "scoring" | "completed" | "failed";
  error?: string;
};

export type ResearchCache = {
  researches: ResearchResult[];
};

export type ResearchSearchInput = {
  keyword: string;
  limit?: number;
  language?: "en" | "vi" | "all";
  minSubscribers?: number;
  recentDaysFilter?: number;
};
