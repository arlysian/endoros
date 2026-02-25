import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (userId) {
    const { data: user } = await supabaseAdmin
      .from("User")
      .select("onboardingCompleted")
      .eq("id", userId)
      .single();

    if (user?.onboardingCompleted) {
      redirect("/dashboard");
    } else {
      redirect("/onboarding");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
