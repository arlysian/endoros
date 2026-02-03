"use client";

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

interface ProfileCardProps {
  user: ProfileCardUser | null;
  achievements: ProfileCardAchievement[];
  collaborations: ProfileCardCollaboration[];
  totalFollowers?: number;
  loading?: boolean;
  compact?: boolean;
  platformMetrics?: PlatformMetricsData | null;
  followerHistory?: FollowerHistoryDay[];
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

export default function ProfileCard({
  user,
  achievements,
  collaborations,
  totalFollowers = 0,
  loading = false,
  compact = false,
  platformMetrics = null,
  followerHistory = [],
}: ProfileCardProps) {
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || user?.userName || (compact ? "Your Name" : "Creator");

  const displayUsername = user?.userName ? `@${user.userName}` : "@username";
  const displayBio = user?.bio || (compact ? "Add a bio to tell brands about yourself." : null);

  // Compact mode for sidebar
  if (compact) {
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
          <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
            {loading ? (
              <span className="bg-neutral-100 rounded w-full h-12 inline-block animate-pulse" />
            ) : displayBio}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <p className="text-xl font-semibold text-black">{formatNumber(totalFollowers) || "-"}</p>
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
          <h4 className="text-sm font-medium text-black mb-3 pb-1 border-b border-black/10">Achievements</h4>
          {achievements.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {achievements.map((achievement) => (
                <span
                  key={achievement.id}
                  className="px-3 py-1.5 bg-black text-white text-xs rounded-full shadow-sm hover:scale-105 transition-transform cursor-default"
                >
                  {achievement.title}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">No achievements yet</p>
          )}
        </div>

        {/* Brand Collaborations */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-black mb-3 pb-1 border-b border-black/10">Collaborations</h4>
          {collaborations.length > 0 ? (
            <div className="space-y-2">
              {collaborations.map((collab) => (
                <div key={collab.id} className="border-b border-neutral-100 pb-2 last:border-0">
                  <p className="font-medium text-black text-sm">{collab.brand}</p>
                  {collab.campaign && (
                    <p className="text-xs text-neutral-500 mt-0.5">{collab.campaign}</p>
                  )}
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

  // Full mode for public profile
  return (
    <>
      {/* Cover Image with Profile Picture */}
      <div className="relative pb-20">
        {user?.coverImageUrl ? (
          <img
            src={user.coverImageUrl}
            alt="Cover"
            className="h-36 w-full object-cover"
          />
        ) : (
          <div className="h-36 bg-neutral-100" />
        )}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0">
          <div className="w-36 h-36 rounded-full overflow-hidden bg-neutral-200 border-4 border-white">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 flex-1 flex flex-col">
        {/* Profile Info */}
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-black mt-3">{displayName}</h1>
          <p className="text-neutral-500 mt-1">@{user?.userName}</p>
          {displayBio && (
            <p className="text-sm text-neutral-500 mt-4 leading-relaxed">{displayBio}</p>
          )}
        </div>

        {/* Key Stats for Brands */}
        <div className="grid grid-cols-2 gap-3 mb-10 pb-8 border-b border-neutral-100">
          <div className="text-center bg-neutral-50 rounded-xl p-4 border border-neutral-100 hover:shadow-md transition-shadow">
            <p className="text-2xl font-semibold text-black">{formatNumber(totalFollowers)}</p>
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

        {/* Audience Summary */}
        {user?.audienceSummary && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-black mb-3 pb-2 border-b-2 border-black/10">Audience</h2>
            <p className="text-sm text-neutral-500 leading-relaxed">{user.audienceSummary}</p>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-black mb-3 pb-2 border-b-2 border-black/10">Achievements</h2>
            <div className="flex flex-wrap gap-2">
              {achievements.map((achievement) => (
                <span
                  key={achievement.id}
                  className="px-3 py-1.5 bg-black text-white text-xs rounded-full shadow-sm hover:scale-105 transition-transform cursor-default"
                >
                  {achievement.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Brand Collaborations */}
        {collaborations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-black mb-3 pb-2 border-b-2 border-black/10">Collaborations</h2>
            <div className="grid grid-cols-2 gap-4">
              {collaborations.map((collab) => (
                <div key={collab.id} className="border-b border-neutral-100 pb-3">
                  <p className="font-medium text-black text-sm">{collab.brand}</p>
                  {collab.campaign && (
                    <p className="text-xs text-neutral-500 mt-1">{collab.campaign}</p>
                  )}
                  {(collab.type || collab.date) && (
                    <p className="text-[10px] text-neutral-400 mt-2">
                      {collab.type}{collab.type && collab.date && " · "}{collab.date}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follower Growth */}
        {(() => {
          const hasHistory = followerHistory.length > 0;
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
              <div className="flex items-end gap-3 h-24 pt-2 mb-2">
                {hasHistory ? (
                  followerHistory.map((day, i) => {
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
              <div className="flex justify-between mb-5">
                {hasHistory ? (
                  followerHistory.map((day, i) => {
                    const date = new Date(day.date);
                    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                    return <span key={i} className="flex-1 text-center text-[10px] text-neutral-400">{dayName}</span>;
                  })
                ) : (
                  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <span key={d} className="flex-1 text-center text-[10px] text-neutral-400">{d}</span>
                  ))
                )}
              </div>
              <div className="flex items-center gap-8 pt-4 border-t border-neutral-100">
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Follows</p>
                  <p className="text-lg font-semibold text-emerald-600">
                    {hasHistory ? `+${totalNewFollows.toLocaleString()}` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Net</p>
                  <p className={`text-lg font-semibold ${netGrowth >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {hasHistory ? `${netGrowth >= 0 ? "+" : ""}${netGrowth.toLocaleString()}` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Unfollows</p>
                  <p className="text-lg font-semibold text-rose-500">
                    {hasHistory ? `-${totalUnfollows.toLocaleString()}` : "-"}
                  </p>
                </div>
              </div>
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
            <div className="mb-8">
              <h3 className="text-base font-semibold text-black mb-5 pb-2 border-b-2 border-black/10">Engagement</h3>
              <div className="space-y-4">
                {engagementData.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-black">{item.label}</span>
                      <span className="text-sm text-neutral-400">
                        {hasData ? `${formatNumber(item.value)} (${item.pct}%)` : "-"}
                      </span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 rounded-full">
                      <div
                        className="h-full bg-black rounded-full"
                        style={{ width: hasData ? `${item.pct}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 mt-5 border-t border-neutral-100">
                <span className="text-xs text-neutral-400">Total</span>
                <span className="text-lg font-semibold text-black">
                  {hasData ? formatNumber(total) : "-"}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Contact */}
        {(user?.location || user?.website) && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-black mb-3 pb-2 border-b-2 border-black/10">Contact</h2>
            <div className="space-y-2 text-sm">
              {user.location && (
                <p className="text-neutral-500">{user.location}</p>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline"
                >
                  {user.website}
                </a>
              )}
            </div>
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
