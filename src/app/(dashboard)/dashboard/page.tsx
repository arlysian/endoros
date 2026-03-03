"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Area, AreaChart, Bar, BarChart, Label, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface InstagramMetrics {
  followers: number;
  engagementRate: number;
  avgViews: number;
  reach: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_saves: number;
  profileVisits: number;
  linkClicks: number;
}

interface TikTokMetrics {
  followers: number;
  engagementRate: number;
  avgViews: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
}

interface HistoryDay {
  date: string;
  followers: number;
  newFollows: number;
  unfollows: number;
  profileVisits?: number;
  linkClicks?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
}

interface TikTokHistoryDay {
  date: string;
  followers: number;
}

interface HistorySummary {
  totalNewFollows: number;
  totalUnfollows: number;
  netGrowth: number;
  totalProfileVisits: number;
  totalLinkClicks: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
}

interface TikTokHistorySummary {
  netGrowth: number;
}

const allPlatforms = [
  { id: "instagram", name: "Instagram", icon: InstagramIcon },
  { id: "tiktok", name: "TikTok", icon: TikTokIcon },
  { id: "youtube", name: "YouTube", icon: YouTubeIcon },
  { id: "facebook", name: "Facebook", icon: FacebookIcon },
];

const DASHBOARD_CACHE_KEY = "dashboard_cache";

function getCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch { return null; }
}

function setCache(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

interface SimpleMetrics {
  followers: number;
  avgViews?: number | null;
}

type DashboardCache = {
  igConnected: boolean;
  ttConnected: boolean;
  ytConnected: boolean;
  fbConnected: boolean;
  igMetrics: InstagramMetrics | null;
  ttMetrics: TikTokMetrics | null;
  ytMetrics: SimpleMetrics | null;
  fbMetrics: SimpleMetrics | null;
};

function getCachedDashboard(): DashboardCache | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(DASHBOARD_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}
  return null;
}

function setCachedDashboard(data: DashboardCache) {
  try {
    localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(data));
  } catch {}
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function formatFullNumber(num: number): string {
  return num.toLocaleString();
}

