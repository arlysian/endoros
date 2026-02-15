"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

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
  onboardingCompleted: boolean;
  audienceSummary: string | null;
}

interface SidebarContextType {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
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
  mobileMenuOpen: false,
  setMobileMenuOpen: () => {},
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
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    name: "Profile",
    href: "/influence-profile",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    name: "Analytics",
    href: "/audience-insights",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    name: "Platforms",
    href: "/social-platforms",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
  {
    name: "Settings",
    href: "/settings",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function Sidebar() {
  const { mobileMenuOpen, setMobileMenuOpen } = useSidebar();
  const { user } = useUser();
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-white
          flex flex-col transition-all duration-200 ease-out z-50
          lg:w-56 w-56 -translate-x-full lg:translate-x-0
          ${mobileMenuOpen ? "translate-x-0" : ""}
        `}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-5">
          <Link href="/" className="font-semibold text-base tracking-tight">
            endoros
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5
                  transition-colors duration-150
                  ${isActive
                    ? "text-black font-medium"
                    : "text-neutral-500 hover:text-black"
                  }
                `}
              >
                {item.icon}
                <span className="text-[13px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Preview Link */}
        <div className="px-3 mb-2">
          <a
            href={user?.userName ? `/${user.userName}` : "#"}
            target={user?.userName ? "_blank" : undefined}
            rel={user?.userName ? "noopener noreferrer" : undefined}
            onClick={(e) => { if (!user?.userName) e.preventDefault(); }}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              bg-black text-white hover:bg-neutral-800 transition-colors
              ${!user?.userName ? "cursor-default" : ""}
            `}
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            <span className="text-[13px] font-medium">Preview</span>
          </a>
        </div>

        {/* Bottom section */}
        <div className="py-3 px-3">
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:text-black transition-colors"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span className="text-[13px]">Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function MobileHeader() {
  const { setMobileMenuOpen } = useSidebar();

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white flex items-center justify-between px-4 z-30">
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="p-2 -ml-2 text-black"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <span className="font-semibold text-base tracking-tight">endoros</span>

      <div className="w-9" />
    </header>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const router = useRouter();

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!userLoading && user && !user.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [user, userLoading, router]);

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
    <SidebarContext.Provider value={{ mobileMenuOpen, setMobileMenuOpen }}>
      <UserContext.Provider value={{ user, achievements, collaborations, loading: userLoading, refreshUser }}>
        <MobileHeader />
        <Sidebar />
        <main
          className={`
            min-h-screen bg-white transition-all duration-200
            pt-14 lg:pt-0
            lg:pl-56
          `}
        >
          <div className="max-w-5xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </UserContext.Provider>
    </SidebarContext.Provider>
  );
}
