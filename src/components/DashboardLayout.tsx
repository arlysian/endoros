"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  {
    name: "Influence Profile",
    href: "/influence-profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    name: "Audience Insights",
    href: "/audience-insights",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    name: "Settings",
    href: "/settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen bg-sidebar border-r border-border
        flex flex-col transition-all duration-300 ease-in-out z-50
        ${collapsed ? "w-[52px]" : "w-[240px]"}
      `}
    >
      {/* Logo + Collapse Toggle */}
      <div className={`h-14 flex items-center border-b border-border ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
        <Link
          href="/"
          className={`
            font-semibold text-lg text-foreground tracking-tight
            transition-all duration-300
            ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}
          `}
        >
          endoros
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-foreground transition-all duration-200"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-3 space-y-1 ${collapsed ? "px-2" : "px-3"}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center rounded-lg transition-all duration-200 group relative
                ${collapsed ? "w-9 h-9 justify-center" : "gap-3 px-3 py-2"}
                ${isActive
                  ? "bg-[#2596be]/10 text-[#2596be]"
                  : "text-muted hover:bg-hover hover:text-foreground"
                }
              `}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="text-sm whitespace-nowrap">
                  {item.name}
                </span>
              )}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-white text-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg border border-border z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Log Out */}
      <div className={`py-3 border-t border-border ${collapsed ? "px-2" : "px-3"}`}>
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className={`
            flex items-center rounded-lg transition-all duration-200 group relative w-full
            ${collapsed ? "w-9 h-9 justify-center" : "gap-3 px-3 py-2"}
            text-muted hover:bg-hover hover:text-foreground
          `}
        >
          <span className="flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </span>
          {!collapsed && (
            <span className="text-sm whitespace-nowrap">Log Out</span>
          )}
          {/* Tooltip for collapsed state */}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-white text-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg border border-border z-50">
              Log Out
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}

function LivePreview() {
  const achievements = [
    "Featured in Vogue Magazine",
    "Brand Partner of the Year 2023",
    "Top 100 Lifestyle Influencers",
  ];

  const collaborations = [
    { brand: "Nike", campaign: "Air Max Campaign", date: "2023-06", type: "Paid" },
    { brand: "Adidas", campaign: "Lifestyle Collection", date: "2023-08", type: "Gifted" },
    { brand: "Puma", campaign: "Running Series", date: "2023-07", type: "Paid" },
    { brand: "Reebok", campaign: "CrossFit Line", date: "2023-09", type: "Paid" },
    { brand: "Under Armour", campaign: "Training Gear", date: "2023-10", type: "Gifted" },
    { brand: "New Balance", campaign: "Marathon Essentials", date: "2023-11", type: "Paid" },
    { brand: "Asics", campaign: "Performance Running", date: "2023-12", type: "Gifted" },
    { brand: "Disney", campaign: "Movie Premiere", date: "2023-09", type: "Event" },
  ];

  return (
    <aside className="fixed right-0 top-0 h-screen w-[320px] bg-white border-l border-border overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Live Preview</h2>

        {/* Cover Image */}
        <div className="relative mb-8">
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="absolute -bottom-6 left-4">
            <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-gray-300">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground">John Doe</h3>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-muted">@john_doe</span>
            <svg className="w-4 h-4 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
          <p className="text-sm text-muted mt-3 leading-relaxed">
            Passionate content creator sharing lifestyle tips and inspiration. Partnered with top brands in fashion and wellness.
          </p>
        </div>

        {/* Stats */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between text-center">
            <div>
              <p className="text-lg font-semibold text-foreground">125K</p>
              <p className="text-xs text-muted">Followers</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">4.2%</p>
              <p className="text-xs text-muted">Engagement</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">50K</p>
              <p className="text-xs text-muted">Avg Views</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <h4 className="font-semibold text-foreground mb-3">Achievements & Highlights</h4>
          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm text-muted">{achievement}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Collaborations */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Brand Collaborations</h4>
          <div className="grid grid-cols-2 gap-3">
            {collaborations.map((collab, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-3">
                <p className="font-medium text-foreground text-sm">{collab.brand}</p>
                <p className="text-xs text-muted mt-0.5">{collab.campaign}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted bg-white px-2 py-0.5 rounded">{collab.date}</span>
                  <span className="text-xs text-muted bg-white px-2 py-0.5 rounded">{collab.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <Sidebar />
      <main
        className={`
          min-h-screen transition-all duration-300 pr-[320px]
          ${collapsed ? "pl-[52px]" : "pl-[240px]"}
        `}
      >
        {children}
      </main>
      <LivePreview />
    </SidebarContext.Provider>
  );
}
