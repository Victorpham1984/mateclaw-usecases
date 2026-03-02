import type { CategoryMap } from "./types";

export const CATEGORIES: CategoryMap = {
  setup: { label: "🛠 Setup", color: "blue" },
  development: { label: "💻 Development", color: "purple" },
  marketing: { label: "📢 Marketing", color: "pink" },
  content: { label: "✍️ Content", color: "orange" },
  automation: { label: "⚡ Automation", color: "yellow" },
  "customer-support": { label: "🎧 Support", color: "green" },
  analytics: { label: "📊 Analytics", color: "cyan" },
  finance: { label: "💰 Finance", color: "emerald" },
  sales: { label: "🤝 Sales", color: "rose" },
  growth: { label: "🚀 Growth", color: "amber" },
  "life-admin": { label: "🏠 Life Admin", color: "slate" },
  "personal-growth": { label: "🌱 Personal Growth", color: "lime" },
  "smart-home": { label: "🏡 Smart Home", color: "teal" },
  health: { label: "❤️ Health", color: "red" },
  monetization: { label: "💵 Monetization", color: "gold" },
  "e-commerce": { label: "🛒 E-Commerce", color: "indigo" },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES);
