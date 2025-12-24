"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-semibold text-[#2d2d2d] tracking-tight">
            endoros
          </span>
        </Link>
      </header>

      {/* Signup Form */}
      <main className="flex-1 flex items-center justify-center px-8 -mt-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-[#2d2d2d] mb-2">
              Create your account
            </h1>
            <p className="text-[#6b7280]">
              Start tracking your influence today
            </p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2d2d2d] mb-2">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-xl text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#2d2d2d]/20 focus:border-[#2d2d2d]"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2d2d2d] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-xl text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#2d2d2d]/20 focus:border-[#2d2d2d]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2d2d2d] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-xl text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#2d2d2d]/20 focus:border-[#2d2d2d]"
                placeholder="Create a password"
              />
              <p className="text-xs text-[#9ca3af] mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="block w-full px-4 py-3 bg-[#2d2d2d] text-white rounded-xl font-medium text-center hover:bg-[#404040] transition-colors"
              >
                Create account
              </Link>
            </div>

            <p className="text-xs text-[#9ca3af] text-center">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-[#2d2d2d] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#2d2d2d] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>

          <p className="text-center mt-6 text-[#6b7280]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#2d2d2d] font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
