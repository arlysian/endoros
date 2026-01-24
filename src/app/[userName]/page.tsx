import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ProfileCard from "@/components/ProfileCard";
import MediaKitDesktop from "@/components/MediaKitDesktop";

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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-neutral-400"
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
          <h1 className="text-xl font-semibold text-black mb-2">
            This page is private
          </h1>
          <p className="text-neutral-500 max-w-md text-sm">
            The creator has chosen to keep their media kit private.
          </p>
        </div>
        <div className="absolute bottom-8 text-xs text-neutral-400">
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
      profileLink,
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

  // Fetch latest platform metrics for Instagram
  const instagramAccount = connectedAccounts?.find(acc => acc.platform === "INSTAGRAM");
  let platformMetrics = null;
  let followerHistory: { date: string; newFollows: number; unfollows: number }[] = [];

  if (instagramAccount) {
    // Get latest metrics
    const { data: metrics } = await supabaseAdmin
      .from("PlatformMetrics")
      .select("*")
      .eq("connectedAccountId", instagramAccount.id)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (metrics) {
      platformMetrics = {
        followers: metrics.followers ?? undefined,
        reach: metrics.reach ?? undefined,
        engagementRate: metrics.engagementRate ?? undefined,
        avgViews: metrics.avgViews ?? undefined,
        likes: metrics.total_likes ?? undefined,
        comments: metrics.total_comments ?? undefined,
        shares: metrics.total_shares ?? undefined,
        saves: metrics.total_saves ?? undefined,
        profileVisits: metrics.profileVisits ?? undefined,
        newFollows: metrics.newFollows ?? undefined,
        unfollows: metrics.unfollows ?? undefined,
      };
    }

    // Get last 7 days for chart
    const { data: history } = await supabaseAdmin
      .from("PlatformMetrics")
      .select("date, newFollows, unfollows")
      .eq("connectedAccountId", instagramAccount.id)
      .order("date", { ascending: false })
      .limit(7);

    if (history) {
      followerHistory = history.reverse().map(h => ({
        date: h.date,
        newFollows: h.newFollows ?? 0,
        unfollows: h.unfollows ?? 0,
      }));
    }
  }

  // Get latest followers count for each connected account
  const accountsWithFollowers = await Promise.all(
    (connectedAccounts || []).map(async (acc) => {
      const { data: latestMetrics } = await supabaseAdmin
        .from("PlatformMetrics")
        .select("followers")
        .eq("connectedAccountId", acc.id)
        .order("date", { ascending: false })
        .limit(1)
        .single();

      return {
        ...acc,
        followers: latestMetrics?.followers || null,
      };
    })
  );

  const totalFollowers = accountsWithFollowers.reduce((sum, acc) => sum + (acc.followers || 0), 0);

  return (
    <>
      {/* Desktop View - hidden on mobile */}
      <div className="hidden lg:block">
        <MediaKitDesktop
          user={user}
          achievements={achievements || []}
          collaborations={collaborations || []}
          connectedAccounts={accountsWithFollowers}
          platformMetrics={platformMetrics}
          followerHistory={followerHistory}
        />
      </div>

      {/* Mobile View - hidden on desktop */}
      <div className="lg:hidden min-h-screen bg-neutral-50 pt-8 max-[574px]:pt-0 flex flex-col">
        <div className="w-full max-w-[560px] mx-auto max-[574px]:max-w-full flex-1 flex flex-col">
          <div className="bg-white max-[574px]:rounded-none rounded-2xl overflow-hidden flex-1 flex flex-col">
            <ProfileCard
              user={user}
              achievements={achievements || []}
              collaborations={collaborations || []}
              totalFollowers={totalFollowers}
              compact={false}
              platformMetrics={platformMetrics}
              followerHistory={followerHistory}
            />
          </div>
        </div>
      </div>
    </>
  );
}
