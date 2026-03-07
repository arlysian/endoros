"use client";

import { useState } from "react";
import { Area, AreaChart, Label, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface MediaKitMobileUser {
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  audienceSummary?: string | null;
  email?: string | null;
  emailCta?: string | null;
  category?: string | null;
}

export interface MediaKitMobileAchievement {
  id: string;
  title: string;
  description?: string | null;
  date?: string | null;
  category?: string | null;
}

export interface MediaKitMobileCollaboration {
  id: string;
  brand: string;
  campaign?: string | null;
  date?: string | null;
  type?: string | null;
}

export interface FollowerHistoryDay {
  date: string;
  newFollows: number;
  unfollows: number;
  followers: number;
}

export interface PlatformMetricsData {
  followers?: number;
  reach?: number;
  engagementRate?: number;
  avgViews?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  profileVisits?: number;
  linkClicks?: number;
  accountsEngaged?: number;
  totalInteractions?: number;
  newFollows?: number;
  unfollows?: number;
}

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string | null;
  profileLink?: string | null;
  followers: number | null;
}

interface PlatformData {
  metrics: PlatformMetricsData | null;
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

interface EngagementHistoryDay {
  date: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

interface AccountData {
  metrics: PlatformMetricsData | null;
  followerHistory: FollowerHistoryDay[];
  followerSnapshots: FollowerSnapshot[];
  demographics: DemographicItem[];
  performanceData?: PerformanceData | null;
  engagementHistory?: EngagementHistoryDay[];
  totalEngagement?: { likes: number; comments: number; shares: number; saves: number } | null;
}

interface CreatorRate {
  id: string;
  platform: string;
  contentType: string;
  price: number;
  currency: string;
}

interface PinnedPost {
  id: string;
  igMediaId: string;
  mediaType: string;
  imageUrl: string;
  permalink: string;
  caption: string | null;
  likeCount: number | null;
  commentsCount: number | null;
  displayOrder: number;
}

interface MediaKitMobileProps {
  user: MediaKitMobileUser | null;
  achievements: MediaKitMobileAchievement[];
  collaborations: MediaKitMobileCollaboration[];
  totalFollowers?: number;
  loading?: boolean;
  compact?: boolean;
  platformDataMap?: Record<string, PlatformData>;
  accountDataMap?: Record<string, AccountData>;
  connectedAccounts?: ConnectedAccount[];
  rates?: CreatorRate[];
  pinnedPosts?: PinnedPost[];
}

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
        <linearGradient id="ig-gradient-profile" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="25%" stopColor="#FA7E1E" />
          <stop offset="50%" stopColor="#D62976" />
          <stop offset="75%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-gradient-profile)" strokeWidth={1.5} />
      <circle cx="12" cy="12" r="4" stroke="url(#ig-gradient-profile)" strokeWidth={1.5} />
      <circle cx="18" cy="6" r="1.5" fill="url(#ig-gradient-profile)" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="black">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="black">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  switch (platform) {
    case "INSTAGRAM":
      return <InstagramIcon className={className} />;
    case "TIKTOK":
      return <TikTokIcon className={className} />;
    case "TWITTER":
      return <TwitterIcon className={className} />;
    default:
      return null;
  }
}

export default function MediaKitMobile({
  user,
  achievements,
  collaborations,
  totalFollowers = 0,
  loading = false,
  compact = false,
  platformDataMap = {},
  accountDataMap = {},
  connectedAccounts = [],
  rates = [],
  pinnedPosts = [],
}: MediaKitMobileProps) {
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || user?.userName || (compact ? "Your Name" : "Creator");

  const displayUsername = user?.userName ? `@${user.userName}` : "@username";
  const displayBio = user?.bio || (compact ? "Add a bio to tell brands about yourself." : null);

  // For compact mode, use first available account
  const firstAccount = connectedAccounts[0];
  const firstAccountId = firstAccount?.id || "";

  // Compact mode for sidebar
  if (compact) {
    const compactData = accountDataMap[firstAccountId] || platformDataMap[firstAccount?.platform || "INSTAGRAM"];
    const platformMetrics = compactData?.metrics ?? null;
    const followerHistory = compactData?.followerHistory ?? [];
    return (
      <div>
        {/* Cover Image */}
        <div className="relative mb-12">
          {user?.coverImageUrl ? (
            <img
              src={user.coverImageUrl}
              alt="Cover"
              className="h-24 w-full object-cover"
            />
          ) : (
            <div className="h-24 bg-neutral-100" />
          )}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-200">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold text-black">
            {loading ? <span className="bg-neutral-100 rounded w-32 h-6 inline-block animate-pulse" /> : displayName}
          </h3>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="text-neutral-500">
              {loading ? <span className="bg-neutral-100 rounded w-20 h-4 inline-block animate-pulse" /> : displayUsername}
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-3 leading-relaxed break-words overflow-hidden">
            {loading ? (
              <span className="bg-neutral-100 rounded w-full h-12 inline-block animate-pulse" />
            ) : displayBio}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <p className="text-xl font-semibold text-black">{platformMetrics?.followers ? formatNumber(platformMetrics.followers) : "-"}</p>
            <p className="text-xs text-neutral-400">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-black">
              {platformMetrics?.engagementRate ? `${platformMetrics.engagementRate}%` : "-"}
            </p>
            <p className="text-xs text-neutral-400">{firstAccount?.platform === "INSTAGRAM" ? "Monthly Engagement" : "Engagement"}</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-black">
              {platformMetrics?.avgViews ? formatNumber(platformMetrics.avgViews) : "-"}
            </p>
            <p className="text-xs text-neutral-400">Avg. Views</p>
          </div>
        </div>

        {/* Portfolio - Compact */}
        {pinnedPosts.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Portfolio</h4>
            <div className="grid grid-cols-2 gap-0.5">
              {pinnedPosts.map((post) => (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden aspect-square"
                >
                  <img src={post.imageUrl} alt={post.caption || "Instagram post"} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end">
                    <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                      <div className="flex gap-3 text-white text-xs">
                        <span>{post.likeCount ?? 0} likes</span>
                        <span>{post.commentsCount ?? 0} comments</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Brand Collaborations */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Brand Collaborations</h4>
          {collaborations.length > 0 ? (
            <div className="space-y-1.5">
              {collaborations.map((collab) => (
                <div key={collab.id} className="flex items-start gap-2">
                  <span className="text-neutral-300 mt-0.5 text-xs">—</span>
                  <div>
                    <p className="font-medium text-black text-sm">{collab.brand}</p>
                    {collab.campaign && (
                      <p className="text-xs text-neutral-500 mt-0.5">{collab.campaign}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">No collaborations yet</p>
          )}
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Achievements</h4>
          {achievements.length > 0 ? (
            <div className="space-y-1.5">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-2">
                  <span className="text-neutral-300 mt-0.5 text-xs">—</span>
                  <p className="text-sm font-medium text-black">{achievement.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">No achievements yet</p>
          )}
        </div>

        {/* Follower Growth - Compact */}
        {(() => {
          const hasHistory = followerHistory.length > 0;
          const totalNewFollows = followerHistory.reduce((sum, d) => sum + d.newFollows, 0);
          const totalUnfollows = followerHistory.reduce((sum, d) => sum + d.unfollows, 0);
          const netGrowth = totalNewFollows - totalUnfollows;
          const maxValue = Math.max(...followerHistory.map(d => Math.max(d.newFollows, d.unfollows)), 1);

          return (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-black pb-1 border-b border-black/10">Follower Growth</h4>
                <span className="text-[10px] text-neutral-400">7 days</span>
              </div>
              <div className="flex items-end gap-2 h-16 pt-1 mb-3">
                {hasHistory ? (
                  followerHistory.map((day, i) => {
                    const followsHeight = (day.newFollows / maxValue) * 56;
                    const unfollowsHeight = (day.unfollows / maxValue) * 56;
                    return (
                      <div key={i} className="flex-1 flex gap-0.5 items-end justify-center">
                        <div
                          className="w-[45%] bg-emerald-500 rounded-t-sm"
                          style={{ height: `${Math.max(followsHeight, day.newFollows > 0 ? 2 : 0)}px` }}
                        />
                        <div
                          className="w-[45%] bg-red-500 rounded-t-sm"
                          style={{ height: `${Math.max(unfollowsHeight, day.unfollows > 0 ? 2 : 0)}px` }}
                        />
                      </div>
                    );
                  })
                ) : (
                  Array(7).fill(0).map((_, i) => (
                    <div key={i} className="flex-1 flex gap-0.5 items-end justify-center">
                      <div className="w-[45%] bg-neutral-100 rounded-t-sm h-2" />
                      <div className="w-[45%] bg-neutral-100 rounded-t-sm h-2" />
                    </div>
                  ))
                )}
              </div>
              <div className="flex items-center gap-6 pt-3 border-t border-neutral-100">
                <div>
                  <p className="text-[10px] text-neutral-400">New</p>
                  <p className="text-sm font-semibold text-emerald-600">
                    {hasHistory ? `+${formatNumber(totalNewFollows)}` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400">Net</p>
                  <p className={`text-sm font-semibold ${netGrowth >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {hasHistory ? `${netGrowth >= 0 ? "+" : ""}${formatNumber(netGrowth)}` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400">Lost</p>
                  <p className="text-sm font-semibold text-rose-500">
                    {hasHistory ? `-${formatNumber(totalUnfollows)}` : "-"}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Engagement - Compact */}
        {(() => {
          const likes = platformMetrics?.likes || 0;
          const comments = platformMetrics?.comments || 0;
          const shares = platformMetrics?.shares || 0;
          const saves = platformMetrics?.saves || 0;
          const total = likes + comments + shares + saves;
          const hasData = total > 0;

          const engagementData = [
            { label: "Likes", value: likes },
            { label: "Comments", value: comments },
            { label: "Shares", value: shares },
            { label: "Saves", value: saves },
          ].map(item => ({
            ...item,
            pct: hasData ? Math.round((item.value / total) * 100) : 0,
          }));

          return (
            <div>
              <h4 className="text-sm font-medium text-black mb-3 pb-1 border-b border-black/10">Engagement</h4>
              <div className="space-y-3">
                {engagementData.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-black">{item.label}</span>
                      <span className="text-neutral-400">{hasData ? `${item.pct}%` : "-"}</span>
                    </div>
                    <div className="h-1 bg-neutral-100 rounded-full">
                      <div
                        className="h-full bg-black rounded-full"
                        style={{ width: hasData ? `${item.pct}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // Filter platforms for display (exclude Facebook and YouTube)
  const displayAccounts = connectedAccounts.filter(
    acc => acc.platform !== "FACEBOOK" && acc.platform !== "YOUTUBE"
  );

  // State for selected account
  const defaultAccount = displayAccounts.find(a => a.platform === "INSTAGRAM") || displayAccounts[0];
  const [selectedAccountId, setSelectedAccountId] = useState<string>(defaultAccount?.id || "");
  const [growthDays, setGrowthDays] = useState<7 | 30>(7);
  const [growthChartType, setGrowthChartType] = useState<"bar" | "total">("bar");
  const [engagementDays, setEngagementDays] = useState<"1" | "7" | "30" | "total">("7");

  const selectedAccount = displayAccounts.find(a => a.id === selectedAccountId);
  const selectedPlatform = selectedAccount?.platform || "INSTAGRAM";
  const accountData = accountDataMap[selectedAccountId];
  const platformMetrics = accountData?.metrics ?? platformDataMap[selectedPlatform]?.metrics ?? null;
  const allFollowerHistory = accountData?.followerHistory ?? platformDataMap[selectedPlatform]?.followerHistory ?? [];
  const allFollowerSnapshots = accountData?.followerSnapshots ?? [];
  const demographics = accountData?.demographics ?? [];
  const engagementHistory = accountData?.engagementHistory ?? [];
  const totalEngagement = accountData?.totalEngagement ?? null;

  const followerHistory = allFollowerHistory.slice(-growthDays);
  const followerSnapshots = allFollowerSnapshots.slice(-growthDays);

  // Full mode for public profile
  return (
    <>
      {/* Profile Picture - No Cover Image */}
      <div className="pt-16 pb-4 flex justify-center">
        <div className="w-28 h-28 rounded-full overflow-hidden bg-neutral-100">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 flex-1 flex flex-col">
        {/* Profile Info */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-black">{displayName}</h1>
          <p className="text-neutral-500 mt-1">@{user?.userName}</p>
          {displayBio && (
            <p className="text-base text-neutral-600 mt-4 leading-relaxed break-words overflow-hidden">{displayBio}</p>
          )}

          {/* Location & Category */}
          {(user?.location || user?.category) && (
            <div className="flex items-center justify-center gap-3 mt-3 text-sm text-neutral-500">
              {user?.location && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {user.location}
                </div>
              )}
              {user?.location && user?.category && (
                <span className="text-neutral-300">·</span>
              )}
              {user?.category && (
                <span>{user.category}</span>
              )}
            </div>
          )}

          {/* Social Icons Row */}
          {(user?.website || displayAccounts.length > 0) && (
            <div className="flex items-center justify-center gap-3 mt-4">
              {user?.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-black transition-colors"
                  title={user.website.replace(/^https?:\/\//, "")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </a>
              )}
              {displayAccounts.map((account) => (
                account.profileLink ? (
                  <a
                    key={account.id}
                    href={account.profileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-black transition-colors"
                    title={`${account.platform.charAt(0) + account.platform.slice(1).toLowerCase()}${account.username ? ` · @${account.username}` : ""}`}
                  >
                    <PlatformIcon platform={account.platform} className="w-5 h-5" />
                  </a>
                ) : (
                  <span key={account.id} className="text-neutral-300">
                    <PlatformIcon platform={account.platform} className="w-5 h-5" />
                  </span>
                )
              ))}
            </div>
          )}

          {/* Contact CTA */}
          {(user?.emailCta || user?.email) && (
            <div className="mt-4">
              <a
                href={`mailto:${user.emailCta || user.email}`}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Me
              </a>
            </div>
          )}
        </div>

        {/* Portfolio */}
        {pinnedPosts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-3">Portfolio</h2>
            <div className="grid grid-cols-2 gap-0.5">
              {pinnedPosts.map((post) => (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden aspect-square"
                >
                  <img src={post.imageUrl} alt={post.caption || "Instagram post"} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end">
                    <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                      <div className="flex gap-3 text-white text-xs">
                        <span>{post.likeCount ?? 0} likes</span>
                        <span>{post.commentsCount ?? 0} comments</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Brand Collaborations */}
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

        {/* Platform Selector */}
        {displayAccounts.length > 0 && (
          <div className="flex items-center justify-center gap-6 mb-6 border-b border-neutral-100">
            {displayAccounts.map((account) => {
              const isSelected = selectedAccountId === account.id;
              return (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccountId(account.id)}
                  className={`flex items-center gap-2 pb-3 border-b-2 -mb-[1px] transition-colors ${
                    isSelected
                      ? "border-black text-black"
                      : "border-transparent text-neutral-400 hover:text-black"
                  }`}
                >
                  <PlatformIcon platform={account.platform} className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {account.username || account.platform.charAt(0) + account.platform.slice(1).toLowerCase()}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Key Stats for Brands */}
        <div className="grid grid-cols-2 gap-3 mb-10 pb-8 border-b border-neutral-100">
          <div className="text-center bg-neutral-50 rounded-xl p-4 border border-neutral-100 hover:shadow-md transition-shadow">
            <p className="text-2xl font-semibold text-black">{platformMetrics?.followers ? formatNumber(platformMetrics.followers) : "-"}</p>
            <p className="text-xs text-neutral-400 mt-1">Followers</p>
          </div>
          <div className="text-center bg-neutral-50 rounded-xl p-4 border border-neutral-100 hover:shadow-md transition-shadow">
            <p className="text-2xl font-semibold text-black">
              {platformMetrics?.engagementRate ? `${platformMetrics.engagementRate}%` : "-"}
            </p>
            <p className="text-xs text-neutral-400 mt-1">{selectedAccount?.platform === "INSTAGRAM" ? "Monthly Engagement" : "Engagement"}</p>
          </div>
          <div className="text-center bg-neutral-50 rounded-xl p-4 border border-neutral-100 hover:shadow-md transition-shadow">
            <p className="text-2xl font-semibold text-black">
              {platformMetrics?.avgViews ? formatNumber(platformMetrics.avgViews) : "-"}
            </p>
            <p className="text-xs text-neutral-400 mt-1">Avg. Views</p>
          </div>
          <div className="text-center bg-neutral-50 rounded-xl p-4 border border-neutral-100 hover:shadow-md transition-shadow">
            <p className="text-2xl font-semibold text-black">
              {platformMetrics?.reach ? formatNumber(platformMetrics.reach) : "-"}
            </p>
            <p className="text-xs text-neutral-400 mt-1">Monthly Reach</p>
          </div>
        </div>

        {/* Follower Growth */}
        {(() => {
          const hasHistory = followerHistory.length > 0;
          const hasSnapshots = followerSnapshots.length > 0;
          const totalNewFollows = followerHistory.reduce((sum, d) => sum + d.newFollows, 0);
          const totalUnfollows = followerHistory.reduce((sum, d) => sum + d.unfollows, 0);
          const netGrowth = totalNewFollows - totalUnfollows;
          const maxValue = Math.max(...followerHistory.map(d => Math.max(d.newFollows, d.unfollows)), 1);

          return (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-black ">Follower Growth</h3>
                <div className="flex items-center gap-2">
                  {hasHistory && (
                    <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
                      <button
                        onClick={() => setGrowthChartType("bar")}
                        className={`px-2 py-1 text-[10px] rounded-md transition-colors ${growthChartType === "bar" ? "bg-white text-black shadow-sm font-medium" : "text-neutral-500 hover:text-black"}`}
                      >
                        +/-
                      </button>
                      <button
                        onClick={() => setGrowthChartType("total")}
                        className={`px-2 py-1 text-[10px] rounded-md transition-colors ${growthChartType === "total" ? "bg-white text-black shadow-sm font-medium" : "text-neutral-500 hover:text-black"}`}
                      >
                        Total
                      </button>
                    </div>
                  )}
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
              </div>

              {/* IG: follows/unfollows bar chart */}
              {hasHistory && growthChartType === "bar" && (
                <>
                  <div className={`flex items-end ${growthDays === 30 ? "gap-0.5" : "gap-3"} h-24 pt-2 mb-2`}>
                    {followerHistory.map((day, i) => {
                      const followsHeight = (day.newFollows / maxValue) * 80;
                      const unfollowsHeight = (day.unfollows / maxValue) * 80;
                      return (
                        <div key={i} className="flex-1 flex gap-px items-end justify-center">
                          <div
                            className="w-[45%] bg-emerald-500 rounded-t-sm"
                            style={{ height: `${Math.max(followsHeight, day.newFollows > 0 ? 2 : 0)}px` }}
                            title={`+${day.newFollows.toLocaleString()} follows`}
                          />
                          <div
                            className="w-[45%] bg-red-500 rounded-t-sm"
                            style={{ height: `${Math.max(unfollowsHeight, day.unfollows > 0 ? 2 : 0)}px` }}
                            title={`-${day.unfollows.toLocaleString()} unfollows`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mb-5">
                    {followerHistory.map((day, i) => {
                      const date = new Date(day.date);
                      const dateLabel = growthDays <= 14
                        ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : date.getDate().toString();
                      const show = growthDays === 30 ? i % 3 === 0 : true;
                      return <span key={i} className="flex-1 text-center text-[10px] text-neutral-400">{show ? dateLabel : ""}</span>;
                    })}
                  </div>
                  <div className="flex items-center gap-8 pt-4 border-t border-neutral-100">
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Follows</p>
                      <p className="text-lg font-semibold text-emerald-600">+{totalNewFollows.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Net</p>
                      <p className={`text-lg font-semibold ${netGrowth >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                        {netGrowth >= 0 ? "+" : ""}{netGrowth.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Unfollows</p>
                      <p className="text-lg font-semibold text-rose-500">-{totalUnfollows.toLocaleString()}</p>
                    </div>
                  </div>
                </>
              )}

              {/* IG: total follower growth area chart */}
              {hasHistory && growthChartType === "total" && (() => {
                const snapshotData = followerHistory.map(d => ({ date: d.date, followers: d.followers }));
                const followerValues = snapshotData.map(d => d.followers);
                const minF = Math.min(...followerValues);
                const maxF = Math.max(...followerValues);
                const padding = Math.max((maxF - minF) * 0.15, 5);
                const first = snapshotData[0]?.followers || 0;
                const last = snapshotData[snapshotData.length - 1]?.followers || 0;
                const change = last - first;

                const areaData = snapshotData.map(d => ({
                  label: growthDays <= 14
                    ? new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : new Date(d.date).getDate().toString(),
                  fullDate: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                  followers: d.followers,
                }));

                return (
                  <>
                    <ChartContainer
                      config={{ followers: { label: "Followers", color: "#10b981" } }}
                      className="h-[120px] w-full"
                    >
                      <AreaChart data={areaData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="fillFollowersMobileTotal" x1="0" y1="0" x2="0" y2="1">
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
                        <YAxis hide domain={[minF - padding, maxF + padding]} />
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
                          fill="url(#fillFollowersMobileTotal)"
                          stroke="#10b981"
                          strokeWidth={2}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ChartContainer>
                    <div className="flex items-center gap-8 pt-4 border-t border-neutral-100">
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

              {/* TikTok/other: follower snapshot area chart */}
              {!hasHistory && hasSnapshots && (() => {
                const first = followerSnapshots[0].followers;
                const last = followerSnapshots[followerSnapshots.length - 1].followers;
                const change = last - first;
                const snapshotMax = Math.max(...followerSnapshots.map(s => s.followers));
                const snapshotMin = Math.min(...followerSnapshots.map(s => s.followers));
                const padding = Math.max(Math.round((snapshotMax - snapshotMin) * 0.1), 1);

                const chartData = followerSnapshots.map(s => ({
                  date: growthDays <= 14
                    ? new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : new Date(s.date).getDate().toString(),
                  fullDate: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                  followers: s.followers,
                }));

                const snapshotConfig = {
                  followers: { label: "Followers", color: "#10b981" },
                } satisfies ChartConfig;

                return (
                  <>
                    <ChartContainer config={snapshotConfig} className="h-[120px] w-full mb-2">
                      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                        <defs>
                          <linearGradient id="fillFollowersMobile" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 10, fill: "#a3a3a3" }}
                          padding={{ left: 10, right: 10 }}
                          interval={growthDays === 30 ? 2 : 0}
                        />
                        <YAxis
                          hide
                          domain={[snapshotMin - padding, snapshotMax + padding]}
                        />
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
                          type="monotone"
                          dataKey="followers"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill="url(#fillFollowersMobile)"
                          dot={false}
                        />
                      </AreaChart>
                    </ChartContainer>
                    <div className="flex items-center gap-8 pt-4 border-t border-neutral-100">
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
              {!hasHistory && !hasSnapshots && (
                <div className="flex items-center justify-center h-24 text-neutral-400 text-sm">
                  No data available
                </div>
              )}
            </div>
          );
        })()}

        {/* Engagement Breakdown */}
        {(() => {
          const isIG = selectedAccount?.platform === "INSTAGRAM";
          const hasEngHistory = engagementHistory.length > 0;

          let likes: number, comments: number, shares: number, saves: number;
          if (isIG && engagementDays === "total" && totalEngagement) {
            likes = totalEngagement.likes;
            comments = totalEngagement.comments;
            shares = totalEngagement.shares;
            saves = totalEngagement.saves;
          } else if (isIG && hasEngHistory && engagementDays !== "total") {
            const sliceCount = engagementDays === "1" ? 1 : engagementDays === "7" ? 7 : 30;
            const sliced = engagementHistory.slice(-sliceCount);
            likes = sliced.reduce((s, d) => s + d.likes, 0);
            comments = sliced.reduce((s, d) => s + d.comments, 0);
            shares = sliced.reduce((s, d) => s + d.shares, 0);
            saves = sliced.reduce((s, d) => s + d.saves, 0);
          } else {
            likes = platformMetrics?.likes || 0;
            comments = platformMetrics?.comments || 0;
            shares = platformMetrics?.shares || 0;
            saves = platformMetrics?.saves || 0;
          }
          const total = likes + comments + shares + saves;
          const hasData = total > 0;

          const colors: Record<string, string> = {
            likes: "#4A5FD9",
            comments: "#7B8BE6",
            shares: "#A9B4EF",
            saves: "#D4DAF7",
          };

          // Cap likes at 75% visual space, remaining 25% split proportionally among other metrics
          const LIKES_MAX_PCT = 0.75;
          const rawItems = [
            { type: "likes", raw: likes, fill: colors.likes },
            { type: "comments", raw: comments, fill: colors.comments },
            { type: "shares", raw: shares, fill: colors.shares },
            { type: "saves", raw: saves, fill: colors.saves },
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

          return (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5 ">
                <h3 className="text-base font-semibold text-black">Engagement</h3>
                {isIG && (
                  <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
                    {(["1", "7", "30", "total"] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setEngagementDays(period)}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${engagementDays === period ? "bg-white text-black shadow-sm font-medium" : "text-neutral-500 hover:text-black"}`}
                      >
                        {period === "total" ? "Total" : `${period}d`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {hasData ? (
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
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
                      outerRadius={80}
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
                                  y={(viewBox.cy || 0) + 20}
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
                <div className="flex items-center justify-center h-[200px] text-neutral-400 text-sm">
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
        })()}

        {/* Performance Table - Instagram only */}
        {selectedPlatform === "INSTAGRAM" && accountData?.performanceData && (() => {
          const perf = accountData.performanceData;
          const thisVisits = perf.thisWeek.profileVisits;
          const lastVisits = perf.lastWeek.profileVisits;
          const visitsChange = lastVisits > 0 ? ((thisVisits - lastVisits) / lastVisits) * 100 : 0;

          const thisClicks = perf.thisWeek.linkClicks;
          const lastClicks = perf.lastWeek.linkClicks;
          const clicksChange = lastClicks > 0 ? ((thisClicks - lastClicks) / lastClicks) * 100 : 0;

          const thisCTR = thisVisits > 0 ? (thisClicks / thisVisits) * 100 : 0;
          const lastCTR = lastVisits > 0 ? (lastClicks / lastVisits) * 100 : 0;
          const ctrChange = lastCTR > 0 ? ((thisCTR - lastCTR) / lastCTR) * 100 : 0;

          return (
            <div className="mb-8">
              <h3 className="text-base font-semibold text-black mb-4 ">Performance</h3>
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
                  <tr className="border-b border-neutral-50">
                    <td className="py-3 text-sm text-black">Profile Visits</td>
                    <td className="py-3 text-sm text-black text-right font-medium">{formatNumber(thisVisits)}</td>
                    <td className="py-3 text-sm text-neutral-400 text-right">{formatNumber(lastVisits)}</td>
                    <td className={`py-3 text-sm text-right font-medium ${visitsChange >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {lastVisits > 0 ? `${visitsChange >= 0 ? "+" : ""}${visitsChange.toFixed(1)}%` : "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-50">
                    <td className="py-3 text-sm text-black">Link Clicks</td>
                    <td className="py-3 text-sm text-black text-right font-medium">{formatNumber(thisClicks)}</td>
                    <td className="py-3 text-sm text-neutral-400 text-right">{formatNumber(lastClicks)}</td>
                    <td className={`py-3 text-sm text-right font-medium ${clicksChange >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {lastClicks > 0 ? `${clicksChange >= 0 ? "+" : ""}${clicksChange.toFixed(1)}%` : "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-50">
                    <td className="py-3 text-sm text-black">Link CTR</td>
                    <td className="py-3 text-sm text-black text-right font-medium">{`${thisCTR.toFixed(2)}%`}</td>
                    <td className="py-3 text-sm text-neutral-400 text-right">{`${lastCTR.toFixed(2)}%`}</td>
                    <td className={`py-3 text-sm text-right font-medium ${ctrChange >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {lastCTR > 0 ? `${ctrChange >= 0 ? "+" : ""}${ctrChange.toFixed(1)}%` : "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })()}

        {/* Audience Summary + Demographics */}
        {(user?.audienceSummary || demographics.length > 0) && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-black mb-3 ">Audience</h2>
            {user?.audienceSummary && (
              <p className="text-sm text-neutral-500 leading-relaxed mb-5">{user.audienceSummary}</p>
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
                <div className="space-y-5">
                  {/* Gender - Donut Chart */}
                  {genderTotal > 0 && (
                    <div>
                      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Gender</p>
                      <ChartContainer config={genderChartConfig} className="mx-auto aspect-square max-h-[160px]">
                        <PieChart>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Pie
                            data={genderChartData}
                            dataKey="value"
                            nameKey="gender"
                            innerRadius={40}
                            outerRadius={65}
                            strokeWidth={2}
                            stroke="#fff"
                          >
                            <Label
                              content={({ viewBox }) => {
                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                  return (
                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-black text-xl font-bold">
                                        {genderTotal.toLocaleString()}
                                      </tspan>
                                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 18} className="fill-neutral-400 text-[10px]">
                                        followers
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
                      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Age</p>
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
                      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Top Countries</p>
                      <div className="space-y-1.5">
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

        {/* Footer */}
        <div className="text-center pt-6 border-t border-neutral-100 mt-auto">
          <p className="text-xs text-neutral-400">Powered by Endoros</p>
        </div>
      </div>
    </>
  );
}
