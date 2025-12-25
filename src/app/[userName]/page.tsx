import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ userName: string }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { userName } = await params;

  // Fetch user by userName
  const { data: user, error } = await supabaseAdmin
    .from("User")
    .select(`
      id,
      firstName,
      lastName,
      userName,
      category,
      bio,
      website,
      location,
      profileImageUrl,
      coverImageUrl,
      audienceSummary,
      isMediaKitPublic
    `)
    .eq("userName", userName)
    .single();

  // If user not found, show 404
  if (error || !user) {
    notFound();
  }

  // If profile is private, show private page
  if (!user.isMediaKitPublic) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#2596be]/10 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#2596be]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#1f2937] mb-2">
            This page is private
          </h1>
          <p className="text-[#6b7280] max-w-md">
            The creator has chosen to keep their media kit private.
          </p>
        </div>
        <div className="absolute bottom-8 text-sm text-[#6b7280]">
          Powered by Endoros
        </div>
      </div>
    );
  }

  // Fetch connected accounts for this user
  const { data: connectedAccounts } = await supabaseAdmin
    .from("ConnectedAccount")
    .select(`
      id,
      platform,
      username,
      followers,
      isPrimary
    `)
    .eq("userId", user.id);

  // Fetch achievements
  const { data: achievements } = await supabaseAdmin
    .from("Achievement")
    .select("*")
    .eq("userId", user.id)
    .order("date", { ascending: false });

  // Fetch collaborations
  const { data: collaborations } = await supabaseAdmin
    .from("Collaboration")
    .select("*")
    .eq("userId", user.id)
    .order("date", { ascending: false });

  const totalFollowers = connectedAccounts?.reduce((sum, acc) => sum + (acc.followers || 0), 0) || 0;

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.firstName || user.userName || "Creator";

  return (
    <div className="min-h-screen bg-black/20 pt-8 max-[574px]:pt-0 flex flex-col">
      {/* Centered Container - 580px max, full width on mobile */}
      <div className="w-full max-w-[580px] mx-auto max-[574px]:max-w-full flex-1 flex flex-col">
        <div className="bg-white max-[574px]:rounded-none rounded-t-3xl max-[574px]:rounded-t-none overflow-hidden flex-1 flex flex-col shadow-2xl max-[574px]:shadow-none">
          {/* Cover Image with Profile Picture */}
          <div className="relative pb-14">
            {user.coverImageUrl ? (
              <img
                src={user.coverImageUrl}
                alt="Cover"
                className="h-32 w-full object-cover"
              />
            ) : (
              <div className="h-32 bg-white" />
            )}
            {/* Profile Picture - Centered, hovering over hero */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-300 shadow-xl">
              {user.profileImageUrl ? (
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
            {/* Profile Info - Centered */}
            <div className="mb-6 text-center">
              <h1 className="text-xl font-semibold text-[#1f2937] mt-3">{displayName}</h1>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-[#6b7280]">@{user.userName}</span>
                <svg className="w-4 h-4 text-[#2596be]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
              {user.bio && (
                <p className="text-sm text-[#6b7280] mt-3 leading-relaxed">{user.bio}</p>
              )}
            </div>

            {/* Stats */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-3 text-center">
                <div>
                  <p className="text-lg font-semibold text-[#1f2937]">{formatNumber(totalFollowers)}</p>
                  <p className="text-xs text-[#6b7280]">Followers</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#1f2937]">{connectedAccounts?.length || 0}</p>
                  <p className="text-xs text-[#6b7280]">Platforms</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#1f2937]">{collaborations?.length || 0}</p>
                  <p className="text-xs text-[#6b7280]">Collabs</p>
                </div>
              </div>
            </div>

            {/* Audience Summary */}
            {user.audienceSummary && (
              <div className="mb-6">
                <h2 className="font-semibold text-[#1f2937] mb-3">Audience</h2>
                <p className="text-sm text-[#6b7280] leading-relaxed">{user.audienceSummary}</p>
              </div>
            )}

            {/* Achievements */}
            {achievements && achievements.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-[#1f2937] mb-3">Achievements & Highlights</h2>
                <div className="space-y-2">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-[#6b7280]">{achievement.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Collaborations */}
            {collaborations && collaborations.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-[#1f2937] mb-3">Brand Collaborations</h2>
                <div className="grid grid-cols-2 gap-3">
                  {collaborations.map((collab) => (
                    <div key={collab.id} className="bg-gray-50 rounded-xl p-3">
                      <p className="font-medium text-[#1f2937] text-sm">{collab.brand}</p>
                      <p className="text-xs text-[#6b7280] mt-0.5">{collab.campaign}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-[#6b7280] bg-white px-2 py-0.5 rounded">{collab.date}</span>
                        <span className="text-xs text-[#6b7280] bg-white px-2 py-0.5 rounded">{collab.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            {(user.location || user.website) && (
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
        </div>
      </div>
    </div>
  );
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

