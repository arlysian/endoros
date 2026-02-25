"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setLoading(true);

    try {
      const { supportedFirstFactors } = await signIn.create({
        identifier: email,
      });

      const emailCodeFactor = supportedFirstFactors?.find(
        (factor) => factor.strategy === "email_code"
      );

      if (emailCodeFactor && "emailAddressId" in emailCodeFactor) {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailCodeFactor.emailAddressId,
        });
        setVerifying(true);
      } else {
        setError("Email code sign-in is not available.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "oauth_google") => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/login/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-10 pt-10 flex items-center">
        <Link href="/">
          <span className="text-2xl font-semibold text-black tracking-tight">
            endoros
          </span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md">
          {!verifying ? (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center">
                Welcome back
              </h1>
              <p className="text-neutral-500 text-center mt-3 mb-10">
                Log in to your account
              </p>

              {error && (
                <div className="mb-6 p-3 text-sm text-red-700 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-4 bg-neutral-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                  placeholder="Email"
                />
                <div id="clerk-captcha" data-cl-theme="light" data-cl-size="flexible" />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-4 bg-neutral-200 text-neutral-500 rounded-full text-base font-semibold enabled:bg-neutral-900 enabled:text-white hover:enabled:bg-neutral-800 transition-all disabled:cursor-not-allowed"
                >
                  {loading ? "Sending code..." : "Continue"}
                </button>
              </form>

              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="text-sm text-neutral-400">OR</span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleOAuth("oauth_google")}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 border border-neutral-200 rounded-full text-sm font-semibold hover:bg-neutral-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center">
                Check your email
              </h1>
              <p className="text-neutral-500 text-center mt-3 mb-10">
                We sent a code to <span className="font-medium text-neutral-900">{email}</span>
              </p>

              {error && (
                <div className="mb-6 p-3 text-sm text-red-700 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-5">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-4 bg-neutral-100 rounded-lg text-lg text-center tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                  placeholder="Enter code"
                />
                <button
                  type="submit"
                  disabled={loading || !code}
                  className="w-full py-4 bg-neutral-200 text-neutral-500 rounded-full text-base font-semibold enabled:bg-neutral-900 enabled:text-white hover:enabled:bg-neutral-800 transition-all disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </form>

              <button
                onClick={() => { setVerifying(false); setCode(""); setError(""); }}
                className="w-full text-sm text-neutral-500 hover:text-neutral-900 transition-colors mt-6 text-center"
              >
                Use a different email
              </button>
            </>
          )}

          <p className="text-sm text-neutral-500 text-center mt-10">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-neutral-900 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
