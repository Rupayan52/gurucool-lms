"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SearchItem {
  title: string;
  category: string;
  href: string;
}

const SEARCH_INDEX: SearchItem[] = [
  { title: "AI Insights & Mastery", category: "Workspace", href: "/dashboard" },
  { title: "My Learning Player", category: "Video Player", href: "/dashboard/player" },
  { title: "General & Course Hubs", category: "Channel", href: "/dashboard/forum" },
  { title: "Expert Helpdesk & Doubts", category: "Doubts", href: "/dashboard/forum" },
  { title: "Course Catalog", category: "Courses", href: "/dashboard/catalog" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Interactive Pill Filter State
  const [activePill, setActivePill] = useState<"All" | "Unread" | "Channels" | "Doubts" | "Meeting chats">("Channels");
  
  const [openSections, setOpenSections] = useState({
    quickViews: true,
    favorites: true,
    channels: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [presence, setPresence] = useState<"Available" | "Busy" | "Do not disturb" | "Away">("Available");
  const [presenceMenuOpen, setPresenceMenuOpen] = useState(false);
  const [workLocation, setWorkLocation] = useState<string>("Set work location");
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [editingStatus, setEditingStatus] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("gurucool-theme") as "dark" | "light" | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setProfileOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
        setPresenceMenuOpen(false);
        setLocationMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("gurucool-theme", nextTheme);
    window.dispatchEvent(new CustomEvent("gurucool-theme-change", { detail: nextTheme }));
  };

  const toggleSection = (key: "quickViews" | "favorites" | "channels") => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredSearch = SEARCH_INDEX.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presenceColor = {
    Available: "bg-emerald-500",
    Busy: "bg-rose-500",
    "Do not disturb": "bg-rose-600",
    Away: "bg-amber-400",
  }[presence];

  const isDark = theme === "dark";

  const navItems = [
    {
      label: "Activity",
      href: "/dashboard",
      badge: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      label: "Hubs",
      href: "/dashboard/forum",
      badge: "1",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      label: "Player",
      href: "/dashboard/player",
      badge: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Catalog",
      href: "/dashboard/catalog",
      badge: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      data-theme={theme}
      className={`h-screen w-screen overflow-hidden flex flex-col font-sans select-none transition-colors duration-200 ${
        isDark ? "bg-[#141021] text-[#E1DFDD]" : "bg-[#F0F2F5] text-slate-900"
      }`}
    >
      {/* TOP COMMAND BAR */}
      <header
        className={`h-12 px-3 flex items-center justify-between flex-shrink-0 z-50 border-b transition-colors ${
          isDark
            ? "bg-[#141021] border-white/[0.07]"
            : "bg-[#464775] text-white border-black/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
            title="Toggle Navigation Pane"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="1.8" />
              <line x1="9" y1="4" x2="9" y2="20" strokeWidth="1.8" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div ref={searchContainerRef} className="flex-1 max-w-xl mx-4 relative">
          <div
            className={`w-full rounded-md px-3 py-1.5 flex items-center gap-2.5 transition-all border ${
              isDark
                ? "bg-[#242038] hover:bg-[#2C2744] focus-within:bg-[#1F1C2E] border-white/10 focus-within:ring-1 focus-within:ring-[#7B83EB]"
                : "bg-white/95 text-slate-900 border-transparent"
            }`}
          >
            <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              placeholder="Press Ctrl+G to search courses, channels, or doubts"
              className="w-full bg-transparent text-xs focus:outline-none"
            />
          </div>

          {searchOpen && (
            <div className={`absolute left-0 right-0 mt-1.5 rounded-lg shadow-2xl border overflow-hidden z-50 ${isDark ? "bg-[#25242B] border-white/10 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">
                Quick Navigation
              </div>
              {filteredSearch.map((item) => (
                <button
                  key={item.title}
                  onClick={() => {
                    router.push(item.href);
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between ${isDark ? "hover:bg-[#32313B]" : "hover:bg-slate-100"}`}
                >
                  <span className="font-semibold">{item.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#5B5FC7]/20 text-[#7B83EB] font-bold">{item.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
          >
            {isDark ? "Light" : "Dark"}
          </button>

          <div ref={profileRef} className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="relative flex items-center justify-center focus:outline-none group">
              <div className="w-7 h-7 rounded-full bg-[#CBE8E8] text-[#1A5252] text-xs font-bold flex items-center justify-center shadow-inner group-hover:ring-2 group-hover:ring-[#7B83EB] transition-all">
                B
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${presenceColor} border-2 border-[#141021] rounded-full`}></span>
            </button>

            {profileOpen && (
              <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border overflow-hidden z-50 ${isDark ? "bg-[#242424] border-white/10 text-[#E1DFDD]" : "bg-white border-slate-200 text-slate-900"}`}>
                <div className="px-5 pt-4 pb-3 flex items-center justify-between">
                  <span className="text-sm font-bold">GuruCool</span>
                  <Link href="/login" onClick={() => setProfileOpen(false)} className="text-xs hover:underline">Sign out</Link>
                </div>
                <div className="px-5 pb-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#CBE8E8] text-[#1A5252] text-lg font-bold flex items-center justify-center flex-shrink-0">B</div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold truncate">bandyopadhyayrupayan (Student)</h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">bandyopadhyayrupayan@gmail.com</p>
                  </div>
                </div>
                <div className="px-2 py-1 space-y-0.5 text-xs">
                  <button onClick={() => setPresenceMenuOpen(!presenceMenuOpen)} className="w-full px-3 py-2.5 rounded-lg flex items-center justify-between hover:bg-white/5">
                    <span className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${presenceColor}`}></span>
                      <span>{presence}</span>
                    </span>
                  </button>
                  {presenceMenuOpen && (
                    <div className="mx-3 my-1 p-1 rounded-lg bg-black/40">
                      {(["Available", "Busy", "Do not disturb", "Away"] as const).map((status) => (
                        <button key={status} onClick={() => { setPresence(status); setPresenceMenuOpen(false); }} className="w-full px-3 py-1.5 text-left text-xs hover:bg-white/10 rounded">
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN TEAMS BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* Rail */}
        <aside className={`w-[68px] border-r flex flex-col items-center justify-between py-2 flex-shrink-0 z-40 ${isDark ? "bg-[#141021] border-white/[0.06]" : "bg-[#EBEBEB] border-slate-300"}`}>
          <div className="flex flex-col items-center gap-1 w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative w-full py-2.5 flex flex-col items-center justify-center gap-1 transition-all ${isActive ? "text-[#5B5FC7] font-semibold" : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
                >
                  {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#5B5FC7] rounded-r-full"></span>}
                  <div className="relative">
                    {item.icon}
                    {item.badge && <span className="absolute -top-1.5 -right-2 bg-[#F7630C] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{item.badge}</span>}
                  </div>
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Secondary Channel Sidebar */}
        {sidebarOpen && (
          <aside className={`w-[280px] border-r flex flex-col flex-shrink-0 overflow-y-auto ${isDark ? "bg-[#1B162A] border-white/[0.06]" : "bg-[#F5F5F5] border-slate-200"}`}>
            
            {/* Header + Interactive Edit Icon */}
            <div className="px-4 pt-4 pb-3 flex items-center justify-between">
              <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Student Hub</h2>
              <Link
                href="/dashboard/forum"
                className={`p-1.5 rounded-md transition-colors ${isDark ? "hover:bg-white/5 hover:text-white" : "hover:bg-slate-200 hover:text-slate-900"}`}
                title="New Doubt Thread / Post"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
            </div>

            {/* Interactive Filter Pills */}
            <div className={`px-4 pb-3 flex flex-wrap gap-1.5 border-b ${isDark ? "border-white/[0.06]" : "border-slate-200"}`}>
              {(["Unread", "Channels", "Doubts", "Meeting chats"] as const).map((pill) => (
                <button
                  key={pill}
                  onClick={() => {
                    setActivePill(pill);
                    if (pill === "Doubts" || pill === "Meeting chats") {
                      router.push("/dashboard/forum");
                    }
                  }}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all active:scale-95 ${
                    activePill === pill
                      ? isDark
                        ? "bg-[#322C4B] text-white border-[#7B83EB]/50 shadow"
                        : "bg-[#5B5FC7] text-white border-[#5B5FC7] shadow"
                      : isDark
                      ? "bg-transparent text-slate-400 border-white/15 hover:border-white/30 hover:text-slate-200"
                      : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Dynamic Tree Views based on Active Pill Filter */}
            <div className="p-2 space-y-3 text-xs flex-1">
              {activePill === "Channels" || activePill === "Unread" ? (
                <div>
                  <div className="px-2 py-1.5 flex items-center gap-2.5 font-semibold text-slate-200">
                    <div className="w-6 h-6 rounded bg-[#0078D4] text-white text-[10px] font-black flex items-center justify-center">GC</div>
                    <span className="truncate">GuruCool Phygital Batch</span>
                  </div>
                  <div className="pl-9 space-y-0.5 mt-1">
                    <Link href="/dashboard/forum" className="block px-3 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.04]">
                      General & Course Hubs
                    </Link>
                    <Link href="/dashboard/catalog" className="block px-3 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.04]">
                      Course Catalog
                    </Link>
                    <Link href="/dashboard/player" className="block px-3 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.04]">
                      Live Broadcast Room
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-slate-400 mb-3">Showing filter view for: <strong className="text-white">{activePill}</strong></p>
                  <Link href="/dashboard/forum" className="text-xs text-[#7B83EB] font-bold underline">
                    Open Course Hubs & Resolution Center →
                  </Link>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main Viewport */}
        <main className={`flex-1 overflow-y-auto select-text transition-colors duration-200 ${isDark ? "bg-[#1F1F23]" : "bg-white"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
