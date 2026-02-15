"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function BackToDashboard({ profileUserId }: { profileUserId: string }) {
  const { user } = useUser();

  if (!user || user.id !== profileUserId) return null;

  return (
    <div className="fixed top-4 left-4 z-50">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-neutral-200 text-sm text-neutral-600 hover:text-black transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
        Dashboard
      </Link>
    </div>
  );
}
