"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_COLORS: Record<string, string> = {
  setup: "#3b82f6",
  development: "#a855f7",
  marketing: "#ec4899",
  content: "#f97316",
  automation: "#eab308",
  "customer-support": "#22c55e",
  analytics: "#06b6d4",
  finance: "#10b981",
  sales: "#f43f5e",
  growth: "#f59e0b",
  "life-admin": "#64748b",
  "personal-growth": "#84cc16",
  "smart-home": "#14b8a6",
  health: "#ef4444",
  monetization: "#d97706",
  "e-commerce": "#6366f1",
};

export { CATEGORY_COLORS };

interface Props {
  categoryCounts: { key: string; label: string; count: number }[];
}

export default function CategoryChart({ categoryCounts }: Props) {
  const filtered = categoryCounts.filter((c) => c.count > 0);
  const total = filtered.reduce((s, c) => s + c.count, 0);

  const data = {
    labels: filtered.map((c) => c.label),
    datasets: [
      {
        data: filtered.map((c) => c.count),
        backgroundColor: filtered.map((c) => CATEGORY_COLORS[c.key] || "#8b949e"),
        borderColor: "#0d1117",
        borderWidth: 2,
        hoverBorderColor: "#e6edf3",
        hoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "60%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#161b22",
        titleColor: "#e6edf3",
        bodyColor: "#8b949e",
        borderColor: "#30363d",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx: any) => {
            const count = ctx.parsed;
            const pct = ((count / total) * 100).toFixed(1);
            return ` ${ctx.label}: ${count} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] mx-auto">
      <Doughnut data={data} options={options} />
    </div>
  );
}
