"use client";

import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, Pie, PieChart, Label } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface User {
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  audienceSummary?: string | null;
  category?: string | null;
}

interface Achievement {
  id: string;
  title: string;
  description?: string | null;
  date?: string | null;
}

interface Collaboration {
  id: string;
  brand: string;
  campaign?: string | null;
  date?: string | null;
  type?: string | null;
}

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string | null;
  profileLink?: string | null;
  followers: number | null;
  isPrimary: boolean | null;
}

interface PlatformMetrics {
  followers?: number;
  reach?: number;
  engagementRate?: number;
  avgViews?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  profileVisits?: number;
  accountsEngaged?: number;
  totalInteractions?: number;
  newFollows?: number;
  unfollows?: number;
}

interface FollowerHistoryDay {
  date: string;
  newFollows: number;
  unfollows: number;
}

interface PlatformData {
  metrics: PlatformMetrics | null;
  followerHistory: FollowerHistoryDay[];
}

interface DemographicItem {
  type: string;
  label: string;
  value: number;
}

interface FollowerSnapshot {
  date: string;
  followers: number;
}

interface PerformanceData {
  thisWeek: { profileVisits: number; linkClicks: number };
  lastWeek: { profileVisits: number; linkClicks: number };
}

interface AccountData {
  metrics: PlatformMetrics | null;
  followerHistory: FollowerHistoryDay[];
  followerSnapshots: FollowerSnapshot[];
  demographics: DemographicItem[];
  performanceData?: PerformanceData | null;
}

interface CreatorRate {
  id: string;
  platform: string;
  contentType: string;
  price: number;
  currency: string;
}

