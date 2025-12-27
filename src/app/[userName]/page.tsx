import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ProfileCard from "@/components/ProfileCard";

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
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#768cff]/10 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#768cff]"
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

  return (
    <div className="min-h-screen bg-black/20 pt-8 max-[574px]:pt-0 flex flex-col">
      {/* Centered Container - 580px max, full width on mobile */}
      <div className="w-full max-w-[580px] mx-auto max-[574px]:max-w-full flex-1 flex flex-col">
        <div className="bg-white max-[574px]:rounded-none rounded-t-3xl max-[574px]:rounded-t-none overflow-hidden flex-1 flex flex-col shadow-2xl max-[574px]:shadow-none">
          <ProfileCard
            user={user}
            achievements={achievements || []}
            collaborations={collaborations || []}
            totalFollowers={totalFollowers}
            compact={false}
          />
        </div>
      </div>
    </div>
  );
}
