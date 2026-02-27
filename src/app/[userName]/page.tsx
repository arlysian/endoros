import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ProfileCard from "@/components/ProfileCard";
import MediaKitDesktop from "@/components/MediaKitDesktop";
import BackToDashboard from "./BackToDashboard";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ userName: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userName } = await params;

  const { data: user } = await supabaseAdmin
    .from("User")
    .select("firstName, lastName, userName, category, bio, profileImageUrl, isMediaKitPublic")
    .eq("userName", userName)
    .single();

  if (!user || !user.isMediaKitPublic) {
    return { title: "Endoros" };
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.userName;
  const description = user.bio || `${name}'s media kit${user.category ? ` — ${user.category}` : ""}. View stats, audience insights, and more.`;
  const title = `${name} — Endoros`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `https://endoros.com/${user.userName}`,
      ...(user.profileImageUrl ? { images: [{ url: user.profileImageUrl, width: 400, height: 400, alt: name ?? undefined }] } : {}),
    },
    twitter: {
      card: user.profileImageUrl ? "summary" : "summary",
      title,
      description,
      ...(user.profileImageUrl ? { images: [user.profileImageUrl] } : {}),
    },
  };
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

  // Fetch creator rates
  const { data: rates } = await supabaseAdmin
    .from("CreatorRate")
    .select("*")
    .eq("userId", user.id)
    .order("platform", { ascending: true });

  // Fetch collaborations
  const { data: collaborations } = await supabaseAdmin
    .from("Collaboration")
    .select("*")
    .eq("userId", user.id)
    .order("date", { ascending: false });

  // Fetch metrics per connected account, keyed by platform
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const cutoffDate = twoDaysAgo.toISOString().split("T")[0];

  // Build account data map — keyed by connectedAccountId so multiple accounts
  // of the same platform stay independent
  const accountDataMap: Record<string, {
    metrics: {
      followers?: number;
      reach?: number;
      engagementRate?: number;
      avgViews?: number;
      likes?: number;
      comments?: number;
      shares?: number;
      saves?: number;
      profileVisits?: number;
      newFollows?: number;
      unfollows?: number;
    } | null;
    followerHistory: { date: string; newFollows: number; unfollows: number }[];
    followerSnapshots: { date: string; followers: number }[];
    demographics: { type: string; label: string; value: number }[];
    performanceData: {
      thisWeek: { profileVisits: number; linkClicks: number };
      lastWeek: { profileVisits: number; linkClicks: number };
    } | null;
  }> = {};

  const accountsWithFollowers = await Promise.all(
    (connectedAccounts || []).map(async (acc) => {
      // Get latest metrics row for this account
      const { data: metrics } = await supabaseAdmin
        .from("PlatformMetrics")
        .select("*")
        .eq("connectedAccountId", acc.id)
        .order("date", { ascending: false })
        .limit(1)
        .single();

      // Map only the fields that this platform actually provides
      let parsedMetrics = null;
      if (metrics) {
        if (acc.platform === "INSTAGRAM") {
          parsedMetrics = {
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
        } else if (acc.platform === "TIKTOK") {
          parsedMetrics = {
            followers: metrics.followers ?? undefined,
            engagementRate: metrics.engagementRate ?? undefined,
            avgViews: metrics.avgViews ?? undefined,
            likes: metrics.total_likes ?? undefined,
            comments: metrics.total_comments ?? undefined,
            shares: metrics.total_shares ?? undefined,
          };
        } else if (acc.platform === "FACEBOOK") {
          parsedMetrics = {
            followers: metrics.followers ?? undefined,
          };
        }
      }

      // IG: follows/unfollows breakdown
      let followerHistory: { date: string; newFollows: number; unfollows: number }[] = [];
      // TikTok/other: follower count snapshots over time
      let followerSnapshots: { date: string; followers: number }[] = [];

      if (acc.platform === "INSTAGRAM") {
        const { data: history } = await supabaseAdmin
          .from("PlatformMetrics")
          .select("date, newFollows, unfollows")
          .eq("connectedAccountId", acc.id)
          .lte("date", cutoffDate)
          .order("date", { ascending: false })
          .limit(7);

        followerHistory = history
          ? history.reverse().map(h => ({
              date: h.date,
              newFollows: h.newFollows ?? 0,
              unfollows: h.unfollows ?? 0,
            }))
          : [];
      } else if (acc.platform === "TIKTOK") {
        const { data: snapshots } = await supabaseAdmin
          .from("PlatformMetrics")
          .select("date, followers")
          .eq("connectedAccountId", acc.id)
          .not("followers", "is", null)
          .order("date", { ascending: false })
          .limit(7);

        followerSnapshots = snapshots
          ? snapshots.reverse().map(s => ({
              date: s.date,
              followers: s.followers ?? 0,
            }))
          : [];
      }

      // Demographics — only IG has this
      let demographics: { type: string; label: string; value: number }[] = [];
      if (acc.platform === "INSTAGRAM") {
        const { data: demoData } = await supabaseAdmin
          .from("AudienceDemographics")
          .select("type, label, value")
          .eq("connectedAccountId", acc.id);
        demographics = (demoData as unknown as { type: string; label: string; value: number }[]) || [];
      }

      // Performance data — 14 days for this week vs last week comparison (IG only)
      let performanceData: {
        thisWeek: { profileVisits: number; linkClicks: number };
        lastWeek: { profileVisits: number; linkClicks: number };
      } | null = null;
      if (acc.platform === "INSTAGRAM") {
        const { data: perfHistory } = await supabaseAdmin
          .from("PlatformMetrics")
          .select("date, profileVisits, linkClicks")
          .eq("connectedAccountId", acc.id)
          .lte("date", cutoffDate)
          .order("date", { ascending: false })
          .limit(14);

        if (perfHistory && perfHistory.length >= 7) {
          const sorted = [...perfHistory].reverse();
          const thisWeekData = sorted.slice(-7);
          const lastWeekData = sorted.slice(0, Math.min(7, sorted.length - 7));
          performanceData = {
            thisWeek: {
              profileVisits: thisWeekData.reduce((sum, d) => sum + (d.profileVisits || 0), 0),
              linkClicks: thisWeekData.reduce((sum, d) => sum + (d.linkClicks || 0), 0),
            },
            lastWeek: {
              profileVisits: lastWeekData.reduce((sum, d) => sum + (d.profileVisits || 0), 0),
              linkClicks: lastWeekData.reduce((sum, d) => sum + (d.linkClicks || 0), 0),
            },
          };
        }
      }

      accountDataMap[acc.id] = { metrics: parsedMetrics, followerHistory, followerSnapshots, demographics, performanceData };

      return {
        ...acc,
        followers: metrics?.followers || null,
      };
    })
  );

  return (
    <>
      <BackToDashboard profileUserId={user.id} />

      {/* Desktop View - hidden on mobile */}
      <div className="hidden lg:block">
        <MediaKitDesktop
          user={user}
          achievements={achievements || []}
          collaborations={collaborations || []}
          connectedAccounts={accountsWithFollowers}
          accountDataMap={accountDataMap}
          rates={rates || []}
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
              compact={false}
              connectedAccounts={accountsWithFollowers}
              accountDataMap={accountDataMap}
              rates={rates || []}
            />
          </div>
        </div>
      </div>
    </>
  );
}
