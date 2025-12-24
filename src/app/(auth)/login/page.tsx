"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
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

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-8 -mt-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-[#2d2d2d] mb-2">
              Welcome back
            </h1>
            <p className="text-[#6b7280]">
              Log in to your account to continue
            </p>
          </div>

          <form className="space-y-4">
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
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#d1d5db] text-[#2d2d2d] focus:ring-[#2d2d2d]/20"
                />
                <span className="text-sm text-[#6b7280]">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-[#2d2d2d] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Link
              href="/"
              className="block w-full px-4 py-3 bg-[#2d2d2d] text-white rounded-xl font-medium text-center hover:bg-[#404040] transition-colors"
            >
              Log in
            </Link>
          </form>

          <p className="text-center mt-6 text-[#6b7280]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#2d2d2d] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
