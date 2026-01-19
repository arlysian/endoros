import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";

export default async function SignupPage() {
  const { userId } = await auth();

  // If logged in, check onboarding status and redirect
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-16">
        <Link href="/">
          <span className="text-base font-semibold text-black tracking-tight">
            endoros
          </span>
        </Link>
      </header>

      {/* Signup Form */}
      <main className="flex-1 flex items-center justify-center px-8 -mt-16">
        <SignUp
          signInUrl="/login"
          forceRedirectUrl="/onboarding"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none",
            }
          }}
        />
      </main>
    </div>
  );
}
