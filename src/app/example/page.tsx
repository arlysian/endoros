import Link from "next/link";
import MediaKitMobile from "@/components/MediaKitMobile";
import MediaKitDesktop from "@/components/MediaKitDesktop";
import ExampleWrapper from "./ExampleWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Steve — Endoros Example",
  description:
    "See what your Endoros media kit could look like. This is an example profile with mock data.",
};

// ── Mock data ────────────────────────────────────────────────────────────────

const mockUser = {
  id: "example-steve",
  firstName: "Steve",
  lastName: "Johnson",
  userName: "steve",
  category: "Lifestyle & Tech",
  bio: "Content creator sharing my journey through tech, travel, and everyday life. Partnering with brands that align with my values.",
  website: "https://stevejohnson.com",
  location: "Los Angeles, CA",
  profileImageUrl: "/example_pfp.jpg",
  coverImageUrl: null as string | null,
  audienceSummary:
    "Primarily 18-34 year olds based in the US, UK, and Germany. Highly engaged audience interested in tech, lifestyle, and travel content.",
  isMediaKitPublic: true,
};

const mockConnectedAccounts = [
  {
    id: "acc-ig",
    platform: "INSTAGRAM" as const,
    username: "stevejohnson",
    profileLink: null,
    isPrimary: true,
    followers: 124500,
  },
  {
    id: "acc-tt",
    platform: "TIKTOK" as const,
    username: "stevejohnson",
    profileLink: null,
    isPrimary: false,
    followers: 89200,
  },
];

const mockAchievements = [
  {
    id: "ach-1",
    title: "100K Followers on Instagram",
    description: "Reached 100,000 followers milestone",
    date: "2025-11-15",
    category: "Milestone",
  },
  {
    id: "ach-2",
    title: "YouTube Creator Summit 2025",
    description: "Invited speaker at the annual creator summit",
    date: "2025-09-20",
    category: "Event",
  },
  {
    id: "ach-3",
    title: "Best Tech Content — Creator Awards",
    description: "Won Best Tech Content at the 2025 Creator Awards",
    date: "2025-06-10",
    category: "Award",
  },
];

const mockCollaborations = [
  {
    id: "col-1",
    brand: "Samsung",
    campaign: "Galaxy S25 Launch",
    date: "2025-12-01",
    type: "Sponsored Post",
  },
  {
    id: "col-2",
    brand: "Nike",
    campaign: "Just Do It — Creator Series",
    date: "2025-10-15",
    type: "Brand Ambassador",
  },
  {
    id: "col-3",
    brand: "Notion",
    campaign: "Productivity for Creators",
    date: "2025-08-05",
    type: "Sponsored Video",
  },
  {
    id: "col-4",
    brand: "Airbnb",
    campaign: "Summer Travel Diaries",
    date: "2025-07-20",
    type: "Sponsored Post",
  },
];

const today = new Date();
const mockFollowerHistory = (() => {
  const raw = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (9 - i));
    return {
      date: d.toISOString().split("T")[0],
      newFollows: Math.floor(180 + Math.random() * 120),
      unfollows: Math.floor(20 + Math.random() * 30),
      followers: 0,
    };
  });
  // Backfill from a mock current count
  raw[raw.length - 1].followers = 12500;
  for (let i = raw.length - 2; i >= 0; i--) {
    raw[i].followers = raw[i + 1].followers - raw[i + 1].newFollows + raw[i + 1].unfollows;
  }
  return raw;
})();

const mockFollowerSnapshots = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() - (9 - i));
  return {
    date: d.toISOString().split("T")[0],
    followers: 88400 + i * 120 + Math.floor(Math.random() * 60),
  };
});

