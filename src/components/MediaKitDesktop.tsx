"use client";

import { useState } from "react";

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

interface MediaKitDesktopProps {
  user: User;
  achievements: Achievement[];
  collaborations: Collaboration[];
  connectedAccounts: ConnectedAccount[];
  platformMetrics: PlatformMetrics | null;
  followerHistory: FollowerHistoryDay[];
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

const platformIcons: Record<string, React.ReactNode> = {
  INSTAGRAM: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  YOUTUBE: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  TIKTOK: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  ),
  TWITTER: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
};

export default function MediaKitDesktop({
  user,
  achievements,
  collaborations,
  connectedAccounts,
  platformMetrics,
  followerHistory,
}: MediaKitDesktopProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    connectedAccounts.find(a => a.platform === "INSTAGRAM")?.platform ||
    connectedAccounts[0]?.platform ||
    "INSTAGRAM"
  );

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || user?.userName || "Creator";

  const totalFollowers = connectedAccounts.reduce((sum, acc) => sum + (acc.followers || 0), 0);

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
              <div className="w-32 h-32 rounded-full overflow-hidden bg-neutral-100">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
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
              <p className="text-sm text-neutral-600 leading-relaxed mb-6">
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

            {/* Collaborations */}
            {collaborations.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-medium text-black mb-4">Collaborations</h2>
                <div className="space-y-3">
                  {collaborations.slice(0, 5).map((collab) => (
                    <div key={collab.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs font-medium">
                        {collab.brand.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-black text-sm truncate">{collab.brand}</p>
                        {collab.campaign && (
                          <p className="text-xs text-neutral-500 truncate">{collab.campaign}</p>
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
                <h2 className="text-sm font-medium text-black mb-4">Achievements</h2>
                <div className="flex flex-wrap gap-2">
                  {achievements.map((achievement) => (
                    <span
                      key={achievement.id}
                      className="px-3 py-1.5 bg-black text-white text-xs rounded-full"
                    >
                      {achievement.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats */}
          <div className="flex-1">
            {/* Platform Selector */}
            <div className="flex items-center gap-2 mb-8">
              {connectedAccounts.map((account) => (
                <div key={account.id} className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedPlatform(account.platform)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPlatform === account.platform
                        ? "bg-black text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {platformIcons[account.platform]}
                    <span>{account.platform.charAt(0) + account.platform.slice(1).toLowerCase()}</span>
                    {account.followers && (
                      <span className="text-xs opacity-70">{formatNumber(account.followers)}</span>
                    )}
                  </button>
                  {account.profileLink && (
                    <a
                      href={account.profileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-black transition-colors"
                      title={`View ${account.platform.toLowerCase()} profile`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  )}
                </div>
              ))}
              {connectedAccounts.length === 0 && (
                <div className="text-sm text-neutral-400">No platforms connected</div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-8">
              {/* Overview Stats */}
              <div>
                <h3 className="text-sm font-medium text-black mb-4">Overview</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-2xl font-semibold text-black">
                      {platformMetrics?.reach ? formatNumber(platformMetrics.reach) : "-"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">Reach</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-black">
                      {platformMetrics?.avgViews ? formatNumber(platformMetrics.avgViews) : "-"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">Avg. Views</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-black">
                      {platformMetrics?.profileVisits ? formatNumber(platformMetrics.profileVisits) : "-"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">Profile Visits</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-black">
                      {platformMetrics?.accountsEngaged ? formatNumber(platformMetrics.accountsEngaged) : "-"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">Engaged</p>
                  </div>
                </div>
              </div>

              {/* Engagement Breakdown */}
              <div>
                <h3 className="text-sm font-medium text-black mb-4">Engagement</h3>
                <div className="space-y-3">
                  {engagementData.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-black">{item.label}</span>
                        <span className="text-neutral-400">
                          {hasEngagementData ? `${formatNumber(item.value)} (${item.pct}%)` : "-"}
                        </span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 rounded-full">
                        <div
                          className="h-full bg-black rounded-full transition-all"
                          style={{ width: hasEngagementData ? `${item.pct}%` : "0%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-neutral-100">
                  <span className="text-xs text-neutral-400">Total</span>
                  <span className="text-lg font-semibold text-black">
                    {hasEngagementData ? formatNumber(engagementTotal) : "-"}
                  </span>
                </div>
              </div>

              {/* Follower Growth - Full Width */}
              <div className="col-span-2 pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-medium text-black">Follower Growth</h3>
                  <span className="text-xs text-neutral-400">Last 7 days</span>
                </div>
                <div className="flex items-end gap-4 h-32 pt-2 mb-2">
                  {hasHistory ? (
                    followerHistory.map((day, i) => {
                      const followsHeight = (day.newFollows / maxValue) * 112;
                      const unfollowsHeight = (day.unfollows / maxValue) * 112;
                      return (
                        <div key={i} className="flex-1 flex gap-1 items-end justify-center">
                          <div
                            className="w-[45%] bg-emerald-500 rounded-sm transition-all"
                            style={{ height: `${Math.max(followsHeight, day.newFollows > 0 ? 4 : 0)}px` }}
                            title={`+${day.newFollows.toLocaleString()} follows`}
                          />
                          <div
                            className="w-[45%] bg-rose-400 rounded-sm transition-all"
                            style={{ height: `${Math.max(unfollowsHeight, day.unfollows > 0 ? 4 : 0)}px` }}
                            title={`-${day.unfollows.toLocaleString()} unfollows`}
                          />
                        </div>
                      );
                    })
                  ) : (
                    Array(7).fill(0).map((_, i) => (
                      <div key={i} className="flex-1 flex gap-1 items-end justify-center">
                        <div className="w-[45%] bg-neutral-100 rounded-sm h-4" />
                        <div className="w-[45%] bg-neutral-100 rounded-sm h-4" />
                      </div>
                    ))
                  )}
                </div>
                <div className="flex justify-between mb-5">
                  {hasHistory ? (
                    followerHistory.map((day, i) => {
                      const date = new Date(day.date);
                      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                      return <span key={i} className="flex-1 text-center text-xs text-neutral-400">{dayName}</span>;
                    })
                  ) : (
                    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <span key={d} className="flex-1 text-center text-xs text-neutral-400">{d}</span>
                    ))
                  )}
                </div>
                <div className="flex items-center gap-12 pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                    <div>
                      <p className="text-xs text-neutral-400">Follows</p>
                      <p className="text-lg font-semibold text-emerald-600">
                        {hasHistory ? `+${totalNewFollows.toLocaleString()}` : "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Net</p>
                    <p className={`text-lg font-semibold ${netGrowth >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {hasHistory ? `${netGrowth >= 0 ? "+" : ""}${netGrowth.toLocaleString()}` : "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-rose-400" />
                    <div>
                      <p className="text-xs text-neutral-400">Unfollows</p>
                      <p className="text-lg font-semibold text-rose-500">
                        {hasHistory ? `-${totalUnfollows.toLocaleString()}` : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audience Summary */}
              {user.audienceSummary && (
                <div className="col-span-2 pt-4 border-t border-neutral-100">
                  <h3 className="text-sm font-medium text-black mb-3">Audience</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{user.audienceSummary}</p>
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
