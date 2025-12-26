"use client";

import { useState } from "react";

const platforms = [
  { id: "instagram", name: "Instagram", icon: InstagramIcon, color: "#E4405F" },
  { id: "facebook", name: "Facebook", icon: FacebookIcon, color: "#1877F2" },
  { id: "tiktok", name: "TikTok", icon: TikTokIcon, color: "#000000" },
];

export default function Dashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      </div>

      {/* Platform Selection Bar */}
      <div className="flex items-center gap-1 sm:gap-2 mb-8 p-1 bg-white rounded-xl border border-border flex-wrap sm:flex-nowrap">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatform === platform.id;
          return (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`
                flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200
                ${isSelected
                  ? "bg-hover text-[#2596be]"
                  : "text-muted hover:bg-hover hover:text-foreground"
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{platform.name}</span>
            </button>
          );
        })}
        <button className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-muted hover:bg-hover hover:text-foreground transition-all duration-200 flex-shrink-0">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Followers"
          value="124.5K"
          change="+2.4K"
          positive
          icon={<UsersIcon />}
        />
        <StatCard
          title="Avg. Engagement Rate"
          value="4.8%"
          change="+0.3%"
          positive
          icon={<HeartIcon />}
        />
        <StatCard
          title="Avg. Views per Post"
          value="45.2K"
          change="-1.2K"
          positive={false}
          icon={<EyeIcon />}
        />
        <StatCard
          title="Monthly Reach"
          value="892K"
          change="+12%"
          positive
          icon={<TrendingIcon />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Follower Growth */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-foreground">Follower Growth</h2>
            <select className="text-sm text-muted bg-transparent border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#2596be]">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-48">
            <FollowerGrowthChart />
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted">New followers</p>
              <p className="text-xl font-semibold text-foreground">+2,847</p>
            </div>
            <div>
              <p className="text-sm text-muted">Growth rate</p>
              <p className="text-xl font-semibold text-emerald-500">+2.3%</p>
            </div>
            <div>
              <p className="text-sm text-muted">Unfollows</p>
              <p className="text-xl font-semibold text-red-500">-124</p>
            </div>
          </div>
        </div>

        {/* Engagement Breakdown */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-medium text-foreground mb-6">Engagement Breakdown</h2>
          <div className="space-y-4">
            <EngagementBar label="Likes" value={68} count="45.2K" color="#2596be" />
            <EngagementBar label="Comments" value={18} count="12.1K" color="#10b981" />
            <EngagementBar label="Shares" value={9} count="6.2K" color="#f59e0b" />
            <EngagementBar label="Saves" value={5} count="3.4K" color="#8b5cf6" />
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Total Engagements</span>
              <span className="text-lg font-semibold text-foreground">66.9K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-lg font-medium text-foreground mb-6">Platform Performance Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-sm font-medium text-muted pb-4">Metric</th>
                <th className="text-right text-sm font-medium text-muted pb-4">This Week</th>
                <th className="text-right text-sm font-medium text-muted pb-4">Last Week</th>
                <th className="text-right text-sm font-medium text-muted pb-4">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <PerformanceRow metric="Profile Visits" thisWeek="12,847" lastWeek="11,234" change="+14.3%" positive />
              <PerformanceRow metric="Post Impressions" thisWeek="458K" lastWeek="412K" change="+11.2%" positive />
              <PerformanceRow metric="Story Views" thisWeek="89.2K" lastWeek="92.1K" change="-3.1%" positive={false} />
              <PerformanceRow metric="Link Clicks" thisWeek="2,341" lastWeek="1,987" change="+17.8%" positive />
              <PerformanceRow metric="Avg. Time on Profile" thisWeek="2m 34s" lastWeek="2m 12s" change="+16.7%" positive />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  positive,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#2596be]/10 flex items-center justify-center text-[#2596be]">
          {icon}
        </div>
        <span
          className={`text-sm font-medium px-2 py-0.5 rounded-full ${
            positive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
          }`}
        >
          {change}
        </span>
      </div>
      <p className="text-sm text-muted mb-1">{title}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EngagementBar({
  label,
  value,
  count,
  color,
}: {
  label: string;
  value: number;
  count: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-muted">{count} ({value}%)</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function PerformanceRow({
  metric,
  thisWeek,
  lastWeek,
  change,
  positive,
}: {
  metric: string;
  thisWeek: string;
  lastWeek: string;
  change: string;
  positive: boolean;
}) {
  return (
    <tr>
      <td className="py-4 text-sm text-foreground">{metric}</td>
      <td className="py-4 text-sm text-foreground text-right font-medium">{thisWeek}</td>
      <td className="py-4 text-sm text-muted text-right">{lastWeek}</td>
      <td className={`py-4 text-sm text-right font-medium ${positive ? "text-emerald-500" : "text-red-500"}`}>
        {change}
      </td>
    </tr>
  );
}

function FollowerGrowthChart() {
  const data = [
    { day: "Mon", value: 40 },
    { day: "Tue", value: 55 },
    { day: "Wed", value: 45 },
    { day: "Thu", value: 70 },
    { day: "Fri", value: 65 },
    { day: "Sat", value: 85 },
    { day: "Sun", value: 75 },
  ];
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="flex items-end justify-between h-full gap-2">
      {data.map((item) => (
        <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex justify-center">
            <div
              className="w-8 bg-[#2596be]/20 rounded-t-md relative group cursor-pointer hover:bg-[#2596be]/30 transition-colors"
              style={{ height: `${(item.value / maxValue) * 160}px` }}
            >
              <div
                className="absolute bottom-0 left-0 right-0 bg-[#2596be] rounded-t-md transition-all"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-muted">{item.day}</span>
        </div>
      ))}
    </div>
  );
}

// Icons
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function TrendingIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
