"use client";

import { useState, useEffect } from "react";

interface InstagramMetrics {
  followers: number;
  engagementRate: number;
  avgViews: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

interface HistoryDay {
  date: string;
  followers: number;
  newFollows: number;
  unfollows: number;
}

interface HistorySummary {
  totalNewFollows: number;
  totalUnfollows: number;
  netGrowth: number;
}

const platforms = [
  { id: "instagram", name: "Instagram", icon: InstagramIcon, color: "#E4405F" },
  { id: "facebook", name: "Facebook", icon: FacebookIcon, color: "#1877F2" },
  { id: "tiktok", name: "TikTok", icon: TikTokIcon, color: "#000000" },
];

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function formatFullNumber(num: number): string {
  return num.toLocaleString();
}

export default function Dashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [igMetrics, setIgMetrics] = useState<InstagramMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyDays, setHistoryDays] = useState<7 | 30>(7);
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [historySummary, setHistorySummary] = useState<HistorySummary | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyCache, setHistoryCache] = useState<Record<number, { history: HistoryDay[]; summary: HistorySummary }>>({});
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedPlatform === "instagram") {
      fetch("/api/metrics/instagram")
        .then((res) => res.json())
        .then((data) => {
          setIgMetrics(data.metrics || null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [selectedPlatform]);

  useEffect(() => {
    if (selectedPlatform === "instagram") {
      // Check cache first
      const cached = historyCache[historyDays];
      if (cached) {
        setHistory(cached.history);
        setHistorySummary(cached.summary);
        setHistoryLoading(false);
        return;
      }

      setHistoryLoading(true);
      fetch(`/api/metrics/instagram/history?days=${historyDays}`)
        .then((res) => res.json())
        .then((data) => {
          const historyData = data.history || [];
          const summaryData = data.summary || null;
          setHistory(historyData);
          setHistorySummary(summaryData);
          // Cache the result
          if (summaryData) {
            setHistoryCache((prev) => ({
              ...prev,
              [historyDays]: { history: historyData, summary: summaryData },
            }));
          }
          setHistoryLoading(false);
        })
        .catch(() => {
          setHistory([]);
          setHistorySummary(null);
          setHistoryLoading(false);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform, historyDays]);

  // Mock data for TikTok and Facebook only
  const mockData = {
    followers: "124.5K",
    engagementRate: "4.8%",
    avgViews: "45.2K",
    reach: "892K",
    likes: { count: "45.2K", percent: 68 },
    comments: { count: "12.1K", percent: 18 },
    shares: { count: "6.2K", percent: 9 },
    saves: { count: "3.4K", percent: 5 },
  };

  const isInstagram = selectedPlatform === "instagram";
  const hasIgData = isInstagram && igMetrics && !loading;

  // For Instagram: show real data or "-", for others: show mock
  const getStatValue = (igValue: string | undefined, mockValue: string) => {
    if (!isInstagram) return mockValue;
    return hasIgData && igValue ? igValue : "-";
  };

  const displayData = hasIgData
    ? {
        followers: formatFullNumber(igMetrics.followers || 0),
        engagementRate: (igMetrics.engagementRate || 0).toFixed(2) + "%",
        avgViews: formatNumber(igMetrics.avgViews || 0),
        reach: formatNumber(igMetrics.reach || 0),
        likes: igMetrics.likes || 0,
        comments: igMetrics.comments || 0,
        shares: igMetrics.shares || 0,
        saves: igMetrics.saves || 0,
      }
    : null;

  // Calculate engagement breakdown percentages
  const engagementBreakdown = displayData
    ? (() => {
        const total = displayData.likes + displayData.comments + displayData.shares + displayData.saves;
        if (total === 0) return { likes: 0, comments: 0, shares: 0, saves: 0 };
        return {
          likes: Math.round((displayData.likes / total) * 100),
          comments: Math.round((displayData.comments / total) * 100),
          shares: Math.round((displayData.shares / total) * 100),
          saves: Math.round((displayData.saves / total) * 100),
        };
      })()
    : null;

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      </div>

      {/* Platform Selection Bar */}
      <div className="flex items-center gap-1 sm:gap-2 mb-8 p-1 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] flex-wrap sm:flex-nowrap">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatform === platform.id;
          return (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`
                flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200
                ${isSelected
                  ? "bg-hover text-[#768cff]"
                  : "text-muted hover:bg-hover hover:text-foreground"
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{platform.name}</span>
            </button>
          );
        })}
        <button className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-muted hover:bg-hover hover:text-foreground transition-all duration-200 flex-shrink-0">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Followers"
          value={getStatValue(displayData?.followers, mockData.followers)}
          icon={<UsersIcon />}
        />
        <StatCard
          title="Avg. Engagement Rate"
          value={getStatValue(displayData?.engagementRate, mockData.engagementRate)}
          icon={<HeartIcon />}
        />
        <StatCard
          title="Avg. Views per Post"
          value={getStatValue(displayData?.avgViews, mockData.avgViews)}
          icon={<EyeIcon />}
        />
        <StatCard
          title="Monthly Reach"
          value={getStatValue(displayData?.reach, mockData.reach)}
          icon={<TrendingIcon />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Follower Growth */}
        <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-foreground">Follower Growth</h2>
            <select
              className="text-sm text-muted bg-transparent border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#768cff]"
              value={historyDays}
              onChange={(e) => {
                setHistoryDays(parseInt(e.target.value) as 7 | 30);
                setSelectedDayIndex(null);
              }}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
          <div className="h-48" onClick={() => setSelectedDayIndex(null)}>
            {isInstagram && historyLoading ? (
              <div className="flex items-center justify-center h-full text-muted text-sm">Loading...</div>
            ) : (
              <FollowerGrowthChart
                data={isInstagram ? history : []}
                isInstagram={isInstagram}
                days={historyDays}
                selectedIndex={selectedDayIndex}
                onSelectDay={(idx) => setSelectedDayIndex(idx)}
              />
            )}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            {(() => {
              const selectedDay = selectedDayIndex !== null ? history[selectedDayIndex] : null;
              const dayNet = selectedDay ? selectedDay.newFollows - selectedDay.unfollows : 0;
              const showingDay = isInstagram && selectedDay;

              return (
                <>
                  <div>
                    <p className="text-sm text-muted">Follows</p>
                    <p className="text-xl font-semibold text-foreground">
                      {isInstagram
                        ? (historyLoading ? "-" : (showingDay ? `+${selectedDay.newFollows.toLocaleString()}` : (historySummary ? `+${historySummary.totalNewFollows.toLocaleString()}` : "-")))
                        : "+2,847"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Net growth</p>
                    <p className={`text-xl font-semibold ${(showingDay ? dayNet < 0 : (historySummary && historySummary.netGrowth < 0)) ? "text-red-500" : "text-emerald-500"}`}>
                      {isInstagram
                        ? (historyLoading ? "-" : (showingDay ? `${dayNet >= 0 ? "+" : ""}${dayNet.toLocaleString()}` : (historySummary ? `${historySummary.netGrowth >= 0 ? "+" : ""}${historySummary.netGrowth.toLocaleString()}` : "-")))
                        : "+2,723"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Unfollows</p>
                    <p className="text-xl font-semibold text-red-500">
                      {isInstagram
                        ? (historyLoading ? "-" : (showingDay ? `-${selectedDay.unfollows.toLocaleString()}` : (historySummary ? `-${historySummary.totalUnfollows.toLocaleString()}` : "-")))
                        : "-124"}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Engagement Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
          <h2 className="text-lg font-medium text-foreground mb-6">Engagement Breakdown</h2>
          <div className="space-y-4">
            <EngagementBar
              label="Likes"
              value={isInstagram ? (engagementBreakdown?.likes ?? 0) : mockData.likes.percent}
              count={isInstagram ? (displayData ? formatNumber(displayData.likes) : "-") : mockData.likes.count}
              color="#768cff"
            />
            <EngagementBar
              label="Comments"
              value={isInstagram ? (engagementBreakdown?.comments ?? 0) : mockData.comments.percent}
              count={isInstagram ? (displayData ? formatNumber(displayData.comments) : "-") : mockData.comments.count}
              color="#10b981"
            />
            <EngagementBar
              label="Shares"
              value={isInstagram ? (engagementBreakdown?.shares ?? 0) : mockData.shares.percent}
              count={isInstagram ? (displayData ? formatNumber(displayData.shares) : "-") : mockData.shares.count}
              color="#f59e0b"
            />
            <EngagementBar
              label="Saves"
              value={isInstagram ? (engagementBreakdown?.saves ?? 0) : mockData.saves.percent}
              count={isInstagram ? (displayData ? formatNumber(displayData.saves) : "-") : mockData.saves.count}
              color="#8b5cf6"
            />
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Total Engagements</span>
              <span className="text-lg font-semibold text-foreground">
                {isInstagram
                  ? (displayData
                      ? formatNumber(displayData.likes + displayData.comments + displayData.shares + displayData.saves)
                      : "-")
                  : "66.9K"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
        <h2 className="text-lg font-medium text-foreground mb-6">Platform Performance Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-sm font-medium text-muted pb-4">Metric</th>
                <th className="text-right text-sm font-medium text-muted pb-4">This Week</th>
                <th className="text-right text-sm font-medium text-muted pb-4">Last Week</th>
                <th className="text-right text-sm font-medium text-muted pb-4">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <PerformanceRow metric="Profile Visits" thisWeek={isInstagram && !hasIgData ? "-" : "12,847"} lastWeek={isInstagram && !hasIgData ? "-" : "11,234"} change={isInstagram && !hasIgData ? "-" : "+14.3%"} positive />
              <PerformanceRow metric="Post Impressions" thisWeek={isInstagram && !hasIgData ? "-" : "458K"} lastWeek={isInstagram && !hasIgData ? "-" : "412K"} change={isInstagram && !hasIgData ? "-" : "+11.2%"} positive />
              <PerformanceRow metric="Link Clicks" thisWeek={isInstagram && !hasIgData ? "-" : "2,341"} lastWeek={isInstagram && !hasIgData ? "-" : "1,987"} change={isInstagram && !hasIgData ? "-" : "+17.8%"} positive />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#768cff]/10 flex items-center justify-center text-[#768cff]">
          {icon}
        </div>
      </div>
      <p className="text-sm text-muted mb-1">{title}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EngagementBar({
  label,
  value,
  count,
  color,
}: {
  label: string;
  value: number;
  count: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-muted">{count} ({value}%)</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function PerformanceRow({
  metric,
  thisWeek,
  lastWeek,
  change,
  positive,
}: {
  metric: string;
  thisWeek: string;
  lastWeek: string;
  change: string;
  positive: boolean;
}) {
  return (
    <tr>
      <td className="py-4 text-sm text-foreground">{metric}</td>
      <td className="py-4 text-sm text-foreground text-right font-medium">{thisWeek}</td>
      <td className="py-4 text-sm text-muted text-right">{lastWeek}</td>
      <td className={`py-4 text-sm text-right font-medium ${positive ? "text-emerald-500" : "text-red-500"}`}>
        {change}
      </td>
    </tr>
  );
}

function FollowerGrowthChart({ data, isInstagram, days, selectedIndex, onSelectDay }: { data: HistoryDay[]; isInstagram: boolean; days: number; selectedIndex: number | null; onSelectDay: (idx: number) => void }) {
  // Mock data for non-Instagram
  const mockData = [
    { day: "Mon", value: 40 },
    { day: "Tue", value: 55 },
    { day: "Wed", value: 45 },
    { day: "Thu", value: 70 },
    { day: "Fri", value: 65 },
    { day: "Sat", value: 85 },
    { day: "Sun", value: 75 },
  ];

  if (!isInstagram) {
    const maxValue = Math.max(...mockData.map(d => d.value));
    return (
      <div className="flex items-end justify-between h-full gap-2">
        {mockData.map((item) => (
          <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex justify-center">
              <div
                className="w-8 bg-[#768cff]/20 rounded-t-md relative group cursor-pointer hover:bg-[#768cff]/30 transition-colors"
                style={{ height: `${(item.value / maxValue) * 160}px` }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-[#768cff] rounded-t-md transition-all"
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-muted">{item.day}</span>
          </div>
        ))}
      </div>
    );
  }

  // Real Instagram data
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted text-sm">
        No data available
      </div>
    );
  }

  const chartData = data.map((d) => ({
    label: days === 7
      ? new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })
      : new Date(d.date).getDate().toString(),
    newFollows: d.newFollows,
    unfollows: d.unfollows,
    net: d.newFollows - d.unfollows,
  }));

  const maxValue = Math.max(...chartData.map(d => Math.max(d.newFollows, d.unfollows)), 1);

  return (
    <div className="flex items-end h-full gap-1 overflow-x-auto pt-2 pb-6">
      {chartData.map((item, idx) => {
        const isSelected = selectedIndex === idx;
        return (
          <div
            key={idx}
            className={`flex-1 min-w-[20px] flex flex-col items-center justify-end h-full cursor-pointer ${isSelected ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectDay(idx);
            }}
          >
            <div className="flex items-end gap-0.5 h-[130px]">
              <div
                className={`w-2.5 rounded-t-sm ${isSelected ? "bg-emerald-400" : "bg-emerald-500"}`}
                style={{ height: `${Math.max((item.newFollows / maxValue) * 130, item.newFollows > 0 ? 4 : 0)}px` }}
              />
              <div
                className={`w-2.5 rounded-t-sm ${isSelected ? "bg-red-300" : "bg-red-400"}`}
                style={{ height: `${Math.max((item.unfollows / maxValue) * 130, item.unfollows > 0 ? 4 : 0)}px` }}
              />
            </div>
            <span className={`text-[10px] whitespace-nowrap mt-1 ${isSelected ? "text-foreground font-medium" : "text-muted"}`}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Icons
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function TrendingIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
