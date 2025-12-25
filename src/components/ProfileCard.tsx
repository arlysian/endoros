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

interface ProfileCardProps {
  user: ProfileCardUser | null;
  achievements: ProfileCardAchievement[];
  collaborations: ProfileCardCollaboration[];
  totalFollowers?: number;
  loading?: boolean;
  compact?: boolean; // For sidebar preview
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
              className="h-24 w-full object-cover rounded-xl"
            />
          ) : (
            <div className="h-24 bg-gray-200 rounded-xl" />
          )}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-16 h-16 rounded-full shadow-md overflow-hidden bg-gray-300">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
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
          <h3 className="text-xl font-semibold text-[#1f2937]">
            {loading ? <span className="bg-gray-200 rounded w-32 h-6 inline-block animate-pulse" /> : displayName}
          </h3>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="text-[#6b7280]">
              {loading ? <span className="bg-gray-200 rounded w-20 h-4 inline-block animate-pulse" /> : displayUsername}
            </span>
            {!loading && user?.userName && (
              <svg className="w-4 h-4 text-[#2596be]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            )}
          </div>
          <p className="text-sm text-[#6b7280] mt-3 leading-relaxed">
            {loading ? (
              <span className="bg-gray-200 rounded w-full h-12 inline-block animate-pulse" />
            ) : displayBio}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="border border-gray-200 rounded-xl p-3 bg-white text-center">
            <p className="text-lg font-semibold text-[#1f2937]">{formatNumber(totalFollowers) || "-"}</p>
            <p className="text-xs text-[#9ca3af]">Followers</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-3 bg-white text-center">
            <p className="text-lg font-semibold text-[#1f2937]">-</p>
            <p className="text-xs text-[#9ca3af]">Engagement</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-3 bg-white text-center">
            <p className="text-lg font-semibold text-[#1f2937]">-</p>
            <p className="text-xs text-[#9ca3af]">Avg. Views</p>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <h4 className="font-semibold text-[#1f2937] mb-3">Achievements & Highlights</h4>
          {achievements.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1f2937] text-white text-sm rounded-full"
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  <span>{achievement.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6b7280]">No achievements yet</p>
          )}
        </div>

        {/* Brand Collaborations */}
        <div className="mb-6">
          <h4 className="font-semibold text-[#1f2937] mb-3">Brand Collaborations</h4>
          {collaborations.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {collaborations.map((collab) => (
                <div key={collab.id} className="border border-gray-200 rounded-xl p-3 bg-white">
                  <p className="font-semibold text-[#1f2937] text-sm">{collab.brand}</p>
                  {collab.campaign && (
                    <p className="text-xs text-[#6b7280] mt-1 line-clamp-1">{collab.campaign}</p>
                  )}
                  {(collab.type || collab.date) && (
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-[#9ca3af]">
                      {collab.type && <span>{collab.type}</span>}
                      {collab.type && collab.date && <span>•</span>}
                      {collab.date && <span>{collab.date}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6b7280]">No collaborations yet</p>
          )}
        </div>

        {/* Follower Growth - Compact */}
        <div className="border border-gray-200 rounded-xl p-4 bg-white mb-3">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-[#1f2937] text-sm">Follower Growth</h4>
            <span className="text-[10px] text-[#9ca3af]">Last 7 days</span>
          </div>
          <div className="flex items-end gap-2 h-16 mb-1">
            {[
              { light: 40, dark: 32 },
              { light: 52, dark: 44 },
              { light: 46, dark: 38 },
              { light: 64, dark: 56 },
              { light: 58, dark: 50 },
              { light: 72, dark: 64 },
              { light: 64, dark: 56 },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full rounded overflow-hidden flex flex-col justify-end" style={{ height: `${bar.light}px` }}>
                  <div className="w-full bg-[#b8e4f0]" style={{ height: `${bar.light - bar.dark}px` }} />
                  <div className="w-full bg-[#2596be]" style={{ height: `${bar.dark}px` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 pt-3 border-t border-gray-100 mt-3">
            <div>
              <p className="text-[10px] text-[#9ca3af]">New</p>
              <p className="text-sm font-semibold text-[#1f2937]">+2.8K</p>
            </div>
            <div>
              <p className="text-[10px] text-[#9ca3af]">Growth</p>
              <p className="text-sm font-semibold text-[#2596be]">+2.3%</p>
            </div>
            <div>
              <p className="text-[10px] text-[#9ca3af]">Lost</p>
              <p className="text-sm font-semibold text-[#ef4444]">-124</p>
            </div>
          </div>
        </div>

        {/* Engagement - Compact */}
        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <h4 className="font-semibold text-[#1f2937] text-sm mb-3">Engagement</h4>
          <div className="space-y-2">
            {[
              { label: "Likes", pct: 68, color: "#2596be" },
              { label: "Comments", pct: 18, color: "#10b981" },
              { label: "Shares", pct: 9, color: "#f59e0b" },
              { label: "Saves", pct: 5, color: "#8b5cf6" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-xs text-[#6b7280] w-16">{item.label}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                </div>
                <span className="text-[10px] text-[#9ca3af] w-8">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Full mode for public profile
  return (
    <>
      {/* Cover Image with Profile Picture */}
      <div className="relative pb-14">
        {user?.coverImageUrl ? (
          <img
            src={user.coverImageUrl}
            alt="Cover"
            className="h-32 w-full object-cover"
          />
        ) : (
          <div className="h-32 bg-white" />
        )}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-300 shadow-xl">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
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
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-[#1f2937] mt-3">{displayName}</h1>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="text-[#6b7280]">@{user?.userName}</span>
            <svg className="w-4 h-4 text-[#2596be]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
          {displayBio && (
            <p className="text-sm text-[#6b7280] mt-3 leading-relaxed">{displayBio}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="border border-gray-200 rounded-xl p-3 bg-white text-center">
            <p className="text-lg font-semibold text-[#1f2937]">{formatNumber(totalFollowers)}</p>
            <p className="text-xs text-[#9ca3af]">Followers</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-3 bg-white text-center">
            <p className="text-lg font-semibold text-[#1f2937]">-</p>
            <p className="text-xs text-[#9ca3af]">Engagement</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-3 bg-white text-center">
            <p className="text-lg font-semibold text-[#1f2937]">-</p>
            <p className="text-xs text-[#9ca3af]">Avg. Views</p>
          </div>
        </div>

        {/* Audience Summary */}
        {user?.audienceSummary && (
          <div className="mb-6">
            <h2 className="font-semibold text-[#1f2937] mb-3">Audience</h2>
            <p className="text-sm text-[#6b7280] leading-relaxed">{user.audienceSummary}</p>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-[#1f2937] mb-3">Achievements & Highlights</h2>
            <div className="flex flex-wrap gap-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1f2937] text-white text-sm rounded-full"
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  <span>{achievement.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brand Collaborations */}
        {collaborations.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-[#1f2937] mb-3">Brand Collaborations</h2>
            <div className="grid grid-cols-2 gap-2">
              {collaborations.map((collab) => (
                <div key={collab.id} className="border border-gray-200 rounded-xl p-3 bg-white">
                  <p className="font-semibold text-[#1f2937] text-sm">{collab.brand}</p>
                  {collab.campaign && (
                    <p className="text-xs text-[#6b7280] mt-1 line-clamp-1">{collab.campaign}</p>
                  )}
                  {(collab.type || collab.date) && (
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-[#9ca3af]">
                      {collab.type && <span>{collab.type}</span>}
                      {collab.type && collab.date && <span>•</span>}
                      {collab.date && <span>{collab.date}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follower Growth */}
        <div className="border border-gray-200 rounded-xl p-4 bg-white mb-3">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[#1f2937]">Follower Growth</h3>
            <span className="text-[11px] text-[#9ca3af]">Last 7 days</span>
          </div>
          <div className="flex items-end gap-3 h-24 mb-1">
            {[
              { light: 56, dark: 44 },
              { light: 72, dark: 60 },
              { light: 64, dark: 52 },
              { light: 88, dark: 76 },
              { light: 80, dark: 68 },
              { light: 96, dark: 84 },
              { light: 88, dark: 76 },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full rounded-md overflow-hidden flex flex-col justify-end" style={{ height: `${bar.light}px` }}>
                  <div className="w-full bg-[#b8e4f0]" style={{ height: `${bar.light - bar.dark}px` }} />
                  <div className="w-full bg-[#2596be]" style={{ height: `${bar.dark}px` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mb-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d} className="flex-1 text-center text-[10px] text-[#9ca3af]">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-3 pt-4 border-t border-gray-100">
            <div>
              <p className="text-[11px] text-[#9ca3af]">New followers</p>
              <p className="text-lg font-semibold text-[#1f2937]">+2,847</p>
            </div>
            <div>
              <p className="text-[11px] text-[#9ca3af]">Growth rate</p>
              <p className="text-lg font-semibold text-[#2596be]">+2.3%</p>
            </div>
            <div>
              <p className="text-[11px] text-[#9ca3af]">Unfollows</p>
              <p className="text-lg font-semibold text-[#ef4444]">-124</p>
            </div>
          </div>
        </div>

        {/* Engagement Breakdown */}
        <div className="border border-gray-200 rounded-xl p-4 bg-white mb-6">
          <h3 className="font-semibold text-[#1f2937] mb-4">Engagement Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: "Likes", pct: 68, count: "45.2K", color: "#2596be" },
              { label: "Comments", pct: 18, count: "12.1K", color: "#10b981" },
              { label: "Shares", pct: 9, count: "6.2K", color: "#f59e0b" },
              { label: "Saves", pct: 5, count: "3.4K", color: "#8b5cf6" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-[#1f2937]">{item.label}</span>
                  <span className="text-sm text-[#9ca3af]">{item.count} ({item.pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">
            <span className="text-sm text-[#9ca3af]">Total Engagements</span>
            <span className="text-lg font-semibold text-[#1f2937]">66.9K</span>
          </div>
        </div>

        {/* Contact */}
        {(user?.location || user?.website) && (
          <div className="mb-6">
            <h2 className="font-semibold text-[#1f2937] mb-3">Contact</h2>
            <div className="space-y-2 text-sm">
              {user.location && (
                <p className="text-[#6b7280]">
                  <span className="font-medium text-[#1f2937]">Location:</span> {user.location}
                </p>
              )}
              {user.website && (
                <p className="text-[#6b7280]">
                  <span className="font-medium text-[#1f2937]">Website:</span>{" "}
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2596be] hover:underline"
                  >
                    {user.website}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-100 mt-auto">
          <p className="text-xs text-[#6b7280]">Powered by Endoros</p>
        </div>
      </div>
    </>
  );
}
