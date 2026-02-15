"use client";

import { useState } from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface ProfileCardUser {
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  audienceSummary?: string | null;
}

export interface ProfileCardAchievement {
  id: string;
  title: string;
  description?: string | null;
  date?: string | null;
  category?: string | null;
}

export interface ProfileCardCollaboration {
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

interface AccountData {
  metrics: PlatformMetricsData | null;
  followerHistory: FollowerHistoryDay[];
  followerSnapshots: FollowerSnapshot[];
  demographics: DemographicItem[];
}

interface ProfileCardProps {
  user: ProfileCardUser | null;
  achievements: ProfileCardAchievement[];
  collaborations: ProfileCardCollaboration[];
  totalFollowers?: number;
  loading?: boolean;
  compact?: boolean;
  platformDataMap?: Record<string, PlatformData>;
  accountDataMap?: Record<string, AccountData>;
  connectedAccounts?: ConnectedAccount[];
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

export default function ProfileCard({
  user,
  achievements,
  collaborations,
  totalFollowers = 0,
  loading = false,
  compact = false,
  platformDataMap = {},
  accountDataMap = {},
  connectedAccounts = [],
}: ProfileCardProps) {
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
            <p className="text-xs text-neutral-400">Engagement</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-black">
              {platformMetrics?.avgViews ? formatNumber(platformMetrics.avgViews) : "-"}
            </p>
            <p className="text-xs text-neutral-400">Avg. Views</p>
          </div>
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
                          className="w-[45%] bg-rose-400 rounded-t-sm"
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

  const selectedAccount = displayAccounts.find(a => a.id === selectedAccountId);
  const selectedPlatform = selectedAccount?.platform || "INSTAGRAM";
  const accountData = accountDataMap[selectedAccountId];
  const platformMetrics = accountData?.metrics ?? platformDataMap[selectedPlatform]?.metrics ?? null;
  const followerHistory = accountData?.followerHistory ?? platformDataMap[selectedPlatform]?.followerHistory ?? [];
  const followerSnapshots = accountData?.followerSnapshots ?? [];
  const demographics = accountData?.demographics ?? [];

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

          {/* Location */}
          {user?.location && (
            <div className="flex items-center justify-center gap-1.5 mt-3 text-sm text-neutral-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {user.location}
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
        </div>

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
            <p className="text-xs text-neutral-400 mt-1">Engagement</p>
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
            <p className="text-xs text-neutral-400 mt-1">Reach</p>
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
                <h3 className="text-base font-semibold text-black pb-2 border-b-2 border-black/10">Follower Growth</h3>
                <span className="text-xs text-neutral-400">Last 7 days</span>
              </div>

              {/* IG: follows/unfollows breakdown */}
              {hasHistory && (
                <>
                  <div className="flex items-end gap-3 h-24 pt-2 mb-2">
                    {followerHistory.map((day, i) => {
                      const followsHeight = (day.newFollows / maxValue) * 80;
                      const unfollowsHeight = (day.unfollows / maxValue) * 80;
                      return (
                        <div key={i} className="flex-1 flex gap-0.5 items-end justify-center">
                          <div
                            className="w-[45%] bg-emerald-500 rounded-t-sm"
                            style={{ height: `${Math.max(followsHeight, day.newFollows > 0 ? 2 : 0)}px` }}
                            title={`+${day.newFollows.toLocaleString()} follows`}
                          />
                          <div
                            className="w-[45%] bg-rose-400 rounded-t-sm"
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
                      const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      return <span key={i} className="flex-1 text-center text-[10px] text-neutral-400">{dateLabel}</span>;
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

              {/* TikTok/other: follower snapshot line */}
              {!hasHistory && hasSnapshots && (() => {
                const first = followerSnapshots[0].followers;
                const last = followerSnapshots[followerSnapshots.length - 1].followers;
                const change = last - first;
                const snapshotMax = Math.max(...followerSnapshots.map(s => s.followers));
                const snapshotMin = Math.min(...followerSnapshots.map(s => s.followers));
                const range = snapshotMax - snapshotMin || 1;

                return (
                  <>
                    <div className="flex items-end gap-3 h-24 pt-2 mb-2">
                      {followerSnapshots.map((snap, i) => {
                        const height = ((snap.followers - snapshotMin) / range) * 70 + 10;
                        return (
                          <div key={i} className="flex-1 flex items-end justify-center">
                            <div
                              className="w-full bg-black rounded-t-sm max-w-[20px]"
                              style={{ height: `${height}px` }}
                              title={`${snap.followers.toLocaleString()} followers`}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mb-5">
                      {followerSnapshots.map((snap, i) => {
                        const date = new Date(snap.date);
                        const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        return <span key={i} className="flex-1 text-center text-[10px] text-neutral-400">{dateLabel}</span>;
                      })}
                    </div>
                    <div className="flex items-center gap-8 pt-4 border-t border-neutral-100">
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Current</p>
                        <p className="text-lg font-semibold text-black">{formatNumber(last)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 mb-1">Change</p>
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
          const likes = platformMetrics?.likes || 0;
          const comments = platformMetrics?.comments || 0;
          const shares = platformMetrics?.shares || 0;
          const saves = platformMetrics?.saves || 0;
          const total = likes + comments + shares + saves;
          const hasData = total > 0;

          const colors: Record<string, string> = {
            likes: "#4A5FD9",
            comments: "#7B8BE6",
            shares: "#A9B4EF",
            saves: "#D4DAF7",
          };

          const chartData = [
            { type: "likes", value: likes, fill: colors.likes },
            { type: "comments", value: comments, fill: colors.comments },
            { type: "shares", value: shares, fill: colors.shares },
            { type: "saves", value: saves, fill: colors.saves },
          ];

          const chartConfig: ChartConfig = {
            value: { label: "Engagement" },
            likes: { label: "Likes", color: colors.likes },
            comments: { label: "Comments", color: colors.comments },
            shares: { label: "Shares", color: colors.shares },
            saves: { label: "Saves", color: colors.saves },
          };

          return (
            <div className="mb-8">
              <h3 className="text-base font-semibold text-black mb-5 pb-2 border-b-2 border-black/10">Engagement</h3>
              {hasData ? (
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={chartData}
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
                  {chartData.map((item) => (
                    <div key={item.type} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: colors[item.type] }}
                      />
                      <span className="text-xs text-neutral-500 capitalize">{item.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Audience Summary + Demographics */}
        {(user?.audienceSummary || demographics.length > 0) && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-black mb-3 pb-2 border-b-2 border-black/10">Audience</h2>
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