export default function Dashboard() {
  // Initialize with defaults (cache loaded in useEffect to avoid hydration mismatch)
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [igMetrics, setIgMetrics] = useState<InstagramMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyDays, setHistoryDays] = useState<7 | 30>(7);
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [historySummary, setHistorySummary] = useState<HistorySummary | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [chartType, setChartType] = useState<"bar" | "net">("bar");
  const [engagementPeriod, setEngagementPeriod] = useState<"today" | "7" | "30" | "total">("30");

  // Performance table state (this week vs last week)
  const [performanceData, setPerformanceData] = useState<{
    thisWeek: { profileVisits: number; linkClicks: number };
    lastWeek: { profileVisits: number; linkClicks: number };
  } | null>(null);

  // Engagement data state (period-based)
  const [engagementData, setEngagementData] = useState<{
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  } | null>(null);
  const [engagementLoading, setEngagementLoading] = useState(false);

  // TikTok state
  const [ttMetrics, setTtMetrics] = useState<TikTokMetrics | null>(null);
  const [ttLoading, setTtLoading] = useState(false);
  const [ttHistory, setTtHistory] = useState<TikTokHistoryDay[]>([]);
  const [ttHistorySummary, setTtHistorySummary] = useState<TikTokHistorySummary | null>(null);
  const [ttHistoryLoading, setTtHistoryLoading] = useState(false);

  // YouTube state
  const [ytMetrics, setYtMetrics] = useState<SimpleMetrics | null>(null);
  const [ytHistory, setYtHistory] = useState<TikTokHistoryDay[]>([]);
  const [ytHistorySummary, setYtHistorySummary] = useState<TikTokHistorySummary | null>(null);
  const [ytHistoryLoading, setYtHistoryLoading] = useState(false);

  // Facebook state
  const [fbMetrics, setFbMetrics] = useState<SimpleMetrics | null>(null);
  const [fbHistory, setFbHistory] = useState<TikTokHistoryDay[]>([]);
  const [fbHistorySummary, setFbHistorySummary] = useState<TikTokHistorySummary | null>(null);
  const [fbHistoryLoading, setFbHistoryLoading] = useState(false);

  // Connected accounts state
  const [igConnected, setIgConnected] = useState<boolean | null>(null);
  const [ttConnected, setTtConnected] = useState<boolean | null>(null);
  const [ytConnected, setYtConnected] = useState<boolean | null>(null);
  const [fbConnected, setFbConnected] = useState<boolean | null>(null);
  const router = useRouter();

  // Load from cache on mount (client-side only to avoid hydration mismatch)
  useEffect(() => {
    const cached = getCachedDashboard();
    if (cached) {
      setIgConnected(cached.igConnected);
      setTtConnected(cached.ttConnected);
      setYtConnected(cached.ytConnected ?? false);
      setFbConnected(cached.fbConnected ?? false);
      if (cached.igMetrics) setIgMetrics(cached.igMetrics);
      if (cached.ttMetrics) setTtMetrics(cached.ttMetrics);
      if (cached.ytMetrics) setYtMetrics(cached.ytMetrics);
      if (cached.fbMetrics) setFbMetrics(cached.fbMetrics);
      if (cached.igConnected) setSelectedPlatform("instagram");
      else if (cached.ttConnected) setSelectedPlatform("tiktok");
      else if (cached.ytConnected) setSelectedPlatform("youtube");
      else if (cached.fbConnected) setSelectedPlatform("facebook");
      setLoading(false);
    }
  }, []);

  // Build connected platforms list dynamically
  const connectedPlatforms = allPlatforms.filter(p => {
    if (p.id === "instagram") return igConnected;
    if (p.id === "tiktok") return ttConnected;
    if (p.id === "youtube") return ytConnected;
    if (p.id === "facebook") return fbConnected;
    return false;
  });

  // First check which platforms are connected, then only fetch metrics for those
  useEffect(() => {
    fetch("/api/connected-platforms")
      .then((res) => res.json())
      .then(async (platforms: { instagram: boolean; tiktok: boolean; youtube: boolean; facebook: boolean }) => {
        setIgConnected(platforms.instagram);
        setTtConnected(platforms.tiktok);
        setYtConnected(platforms.youtube);
        setFbConnected(platforms.facebook);

        // Auto-select first connected platform (only if no cache existed)
        if (!getCachedDashboard()) {
          if (platforms.instagram) setSelectedPlatform("instagram");
          else if (platforms.tiktok) setSelectedPlatform("tiktok");
          else if (platforms.youtube) setSelectedPlatform("youtube");
          else if (platforms.facebook) setSelectedPlatform("facebook");
        }

        // Only fetch metrics for connected platforms
        const fetches: Promise<{ key: string; data: Record<string, unknown> }>[] = [];
        if (platforms.instagram) fetches.push(fetch("/api/metrics/instagram").then(r => r.json()).then(d => ({ key: "ig", data: d })));
        if (platforms.tiktok) fetches.push(fetch("/api/metrics/tiktok").then(r => r.json()).then(d => ({ key: "tt", data: d })));
        if (platforms.youtube) fetches.push(fetch("/api/metrics/youtube").then(r => r.json()).then(d => ({ key: "yt", data: d })));
        if (platforms.facebook) fetches.push(fetch("/api/metrics/facebook").then(r => r.json()).then(d => ({ key: "fb", data: d })));

        const results = await Promise.all(fetches);
        for (const { key, data } of results) {
          if (key === "ig" && data.metrics) setIgMetrics(data.metrics as InstagramMetrics);
          if (key === "tt" && data.metrics) setTtMetrics(data.metrics as TikTokMetrics);
          if (key === "yt" && data.metrics) setYtMetrics(data.metrics as SimpleMetrics);
          if (key === "fb" && data.metrics) setFbMetrics(data.metrics as SimpleMetrics);
        }

        setCachedDashboard({
          igConnected: platforms.instagram,
          ttConnected: platforms.tiktok,
          ytConnected: platforms.youtube,
          fbConnected: platforms.facebook,
          igMetrics: results.find(r => r.key === "ig")?.data.metrics as InstagramMetrics ?? null,
          ttMetrics: results.find(r => r.key === "tt")?.data.metrics as TikTokMetrics ?? null,
          ytMetrics: results.find(r => r.key === "yt")?.data.metrics as SimpleMetrics ?? null,
          fbMetrics: results.find(r => r.key === "fb")?.data.metrics as SimpleMetrics ?? null,
        });

        setLoading(false);
        setTtLoading(false);
      })
      .catch(() => {
        setIgConnected(false);
        setTtConnected(false);
        setYtConnected(false);
        setFbConnected(false);
        setLoading(false);
        setTtLoading(false);
      });
  }, []);


  useEffect(() => {
    if (selectedPlatform === "instagram" && igConnected) {
      const cacheKey = `ig_history_${historyDays}`;
      const cached = getCache<{ history: HistoryDay[]; summary: HistorySummary }>(cacheKey);
      if (cached) { setHistory(cached.history); setHistorySummary(cached.summary); setHistoryLoading(false); }
      else { setHistoryLoading(true); }

      fetch(`/api/metrics/instagram/history?days=${historyDays}`)
        .then((res) => res.json())
        .then((data) => {
          const historyData = data.history || [];
          const summaryData = data.summary || null;
          setHistory(historyData);
          setHistorySummary(summaryData);
          if (summaryData) setCache(cacheKey, { history: historyData, summary: summaryData });
          setHistoryLoading(false);
        })
        .catch(() => { setHistory([]); setHistorySummary(null); setHistoryLoading(false); });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform, historyDays, igConnected]);

  // Fetch 14 days for performance table (this week vs last week)
  useEffect(() => {
    if (selectedPlatform === "instagram" && igConnected) {
      const cached = getCache<{ thisWeek: { profileVisits: number; linkClicks: number }; lastWeek: { profileVisits: number; linkClicks: number } }>("ig_performance");
      if (cached) setPerformanceData(cached);

      fetch("/api/metrics/instagram/history?days=14")
        .then((res) => res.json())
        .then((data) => {
          const history14 = data.history || [];
          if (history14.length >= 7) {
            const thisWeekData = history14.slice(-7);
            const lastWeekData = history14.slice(0, Math.min(7, history14.length - 7));
            const thisWeek = {
              profileVisits: thisWeekData.reduce((sum: number, d: HistoryDay) => sum + (d.profileVisits || 0), 0),
              linkClicks: thisWeekData.reduce((sum: number, d: HistoryDay) => sum + (d.linkClicks || 0), 0),
            };
            const lastWeek = {
              profileVisits: lastWeekData.reduce((sum: number, d: HistoryDay) => sum + (d.profileVisits || 0), 0),
              linkClicks: lastWeekData.reduce((sum: number, d: HistoryDay) => sum + (d.linkClicks || 0), 0),
            };
            setPerformanceData({ thisWeek, lastWeek });
            setCache("ig_performance", { thisWeek, lastWeek });
          }
        })
        .catch(() => setPerformanceData(null));
    }
  }, [selectedPlatform, igConnected]);

  // Fetch TikTok history
  useEffect(() => {
    if (selectedPlatform === "tiktok" && ttConnected) {
      const cacheKey = `tt_history_${historyDays}`;
      const cached = getCache<{ history: TikTokHistoryDay[]; summary: TikTokHistorySummary }>(cacheKey);
      if (cached) { setTtHistory(cached.history); setTtHistorySummary(cached.summary); setTtHistoryLoading(false); }
      else { setTtHistoryLoading(true); }

      fetch(`/api/metrics/tiktok/history?days=${historyDays}`)
        .then((res) => res.json())
        .then((data) => {
          const historyData = data.history || [];
          const summaryData = data.summary || null;
          setTtHistory(historyData);
          setTtHistorySummary(summaryData);
          if (summaryData) setCache(cacheKey, { history: historyData, summary: summaryData });
          setTtHistoryLoading(false);
        })
        .catch(() => { setTtHistory([]); setTtHistorySummary(null); setTtHistoryLoading(false); });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform, historyDays, ttConnected]);

  // Fetch YouTube history
  useEffect(() => {
    if (selectedPlatform === "youtube" && ytConnected) {
      const cacheKey = `yt_history_${historyDays}`;
      const cached = getCache<{ history: TikTokHistoryDay[]; summary: TikTokHistorySummary }>(cacheKey);
      if (cached) { setYtHistory(cached.history); setYtHistorySummary(cached.summary); setYtHistoryLoading(false); }
      else { setYtHistoryLoading(true); }

      fetch(`/api/metrics/youtube/history?days=${historyDays}`)
        .then((res) => res.json())
        .then((data) => {
          const historyData = data.history || [];
          const summaryData = data.summary || null;
          setYtHistory(historyData);
          setYtHistorySummary(summaryData);
          if (summaryData) setCache(cacheKey, { history: historyData, summary: summaryData });
          setYtHistoryLoading(false);
        })
        .catch(() => { setYtHistory([]); setYtHistorySummary(null); setYtHistoryLoading(false); });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform, historyDays, ytConnected]);

  // Fetch Facebook history
  useEffect(() => {
    if (selectedPlatform === "facebook" && fbConnected) {
      const cacheKey = `fb_history_${historyDays}`;
      const cached = getCache<{ history: TikTokHistoryDay[]; summary: TikTokHistorySummary }>(cacheKey);
      if (cached) { setFbHistory(cached.history); setFbHistorySummary(cached.summary); setFbHistoryLoading(false); }
      else { setFbHistoryLoading(true); }

      fetch(`/api/metrics/facebook/history?days=${historyDays}`)
        .then((res) => res.json())
        .then((data) => {
          const historyData = data.history || [];
          const summaryData = data.summary || null;
          setFbHistory(historyData);
          setFbHistorySummary(summaryData);
          if (summaryData) setCache(cacheKey, { history: historyData, summary: summaryData });
          setFbHistoryLoading(false);
        })
        .catch(() => { setFbHistory([]); setFbHistorySummary(null); setFbHistoryLoading(false); });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform, historyDays, fbConnected]);

  // Fetch engagement data based on period
  useEffect(() => {
    if (selectedPlatform === "instagram" && igConnected) {
      if (engagementPeriod === "total") {
        if (igMetrics) {
          setEngagementData({
            likes: igMetrics.total_likes || 0,
            comments: igMetrics.total_comments || 0,
            shares: igMetrics.total_shares || 0,
            saves: igMetrics.total_saves || 0,
          });
        }
        return;
      }

      const days = engagementPeriod === "today" ? 1 : parseInt(engagementPeriod);
      const cacheKey = `ig_engagement_${days}`;
      const cached = getCache<{ likes: number; comments: number; shares: number; saves: number }>(cacheKey);
      if (cached) { setEngagementData(cached); }
      else { setEngagementLoading(true); }

      fetch(`/api/metrics/instagram/history?days=${days}`)
        .then((res) => res.json())
        .then((data) => {
          const historyData: HistoryDay[] = data.history || [];
          const aggregated = {
            likes: historyData.reduce((sum, d) => sum + (d.likes || 0), 0),
            comments: historyData.reduce((sum, d) => sum + (d.comments || 0), 0),
            shares: historyData.reduce((sum, d) => sum + (d.shares || 0), 0),
            saves: historyData.reduce((sum, d) => sum + (d.saves || 0), 0),
          };
          setEngagementData(aggregated);
          setCache(cacheKey, aggregated);
          setEngagementLoading(false);
        })
        .catch(() => { setEngagementData(null); setEngagementLoading(false); });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform, engagementPeriod, igConnected, igMetrics]);


  const isInstagram = selectedPlatform === "instagram";
  const isTikTok = selectedPlatform === "tiktok";
  const isYouTube = selectedPlatform === "youtube";
  const isFacebook = selectedPlatform === "facebook";
  const isSimplePlatform = isYouTube || isFacebook;
  const hasIgData = isInstagram && igMetrics && !loading;
  const hasTtData = isTikTok && ttMetrics && !ttLoading;
  const hasYtData = isYouTube && ytMetrics;
  const hasFbData = isFacebook && fbMetrics;

  const displayData = hasIgData
    ? {
        followers: formatFullNumber(igMetrics.followers || 0),
        engagementRate: (igMetrics.engagementRate || 0).toFixed(2) + "%",
        avgViews: formatNumber(igMetrics.avgViews || 0),
        reach: formatNumber(igMetrics.reach || 0),
        likes: igMetrics.total_likes || 0,
        comments: igMetrics.total_comments || 0,
        shares: igMetrics.total_shares || 0,
        saves: igMetrics.total_saves || 0,
      }
    : null;

  const ttDisplayData = hasTtData
    ? {
        followers: formatFullNumber(ttMetrics.followers || 0),
        engagementRate: (ttMetrics.engagementRate || 0).toFixed(2) + "%",
        avgViews: formatNumber(ttMetrics.avgViews || 0),
        likes: ttMetrics.total_likes || 0,
        comments: ttMetrics.total_comments || 0,
        shares: ttMetrics.total_shares || 0,
      }
    : null;

  const engagementBreakdown = engagementData
    ? (() => {
        const total = engagementData.likes + engagementData.comments + engagementData.shares + engagementData.saves;
        if (total === 0) return { likes: 0, comments: 0, shares: 0, saves: 0, total: 0 };
        return {
          likes: Math.round((engagementData.likes / total) * 100),
          comments: Math.round((engagementData.comments / total) * 100),
          shares: Math.round((engagementData.shares / total) * 100),
          saves: Math.round((engagementData.saves / total) * 100),
          total,
        };
      })()
    : null;

  const ttEngagementBreakdown = ttDisplayData
    ? (() => {
        const total = ttDisplayData.likes + ttDisplayData.comments + ttDisplayData.shares;
        if (total === 0) return { likes: 0, comments: 0, shares: 0 };
        return {
          likes: Math.round((ttDisplayData.likes / total) * 100),
          comments: Math.round((ttDisplayData.comments / total) * 100),
          shares: Math.round((ttDisplayData.shares / total) * 100),
        };
      })()
    : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-black">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Track your social media performance</p>
      </div>

      {/* Platform Selection */}
      <div className="flex items-center gap-6 mb-10 border-b border-neutral-100 pb-4">
        {connectedPlatforms.map((platform) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatform === platform.id;
          return (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`
                flex items-center gap-2 pb-2 -mb-[17px] border-b-2 transition-colors
                ${isSelected
                  ? "border-black text-black"
                  : "border-transparent text-neutral-400 hover:text-black"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{platform.name}</span>
            </button>
          );
        })}
        <button
          onClick={() => router.push("/social-platforms")}
          className="flex items-center gap-2 pb-2 -mb-[17px] border-b-2 border-transparent text-neutral-400 hover:text-black transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium">Add</span>
        </button>
      </div>

      {/* Loading state while checking connection status */}
      {igConnected === null && ttConnected === null && ytConnected === null && fbConnected === null && (
        <div className="py-20" />
      )}

      {/* No platforms connected state */}
      {igConnected === false && ttConnected === false && ytConnected === false && fbConnected === false && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-black mb-2">No platforms connected</h2>
          <p className="text-sm text-neutral-500 mb-6 text-center max-w-sm">
            Connect at least one social media platform to start tracking your analytics
          </p>
          <button
            onClick={() => router.push("/social-platforms")}
            className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Connect Platform
          </button>
        </div>
      )}

      {/* Dashboard content - only show when at least one platform is connected */}
      {(igConnected || ttConnected || ytConnected || fbConnected) && (
        <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard
          label={isYouTube ? "Subscribers" : "Followers"}
          value={isInstagram ? (hasIgData ? displayData?.followers ?? "-" : "-") : isTikTok ? (hasTtData ? ttDisplayData?.followers ?? "-" : "-") : isYouTube ? (hasYtData ? formatFullNumber(ytMetrics.followers) : "-") : isFacebook ? (hasFbData ? formatFullNumber(fbMetrics.followers) : "-") : "-"}
        />
        {!isSimplePlatform && (
        <StatCard
          label={isInstagram ? "Monthly Engagement" : "Engagement"}
          value={isInstagram ? (hasIgData ? displayData?.engagementRate ?? "-" : "-") : isTikTok ? (hasTtData ? ttDisplayData?.engagementRate ?? "-" : "-") : "-"}
        />
        )}
        {(!isSimplePlatform || isYouTube) && (
        <StatCard
          label="Avg. Views"
          value={isInstagram ? (hasIgData ? displayData?.avgViews ?? "-" : "-") : isTikTok ? (hasTtData ? ttDisplayData?.avgViews ?? "-" : "-") : isYouTube ? (hasYtData && ytMetrics.avgViews != null ? formatFullNumber(ytMetrics.avgViews) : "-") : "-"}
        />
        )}
{!isTikTok && !isSimplePlatform && (
          <StatCard
            label="Monthly Reach"
            value={isInstagram ? (hasIgData ? displayData?.reach ?? "-" : "-") : "-"}
          />
        )}
      </div>

      {/* Charts Row */}
      <div className={`grid ${isSimplePlatform ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"} gap-12 mb-12`}>
        {/* Follower Growth */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-medium text-black">Follower Growth</h2>
            <div className="flex items-center gap-3">
              {!isTikTok && !isSimplePlatform && (
                <select
                  className="text-xs text-neutral-500 bg-transparent focus:outline-none cursor-pointer"
                  value={chartType}
                  onChange={(e) => {
                    setChartType(e.target.value as "bar" | "net");
                    setSelectedDayIndex(null);
                  }}
                >
                  <option value="bar">Follows/Unfollows</option>
                  <option value="net">Follower Count</option>
                </select>
              )}
              <select
                className="text-xs text-neutral-500 bg-transparent focus:outline-none cursor-pointer"
                value={historyDays}
                onChange={(e) => {
                  setHistoryDays(parseInt(e.target.value) as 7 | 30);
                  setSelectedDayIndex(null);
                }}
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
          </div>
          <div className="h-40" onClick={() => setSelectedDayIndex(null)}>
            {(isInstagram && historyLoading) || (isTikTok && ttHistoryLoading) || (isYouTube && ytHistoryLoading) || (isFacebook && fbHistoryLoading) ? (
              <div className="h-full" />
            ) : (
              <FollowerGrowthChart
                data={isInstagram ? history : isTikTok ? ttHistory.map(d => ({ ...d, newFollows: 0, unfollows: 0 })) : isYouTube ? ytHistory.map(d => ({ ...d, newFollows: 0, unfollows: 0 })) : isFacebook ? fbHistory.map(d => ({ ...d, newFollows: 0, unfollows: 0 })) : []}
                days={historyDays}
                chartType={isTikTok || isSimplePlatform ? "net" : chartType}
              />
            )}
          </div>
          {(isTikTok || isSimplePlatform || chartType === "net") ? (
            <div className="flex items-center gap-8 mt-6 pt-4 border-t border-neutral-100">
              {(() => {
                const historyData = isTikTok ? ttHistory : isYouTube ? ytHistory : isFacebook ? fbHistory : history;
                const isLoading = isTikTok ? ttHistoryLoading : isYouTube ? ytHistoryLoading : isFacebook ? fbHistoryLoading : historyLoading;
                const netChange = historyData.length > 0
                  ? historyData[historyData.length - 1].followers - historyData[0].followers
                  : 0;

                return (
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Net Growth</p>
                    <p className={`text-lg font-semibold ${netChange < 0 ? "text-rose-500" : "text-emerald-600"}`}>
                      {isLoading ? "-" : (historyData.length > 0 ? `${netChange >= 0 ? "+" : ""}${netChange.toLocaleString()}` : "-")}
                    </p>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="flex items-center gap-8 mt-6 pt-4 border-t border-neutral-100">
              {(() => {
                const selectedDay = selectedDayIndex !== null ? history[selectedDayIndex] : null;
                const dayNet = selectedDay ? selectedDay.newFollows - selectedDay.unfollows : 0;
                const showingDay = isInstagram && selectedDay;

                return (
                  <>
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Follows</p>
                      <p className="text-lg font-semibold text-emerald-600">
                        {historyLoading ? "-" : (showingDay ? `+${selectedDay.newFollows.toLocaleString()}` : (historySummary ? `+${historySummary.totalNewFollows.toLocaleString()}` : "-"))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Unfollows</p>
                      <p className="text-lg font-semibold text-rose-500">
                        {historyLoading ? "-" : (showingDay ? `-${selectedDay.unfollows.toLocaleString()}` : (historySummary ? `-${historySummary.totalUnfollows.toLocaleString()}` : "-"))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Net</p>
                      <p className={`text-lg font-semibold ${(showingDay ? dayNet < 0 : (historySummary && (historySummary.totalNewFollows - historySummary.totalUnfollows) < 0)) ? "text-rose-500" : "text-emerald-600"}`}>
                        {historyLoading ? "-" : (showingDay ? `${dayNet >= 0 ? "+" : ""}${dayNet.toLocaleString()}` : (historySummary ? `${(historySummary.totalNewFollows - historySummary.totalUnfollows) >= 0 ? "+" : ""}${(historySummary.totalNewFollows - historySummary.totalUnfollows).toLocaleString()}` : "-"))}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Engagement Breakdown */}
        {!isSimplePlatform && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-medium text-black">Engagement Breakdown</h2>
            <select
              className="text-xs text-neutral-500 bg-transparent focus:outline-none cursor-pointer"
              value={engagementPeriod}
              onChange={(e) => setEngagementPeriod(e.target.value as "today" | "7" | "30" | "total")}
            >
              <option value="today">Yesterday</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="total">Total</option>
            </select>
          </div>
          <EngagementDonutChart
            likes={isInstagram ? (engagementData?.likes ?? 0) : isTikTok ? (ttDisplayData?.likes ?? 0) : 0}
            comments={isInstagram ? (engagementData?.comments ?? 0) : isTikTok ? (ttDisplayData?.comments ?? 0) : 0}
            shares={isInstagram ? (engagementData?.shares ?? 0) : isTikTok ? (ttDisplayData?.shares ?? 0) : 0}
            saves={isTikTok ? undefined : (isInstagram ? (engagementData?.saves ?? 0) : 0)}
            loading={engagementLoading}
          />
        </div>
        )}
      </div>

      {/* Performance Table - Hidden for TikTok, YouTube, Facebook */}
      {!isTikTok && !isSimplePlatform && (
        <div>
          <h2 className="text-sm font-medium text-black mb-6">Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left text-xs font-medium text-neutral-400 pb-3">Metric</th>
                  <th className="text-right text-xs font-medium text-neutral-400 pb-3">This Week</th>
                  <th className="text-right text-xs font-medium text-neutral-400 pb-3">Last Week</th>
                  <th className="text-right text-xs font-medium text-neutral-400 pb-3">Change</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const thisWeekVisits = performanceData?.thisWeek.profileVisits || 0;
                  const lastWeekVisits = performanceData?.lastWeek.profileVisits || 0;
                  const visitsChange = lastWeekVisits > 0 ? ((thisWeekVisits - lastWeekVisits) / lastWeekVisits) * 100 : 0;

                  const thisWeekClicks = performanceData?.thisWeek.linkClicks || 0;
                  const lastWeekClicks = performanceData?.lastWeek.linkClicks || 0;
                  const clicksChange = lastWeekClicks > 0 ? ((thisWeekClicks - lastWeekClicks) / lastWeekClicks) * 100 : 0;

                  const thisWeekCTR = thisWeekVisits > 0 ? (thisWeekClicks / thisWeekVisits) * 100 : 0;
                  const lastWeekCTR = lastWeekVisits > 0 ? (lastWeekClicks / lastWeekVisits) * 100 : 0;
                  const ctrChange = lastWeekCTR > 0 ? ((thisWeekCTR - lastWeekCTR) / lastWeekCTR) * 100 : 0;

                  return (
                    <>
                      <PerformanceRow
                        metric="Profile Visits"
                        thisWeek={performanceData ? formatNumber(thisWeekVisits) : "-"}
                        lastWeek={performanceData ? formatNumber(lastWeekVisits) : "-"}
                        change={performanceData && lastWeekVisits > 0 ? `${visitsChange >= 0 ? "+" : ""}${visitsChange.toFixed(1)}%` : "-"}
                        positive={visitsChange >= 0}
                      />
                      <PerformanceRow
                        metric="Link Clicks"
                        thisWeek={performanceData ? formatNumber(thisWeekClicks) : "-"}
                        lastWeek={performanceData ? formatNumber(lastWeekClicks) : "-"}
                        change={performanceData && lastWeekClicks > 0 ? `${clicksChange >= 0 ? "+" : ""}${clicksChange.toFixed(1)}%` : "-"}
                        positive={clicksChange >= 0}
                      />
                      <PerformanceRow
                        metric="Link CTR"
                        thisWeek={performanceData ? `${thisWeekCTR.toFixed(2)}%` : "-"}
                        lastWeek={performanceData ? `${lastWeekCTR.toFixed(2)}%` : "-"}
                        change={performanceData && lastWeekCTR > 0 ? `${ctrChange >= 0 ? "+" : ""}${ctrChange.toFixed(1)}%` : "-"}
                        positive={ctrChange >= 0}
                      />
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-neutral-400 mb-2">{label}</p>
      <p className="text-2xl font-semibold text-black">{value}</p>
    </div>
  );
}


function EngagementDonutChart({
  likes,
  comments,
  shares,
  saves,
  loading,
}: {
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  loading?: boolean;
}) {
  const total = likes + comments + shares + (saves ?? 0);
  const hasData = total > 0;

  const colors: Record<string, string> = {
    likes: "#4A5FD9",
    comments: "#7B8BE6",
    shares: "#A9B4EF",
    saves: "#D4DAF7",
  };

  // Cap likes at 75% visual space, remaining 25% split proportionally among other metrics
  const LIKES_MAX_PCT = 0.75;
  const rawItems = saves !== undefined
    ? [
        { type: "likes", raw: likes, fill: colors.likes },
        { type: "comments", raw: comments, fill: colors.comments },
        { type: "shares", raw: shares, fill: colors.shares },
        { type: "saves", raw: saves, fill: colors.saves },
      ]
    : [
        { type: "likes", raw: likes, fill: colors.likes },
        { type: "comments", raw: comments, fill: colors.comments },
        { type: "shares", raw: shares, fill: colors.shares },
      ];

  const chartData = (() => {
    if (!hasData) return rawItems.map(i => ({ ...i, value: i.raw }));
    const likesPct = likes / total;
    if (likesPct <= LIKES_MAX_PCT) return rawItems.map(i => ({ ...i, value: i.raw }));

    const othersTotal = total - likes;
    return rawItems.map((item) => {
      if (item.type === "likes") {
        return { ...item, value: Math.round(LIKES_MAX_PCT * total) };
      }
      const share = othersTotal > 0 ? item.raw / othersTotal : 0;
      return { ...item, value: Math.round(share * (1 - LIKES_MAX_PCT) * total) || (item.raw > 0 ? 1 : 0) };
    });
  })();

  const chartConfig: ChartConfig = {
    value: { label: "Engagement" },
    likes: { label: "Likes", color: colors.likes },
    comments: { label: "Comments", color: colors.comments },
    shares: { label: "Shares", color: colors.shares },
    saves: { label: "Saves", color: colors.saves },
  };

  if (loading) {
    return (
      <div className="h-[200px]" />
    );
  }

  return (
    <div>
      {hasData ? (
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[180px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, item) => {
                    const raw = rawItems.find(i => i.type === name);
                    return (
                      <>
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: raw?.fill || item.payload?.fill }}
                        />
                        <div className="flex flex-1 justify-between items-center leading-none gap-2">
                          <span className="text-muted-foreground capitalize">{name as string}</span>
                          <span className="text-foreground font-mono font-medium tabular-nums">
                            {raw ? formatNumber(raw.raw) : value?.toLocaleString()}
                          </span>
                        </div>
                      </>
                    );
                  }}
                />
              }
            />
            <Pie
              data={chartData.filter(d => d.value > 0)}
              dataKey="value"
              nameKey="type"
              innerRadius={50}
              outerRadius={75}
              strokeWidth={2}
              stroke="#fff"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-black text-2xl font-bold"
                        >
                          {formatNumber(total)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 18}
                          className="fill-neutral-400 text-xs"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      ) : (
        <div className="flex items-center justify-center h-[180px] text-neutral-400 text-sm">
          No engagement data
        </div>
      )}
      {hasData && (
        <div className="flex justify-center gap-4 mt-4">
          {rawItems.filter((item) => item.raw > 0).map((item) => {
            const pct = Math.round((item.raw / total) * 100);
            return (
              <div key={item.type} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: colors[item.type] }}
                />
                <span className="text-xs text-neutral-500 capitalize">{item.type}</span>
                <span className="text-xs text-neutral-400">({pct}%)</span>
              </div>
            );
          })}
        </div>
      )}
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
    <tr className="border-b border-neutral-50">
      <td className="py-4 text-sm text-black">{metric}</td>
      <td className="py-4 text-sm text-black text-right font-medium">{thisWeek}</td>
      <td className="py-4 text-sm text-neutral-400 text-right">{lastWeek}</td>
      <td className={`py-4 text-sm text-right font-medium ${positive ? "text-emerald-600" : "text-rose-500"}`}>
        {change}
      </td>
    </tr>
  );
}

function FollowerGrowthChart({ data, days, chartType }: { data: HistoryDay[]; days: number; chartType: "bar" | "net" }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
        No data available
      </div>
    );
  }

  const chartData = data.map((d) => ({
    label: days <= 14
      ? new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : new Date(d.date).getDate().toString(),
    fullDate: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    newFollows: d.newFollows,
    unfollows: d.unfollows,
    net: d.newFollows - d.unfollows,
    followers: d.followers,
    date: d.date,
  }));

  // Bar chart mode
  if (chartType === "bar") {
    const barChartConfig = {
      newFollows: {
        label: "Follows",
        color: "#10b981",
      },
      unfollows: {
        label: "Unfollows",
        color: "#ef4444",
      },
    } satisfies ChartConfig;

    return (
      <div className="w-full h-full overflow-hidden">
        <ChartContainer config={barChartConfig} className="h-[140px] w-full">
          <BarChart data={chartData} margin={{ top: 10, right: 5, left: 5, bottom: 0 }} barGap={2}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 10, fill: "#a3a3a3" }}
              interval={days === 30 ? 2 : 0}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                  labelFormatter={(value, payload) => {
                    if (days === 30 && payload?.[0]?.payload?.fullDate) {
                      return payload[0].payload.fullDate;
                    }
                    return value;
                  }}
                />
              }
            />
            <Bar dataKey="newFollows" fill="var(--color-newFollows)" radius={3} />
            <Bar dataKey="unfollows" fill="var(--color-unfollows)" radius={3} />
          </BarChart>
        </ChartContainer>
      </div>
    );
  }

  // Follower growth area chart mode using recharts
  const areaChartConfig = {
    followers: {
      label: "Followers",
      color: "#10b981",
    },
  } satisfies ChartConfig;

  const followerValues = chartData.map(d => d.followers);
  const minFollowers = Math.min(...followerValues);
  const maxFollowers = Math.max(...followerValues);
  const padding = Math.max((maxFollowers - minFollowers) * 0.15, 5);

  return (
    <div className="w-full h-full overflow-hidden">
      <ChartContainer config={areaChartConfig} className="h-[140px] w-full">
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
          <defs>
            <linearGradient id="fillFollowers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 10, fill: "#a3a3a3" }}
            interval={days === 30 ? 2 : 0}
          />
          <YAxis
            hide
            domain={[minFollowers - padding, maxFollowers + padding]}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value, payload) => {
                  if (days === 30 && payload?.[0]?.payload?.fullDate) {
                    return payload[0].payload.fullDate;
                  }
                  return value;
                }}
                formatter={(value) => (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-neutral-500">Followers</span>
                    <span className="font-medium">{Number(value).toLocaleString()}</span>
                  </div>
                )}
              />
            }
          />
          <Area
            dataKey="followers"
            type="monotone"
            fill="url(#fillFollowers)"
            stroke="#10b981"
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

// Icons
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-gradient-dash" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="25%" stopColor="#FA7E1E" />
          <stop offset="50%" stopColor="#D62976" />
          <stop offset="75%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-gradient-dash)" strokeWidth={1.5} />
      <circle cx="12" cy="12" r="4" stroke="url(#ig-gradient-dash)" strokeWidth={1.5} />
      <circle cx="18" cy="6" r="1.5" fill="url(#ig-gradient-dash)" />
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

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#FF0000">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