const mockDemographics = [
  { type: "country", label: "US", value: 42.5 },
  { type: "country", label: "GB", value: 14.2 },
  { type: "country", label: "DE", value: 8.7 },
  { type: "country", label: "CA", value: 6.1 },
  { type: "country", label: "AU", value: 5.3 },
  { type: "age", label: "18-24", value: 34.0 },
  { type: "age", label: "25-34", value: 38.5 },
  { type: "age", label: "35-44", value: 16.2 },
  { type: "age", label: "45-54", value: 7.1 },
  { type: "age", label: "55-64", value: 3.0 },
  { type: "age", label: "65+", value: 1.2 },
  { type: "gender", label: "M", value: 56.0 },
  { type: "gender", label: "F", value: 41.5 },
  { type: "gender", label: "U", value: 2.5 },
  { type: "city", label: "Los Angeles", value: 8.4 },
  { type: "city", label: "London", value: 6.2 },
  { type: "city", label: "New York", value: 5.9 },
  { type: "city", label: "Berlin", value: 3.8 },
  { type: "city", label: "Toronto", value: 3.1 },
];

const mockEngagementHistory = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() - (32 - i));
  return {
    date: d.toISOString().split("T")[0],
    likes: Math.floor(150 + Math.random() * 100),
    comments: Math.floor(8 + Math.random() * 15),
    shares: Math.floor(4 + Math.random() * 10),
    saves: Math.floor(10 + Math.random() * 20),
  };
});

const accountDataMap: Record<
  string,
  {
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
    followerHistory: { date: string; newFollows: number; unfollows: number; followers: number }[];
    followerSnapshots: { date: string; followers: number }[];
    demographics: { type: string; label: string; value: number }[];
    performanceData: {
      thisWeek: { profileVisits: number; linkClicks: number };
      lastWeek: { profileVisits: number; linkClicks: number };
    } | null;
    engagementHistory: { date: string; likes: number; comments: number; shares: number; saves: number }[];
    totalEngagement: { likes: number; comments: number; shares: number; saves: number } | null;
  }
> = {
  "acc-ig": {
    metrics: {
      followers: 124500,
      reach: 89400,
      engagementRate: 4.8,
      avgViews: 32100,
      likes: 5840,
      comments: 312,
      shares: 189,
      saves: 421,
      profileVisits: 2150,
      newFollows: 245,
      unfollows: 32,
    },
    followerHistory: mockFollowerHistory,
    followerSnapshots: [],
    demographics: mockDemographics,
    performanceData: {
      thisWeek: { profileVisits: 2150, linkClicks: 387 },
      lastWeek: { profileVisits: 1820, linkClicks: 310 },
    },
    engagementHistory: mockEngagementHistory,
    totalEngagement: { likes: 58400, comments: 3120, shares: 1890, saves: 4210 },
  },
  "acc-tt": {
    metrics: {
      followers: 89200,
      engagementRate: 6.2,
      avgViews: 58300,
      likes: 8920,
      comments: 543,
      shares: 1240,
    },
    followerHistory: [],
    followerSnapshots: mockFollowerSnapshots,
    demographics: [],
    performanceData: null,
    engagementHistory: [],
    totalEngagement: null,
  },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ExampleProfilePage() {
  return (
    <ExampleWrapper>
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-neutral-200 text-sm text-neutral-600 hover:text-black transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <MediaKitDesktop
          user={mockUser}
          achievements={mockAchievements}
          collaborations={mockCollaborations}
          connectedAccounts={mockConnectedAccounts}
          accountDataMap={accountDataMap}
          rates={[]}
        />
      </div>

      {/* Mobile View */}
      <div className="lg:hidden min-h-screen bg-neutral-50 pt-8 max-[574px]:pt-0 flex flex-col">
        <div className="w-full max-w-[560px] mx-auto max-[574px]:max-w-full flex-1 flex flex-col">
          <div className="bg-white max-[574px]:rounded-none rounded-2xl overflow-hidden flex-1 flex flex-col">
            <MediaKitMobile
              user={mockUser}
              achievements={mockAchievements}
              collaborations={mockCollaborations}
              compact={false}
              connectedAccounts={mockConnectedAccounts}
              accountDataMap={accountDataMap}
            />
          </div>
        </div>
      </div>
    </ExampleWrapper>
  );
}
