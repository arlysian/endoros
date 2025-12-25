"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import ProfileCard from "./ProfileCard";

interface UserData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  category: string | null;
  email: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
}

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  category: string | null;
}

interface Collaboration {
  id: string;
  brand: string;
  campaign: string | null;
  date: string | null;
  type: string | null;
}

interface UserContextType {
  user: UserData | null;
  achievements: Achievement[];
  collaborations: Collaboration[];
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
});

const UserContext = createContext<UserContextType>({
  user: null,
  achievements: [],
  collaborations: [],
  loading: true,
  refreshUser: async () => {},
});

export const useSidebar = () => useContext(SidebarContext);
export const useUser = () => useContext(UserContext);

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
          Endoros
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
  const { user, achievements, collaborations, loading } = useUser();

  return (
    <aside className="fixed right-0 top-0 h-screen w-[320px] bg-white border-l border-border overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">Live Preview</h2>

        {/* Profile URL Link */}
        <a
          href={user?.userName ? `/${user.userName}` : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-3 py-2 mb-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
        >
          <span className="text-sm text-muted truncate">
            {user?.userName ? `endoros.com/${user.userName}` : "endoros.com/username"}
          </span>
          <svg className="w-4 h-4 text-muted flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </a>

        <ProfileCard
          user={user}
          achievements={achievements}
          collaborations={collaborations}
          loading={loading}
          compact={true}
        />
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [userLoading, setUserLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const [userRes, achievementsRes, collaborationsRes] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/achievements"),
        fetch("/api/collaborations"),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json();
        setAchievements(achievementsData);
      }

      if (collaborationsRes.ok) {
        const collaborationsData = await collaborationsRes.json();
        setCollaborations(collaborationsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <UserContext.Provider value={{ user, achievements, collaborations, loading: userLoading, refreshUser }}>
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
      </UserContext.Provider>
    </SidebarContext.Provider>
  );
}