interface MediaKitDesktopProps {
  user: User;
  achievements: Achievement[];
  collaborations: Collaboration[];
  connectedAccounts: ConnectedAccount[];
  accountDataMap: Record<string, AccountData>;
  rates: CreatorRate[];
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-gradient-media" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="25%" stopColor="#FA7E1E" />
          <stop offset="50%" stopColor="#D62976" />
          <stop offset="75%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-gradient-media)" strokeWidth={1.5} />
      <circle cx="12" cy="12" r="4" stroke="url(#ig-gradient-media)" strokeWidth={1.5} />
      <circle cx="18" cy="6" r="1.5" fill="url(#ig-gradient-media)" />
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

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

const platformIcons: Record<string, (props: { className?: string }) => React.ReactNode> = {
  INSTAGRAM: InstagramIcon,
  TIKTOK: TikTokIcon,
  TWITTER: TwitterIcon,
};

const countryNames: Record<string, string> = {
  AF: "Afghanistan", AL: "Albania", DZ: "Algeria", AO: "Angola", AR: "Argentina",
  AU: "Australia", AT: "Austria", BD: "Bangladesh", BE: "Belgium", BR: "Brazil",
  CA: "Canada", CL: "Chile", CN: "China", CO: "Colombia", CR: "Costa Rica",
  CI: "Ivory Coast", CM: "Cameroon", CZ: "Czechia", DE: "Germany", DK: "Denmark",
  DO: "Dominican Republic", EC: "Ecuador", EG: "Egypt", ES: "Spain", FI: "Finland",
  FR: "France", GB: "United Kingdom", GH: "Ghana", GR: "Greece", GT: "Guatemala",
  HK: "Hong Kong", HU: "Hungary", ID: "Indonesia", IE: "Ireland", IL: "Israel",
  IN: "India", IQ: "Iraq", IR: "Iran", IT: "Italy", JM: "Jamaica",
  JO: "Jordan", JP: "Japan", KE: "Kenya", KR: "South Korea", KW: "Kuwait",
  LB: "Lebanon", LY: "Libya", MA: "Morocco", MG: "Madagascar", MN: "Mongolia",
  MX: "Mexico", MY: "Malaysia", MZ: "Mozambique", NG: "Nigeria", NL: "Netherlands",
  NO: "Norway", NZ: "New Zealand", PA: "Panama", PE: "Peru", PH: "Philippines",
  PK: "Pakistan", PL: "Poland", PS: "Palestine", PT: "Portugal", RO: "Romania",
  RU: "Russia", SA: "Saudi Arabia", SD: "Sudan", SE: "Sweden", SG: "Singapore",
  SN: "Senegal", SY: "Syria", TH: "Thailand", TJ: "Tajikistan", TN: "Tunisia",
  TR: "Turkey", TW: "Taiwan", TZ: "Tanzania", UA: "Ukraine", AE: "UAE",
  US: "United States", UZ: "Uzbekistan", VE: "Venezuela", VN: "Vietnam",
  ZA: "South Africa", ZW: "Zimbabwe",
};

export default function MediaKitDesktop({
  user,
  achievements,
  collaborations,
  connectedAccounts,
  accountDataMap,
  rates,
}: MediaKitDesktopProps) {
  const defaultAccount = connectedAccounts.find(a => a.platform === "INSTAGRAM") || connectedAccounts[0];
  const [selectedAccountId, setSelectedAccountId] = useState<string>(defaultAccount?.id || "");
  const [growthDays, setGrowthDays] = useState<7 | 30>(7);

  const selectedAccount = connectedAccounts.find(a => a.id === selectedAccountId);
  const accountData = accountDataMap[selectedAccountId];
  const platformMetrics = accountData?.metrics ?? null;
  const allFollowerHistory = accountData?.followerHistory ?? [];
  const allFollowerSnapshots = accountData?.followerSnapshots ?? [];
  const demographics = accountData?.demographics ?? [];

  const followerHistory = allFollowerHistory.slice(-growthDays);
  const followerSnapshots = allFollowerSnapshots.slice(-growthDays);

  const performanceData = accountData?.performanceData ?? null;

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || user?.userName || "Creator";

  // Filter out Facebook and YouTube from display
  const displayAccounts = connectedAccounts.filter(
    acc => acc.platform !== "FACEBOOK" && acc.platform !== "YOUTUBE"
  );

  const hasHistory = followerHistory.length > 0;
  const totalNewFollows = followerHistory.reduce((sum, d) => sum + d.newFollows, 0);
  const totalUnfollows = followerHistory.reduce((sum, d) => sum + d.unfollows, 0);
  const netGrowth = totalNewFollows - totalUnfollows;
  const maxValue = Math.max(...followerHistory.map(d => Math.max(d.newFollows, d.unfollows)), 1);

  const likes = platformMetrics?.likes || 0;
  const comments = platformMetrics?.comments || 0;
  const shares = platformMetrics?.shares || 0;
  const saves = platformMetrics?.saves || 0;
  const engagementTotal = likes + comments + shares + saves;
  const hasEngagementData = engagementTotal > 0;

  const engagementData = [
    { label: "Likes", value: likes },
    { label: "Comments", value: comments },
    { label: "Shares", value: shares },
    { label: "Saves", value: saves },
  ].map(item => ({
    ...item,
    pct: hasEngagementData ? Math.round((item.value / engagementTotal) * 100) : 0,
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex gap-12">
          {/* Left Column - Profile Info */}
          <div className="w-80 flex-shrink-0">
            {/* Profile Picture */}
            <div className="mb-6">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-neutral-100">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>

              {/* Name & Username */}
            <div className="mb-4">
              <h1 className="text-2xl font-semibold text-black">{displayName}</h1>
              <p className="text-neutral-500 mt-1">@{user.userName}</p>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-neutral-600 leading-relaxed mb-6 break-words overflow-hidden">
                {user.bio}
              </p>
            )}

            {/* Location & Website */}
            {(user.location || user.website) && (
              <div className="mb-6 space-y-2">
                {user.location && (
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {user.location}
                  </div>
                )}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-black hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {user.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            )}

            {/* Rates */}
            {rates.length > 0 && (() => {
              const grouped = rates.reduce<Record<string, CreatorRate[]>>((acc, rate) => {
                (acc[rate.platform] ??= []).push(rate);
                return acc;
              }, {});
              const platformLabel: Record<string, string> = {
                INSTAGRAM: "Instagram",
                TIKTOK: "TikTok",
                TWITTER: "X / Twitter",
                YOUTUBE: "YouTube",
                FACEBOOK: "Facebook",
              };
              const formatCurrency = (price: number, currency: string) =>
                new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);

              return (
                <div className="mb-6">
                  <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-3">Rates</h2>
                  <div className="space-y-3">
                    {Object.entries(grouped).map(([platform, items]) => (
                      <div key={platform}>
                        <p className="text-xs font-medium text-neutral-500 mb-1">{platformLabel[platform] || platform}</p>
                        <div className="space-y-1">
                          {items.map((rate) => (
                            <div key={rate.id} className="flex items-center justify-between">
                              <span className="text-sm text-neutral-600">{rate.contentType}</span>
                              <span className="text-sm font-medium text-black">{formatCurrency(rate.price, rate.currency)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-3">Achievements</h2>
                <div className="space-y-2">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-2">
                      <span className="text-neutral-300 mt-0.5">—</span>
                      <div>
                        <p className="text-sm font-medium text-black">{achievement.title}</p>
                        {achievement.date && (
                          <p className="text-xs text-neutral-400 mt-0.5">{achievement.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collaborations */}
            {collaborations.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-3">Brand Collaborations</h2>
                <div className="space-y-2">
                  {collaborations.map((collab) => (
                    <div key={collab.id} className="flex items-start gap-2">
                      <span className="text-neutral-300 mt-0.5">—</span>
                      <div>
                        <p className="text-sm font-medium text-black">
                          {collab.brand}
                          {collab.campaign && <span className="font-normal text-neutral-500"> · {collab.campaign}</span>}
                        </p>
                        {(collab.type || collab.date) && (
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {collab.type}{collab.type && collab.date && " · "}{collab.date}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats */}
          <div className="flex-1">
            {/* Platform Selector */}
            <div className="flex items-center gap-6 mb-10 border-b border-neutral-100 pb-4">
              {displayAccounts.map((account) => {
                const isSelected = selectedAccountId === account.id;
                const Icon = platformIcons[account.platform];
                return (
                <div key={account.id} className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedAccountId(account.id)}
                    className={`flex items-center gap-2 pb-2 -mb-[17px] border-b-2 transition-colors ${
                      isSelected
                        ? "border-black text-black"
                        : "border-transparent text-neutral-400 hover:text-black"
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                      {account.username || account.platform.charAt(0) + account.platform.slice(1).toLowerCase()}
                    </span>
                  </button>
                  {account.profileLink && (
                    <a
                      href={account.profileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 -mb-[17px] pb-2 text-neutral-400 hover:text-black transition-colors"
                      title={`View ${account.platform.toLowerCase()} profile`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  )}
                </div>
              );
              })}
              {displayAccounts.length === 0 && (
                <div className="text-sm text-neutral-400">No platforms connected</div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-8">
              {/* Key Stats for Brands */}
              <div>
                <h3 className="text-base font-semibold text-black mb-4 pb-2 border-b-2 border-black/10">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 hover:shadow-md transition-shadow">
                    <p className="text-2xl font-semibold text-black">
                      {platformMetrics?.followers ? formatNumber(platformMetrics.followers) : "-"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">Followers</p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 hover:shadow-md transition-shadow">
                    <p className="text-2xl font-semibold text-black">
                      {platformMetrics?.engagementRate ? `${platformMetrics.engagementRate}%` : "-"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">{selectedAccount?.platform === "INSTAGRAM" ? "Monthly Engagement" : "Engagement Rate"}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 hover:shadow-md transition-shadow">
                    <p className="text-2xl font-semibold text-black">
                      {platformMetrics?.avgViews ? formatNumber(platformMetrics.avgViews) : "-"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">Avg. Views</p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 hover:shadow-md transition-shadow">
                    <p className="text-2xl font-semibold text-black">
                      {platformMetrics?.reach ? formatNumber(platformMetrics.reach) : "-"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">Monthly Reach</p>
                  </div>
                </div>
              </div>

              {/* Engagement Breakdown */}
              <div>
                <h3 className="text-base font-semibold text-black mb-4 pb-2 border-b-2 border-black/10">Engagement</h3>
                {hasEngagementData ? (
                  <>
                    <ChartContainer
                      config={{
                        value: { label: "Engagement" },
                        likes: { label: "Likes", color: "#4A5FD9" },
                        comments: { label: "Comments", color: "#7B8BE6" },
                        shares: { label: "Shares", color: "#A9B4EF" },
                        saves: { label: "Saves", color: "#D4DAF7" },
                      }}
                      className="mx-auto aspect-square max-h-[180px]"
                    >
                      <PieChart>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                          data={[
                            { type: "likes", value: likes, fill: "#4A5FD9" },
                            { type: "comments", value: comments, fill: "#7B8BE6" },
                            { type: "shares", value: shares, fill: "#A9B4EF" },
                            { type: "saves", value: saves, fill: "#D4DAF7" },
                          ]}
                          dataKey="value"
                          nameKey="type"
                          innerRadius={45}
                          outerRadius={70}
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
                                      className="fill-black text-xl font-bold"
                                    >
                                      {formatNumber(engagementTotal)}
                                    </tspan>
                                    <tspan
                                      x={viewBox.cx}
                                      y={(viewBox.cy || 0) + 18}
                                      className="fill-neutral-400 text-[10px]"
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
                    <div className="flex justify-center gap-3 mt-3">
                      {[
                        { type: "Likes", color: "#4A5FD9" },
                        { type: "Comments", color: "#7B8BE6" },
                        { type: "Shares", color: "#A9B4EF" },
                        { type: "Saves", color: "#D4DAF7" },
                      ].map((item) => (
                        <div key={item.type} className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-[10px] text-neutral-500">{item.type}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[180px] text-neutral-400 text-sm">
                    No engagement data
                  </div>
                )}
              </div>

              {/* Follower Growth - Full Width */}
              <div className="col-span-2 pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-medium text-black">Follower Growth</h3>
                  <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setGrowthDays(7)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors ${growthDays === 7 ? "bg-white text-black shadow-sm font-medium" : "text-neutral-500 hover:text-black"}`}
                    >
                      7d
                    </button>
                    <button
                      onClick={() => setGrowthDays(30)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors ${growthDays === 30 ? "bg-white text-black shadow-sm font-medium" : "text-neutral-500 hover:text-black"}`}
                    >
                      30d
                    </button>
                  </div>
                </div>

                {/* IG: follows/unfollows breakdown chart */}
                {hasHistory && (
                  <>
                    <div className="h-40">
                      <FollowerGrowthChart data={followerHistory} growthDays={growthDays} />
                    </div>
                    <div className="flex items-center gap-8 mt-6 pt-4 border-t border-neutral-100">
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Follows</p>
                        <p className="text-lg font-semibold text-emerald-600">+{totalNewFollows.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Unfollows</p>
                        <p className="text-lg font-semibold text-rose-500">-{totalUnfollows.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Net</p>
                        <p className={`text-lg font-semibold ${netGrowth >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                          {netGrowth >= 0 ? "+" : ""}{netGrowth.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* TikTok/other: follower snapshot chart */}
                {!hasHistory && followerSnapshots.length > 0 && (() => {
                  const first = followerSnapshots[0].followers;
                  const last = followerSnapshots[followerSnapshots.length - 1].followers;
                  const change = last - first;
                  return (
                    <>
                      <div className="h-40">
                        <FollowerSnapshotChart data={followerSnapshots} growthDays={growthDays} />
                      </div>
                      <div className="flex items-center gap-8 mt-6 pt-4 border-t border-neutral-100">
                        <div>
                          <p className="text-xs text-neutral-400 mb-1">Net Growth</p>
                          <p className={`text-lg font-semibold ${change >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                            {change >= 0 ? "+" : ""}{change.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* No data */}
                {!hasHistory && followerSnapshots.length === 0 && (
                  <div className="flex items-center justify-center h-40 text-neutral-400 text-sm">
                    No data available
                  </div>
                )}
              </div>

              {/* Performance Table - Instagram only */}
              {selectedAccount?.platform === "INSTAGRAM" && performanceData && (
                <div className="col-span-2 pt-4 border-t border-neutral-100">
                  <h3 className="text-base font-semibold text-black mb-4 pb-2 border-b-2 border-black/10">Performance</h3>
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
                          const thisVisits = performanceData.thisWeek.profileVisits;
                          const lastVisits = performanceData.lastWeek.profileVisits;
                          const visitsChange = lastVisits > 0 ? ((thisVisits - lastVisits) / lastVisits) * 100 : 0;

                          const thisClicks = performanceData.thisWeek.linkClicks;
                          const lastClicks = performanceData.lastWeek.linkClicks;
                          const clicksChange = lastClicks > 0 ? ((thisClicks - lastClicks) / lastClicks) * 100 : 0;

                          const thisCTR = thisVisits > 0 ? (thisClicks / thisVisits) * 100 : 0;
                          const lastCTR = lastVisits > 0 ? (lastClicks / lastVisits) * 100 : 0;
                          const ctrChange = lastCTR > 0 ? ((thisCTR - lastCTR) / lastCTR) * 100 : 0;

                          return (
                            <>
                              <PerformanceRow metric="Profile Visits" thisWeek={formatNumber(thisVisits)} lastWeek={formatNumber(lastVisits)} change={lastVisits > 0 ? `${visitsChange >= 0 ? "+" : ""}${visitsChange.toFixed(1)}%` : "-"} positive={visitsChange >= 0} />
                              <PerformanceRow metric="Link Clicks" thisWeek={formatNumber(thisClicks)} lastWeek={formatNumber(lastClicks)} change={lastClicks > 0 ? `${clicksChange >= 0 ? "+" : ""}${clicksChange.toFixed(1)}%` : "-"} positive={clicksChange >= 0} />
                              <PerformanceRow metric="Link CTR" thisWeek={`${thisCTR.toFixed(2)}%`} lastWeek={`${lastCTR.toFixed(2)}%`} change={lastCTR > 0 ? `${ctrChange >= 0 ? "+" : ""}${ctrChange.toFixed(1)}%` : "-"} positive={ctrChange >= 0} />
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Audience Summary + Demographics */}
              {(user.audienceSummary || demographics.length > 0) && (
                <div className="col-span-2 pt-4 border-t border-neutral-100">
                  <h3 className="text-base font-semibold text-black mb-3 pb-2 border-b-2 border-black/10">Audience</h3>
                  {user.audienceSummary && (
                    <p className="text-sm text-neutral-600 leading-relaxed mb-6">{user.audienceSummary}</p>
                  )}
                  {demographics.length > 0 && (() => {
                    const genderData = demographics.filter(d => d.type === "gender");
                    const ageData = demographics.filter(d => d.type === "age");
                    const countryData = demographics.filter(d => d.type === "country").sort((a, b) => b.value - a.value).slice(0, 5);
                    const genderTotal = genderData.reduce((s, d) => s + d.value, 0);
                    const ageTotal = ageData.reduce((s, d) => s + d.value, 0);
                    const countryTotal = countryData.reduce((s, d) => s + d.value, 0);
                    const genderLabels: Record<string, string> = { M: "Male", F: "Female", U: "Other" };
                    const genderColors: Record<string, string> = { M: "#4A5FD9", F: "#E05C97", U: "#9CA3AF" };

                    const genderChartConfig: ChartConfig = {
                      M: { label: "Male", color: "#4A5FD9" },
                      F: { label: "Female", color: "#E05C97" },
                      U: { label: "Other", color: "#9CA3AF" },
                    };

                    const genderChartData = genderData.map(g => ({
                      gender: g.label,
                      value: g.value,
                      fill: genderColors[g.label] || "#9CA3AF",
                    }));

                    return (
                      <div className="grid grid-cols-3 gap-8">
                        {/* Gender - Donut Chart */}
                        {genderTotal > 0 && (
                          <div>
                            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">Gender</p>
                            <ChartContainer config={genderChartConfig} className="mx-auto aspect-square max-h-[140px]">
                              <PieChart>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie
                                  data={genderChartData}
                                  dataKey="value"
                                  nameKey="gender"
                                  innerRadius={35}
                                  outerRadius={55}
                                  strokeWidth={2}
                                  stroke="#fff"
                                >
                                  <Label
                                    content={({ viewBox }) => {
                                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-black text-lg font-bold">
                                              {genderTotal.toLocaleString()}
                                            </tspan>
                                          </text>
                                        );
                                      }
                                    }}
                                  />
                                </Pie>
                              </PieChart>
                            </ChartContainer>
                            <div className="flex justify-center gap-3 mt-2">
                              {genderChartData.map(g => {
                                const pct = Math.round((g.value / genderTotal) * 100);
                                return (
                                  <div key={g.gender} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: genderColors[g.gender] || "#9CA3AF" }} />
                                    <span className="text-xs text-neutral-500">{genderLabels[g.gender] || g.gender} ({pct}%)</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Age */}
                        {ageTotal > 0 && (
                          <div>
                            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">Age</p>
                            <div className="space-y-2">
                              {ageData.map(a => {
                                const pct = Math.round((a.value / ageTotal) * 100);
                                return (
                                  <div key={a.label} className="flex items-center gap-2">
                                    <span className="text-xs text-neutral-500 w-12">{a.label}</span>
                                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-xs text-neutral-400 w-8 text-right">{pct}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Top Countries */}
                        {countryData.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">Top Countries</p>
                            <div className="space-y-2">
                              {countryData.map(c => {
                                const pct = countryTotal > 0 ? Math.round((c.value / countryTotal) * 100) : 0;
                                return (
                                  <div key={c.label} className="flex items-center justify-between">
                                    <span className="text-xs text-neutral-600">{countryNames[c.label] || c.label}</span>
                                    <span className="text-xs text-neutral-400">{pct}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-neutral-100">
          <p className="text-xs text-neutral-400">Powered by endoros</p>
        </div>
      </div>
    </div>
  );
}

function FollowerGrowthChart({ data, growthDays }: { data: FollowerHistoryDay[]; growthDays: 7 | 30 }) {
  const chartData = data.map((d) => ({
    label: growthDays <= 14
      ? new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : new Date(d.date).getDate().toString(),
    fullDate: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    newFollows: d.newFollows,
    unfollows: d.unfollows,
  }));

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
            interval={growthDays === 30 ? 2 : 0}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="dashed"
                labelFormatter={(value, payload) => {
                  if (growthDays === 30 && payload?.[0]?.payload?.fullDate) {
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

function FollowerSnapshotChart({ data, growthDays }: { data: { date: string; followers: number }[]; growthDays: 7 | 30 }) {
  const chartData = data.map((d) => ({
    label: growthDays <= 14
      ? new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : new Date(d.date).getDate().toString(),
    fullDate: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    followers: d.followers,
  }));

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
            <linearGradient id="fillFollowersPublic" x1="0" y1="0" x2="0" y2="1">
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
            interval={growthDays === 30 ? 2 : 0}
          />
          <YAxis hide domain={[minFollowers - padding, maxFollowers + padding]} />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value, payload) => {
                  if (growthDays === 30 && payload?.[0]?.payload?.fullDate) {
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
            fill="url(#fillFollowersPublic)"
            stroke="#10b981"
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
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
