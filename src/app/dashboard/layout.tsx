"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePill, setActivePill] = useState("Channels");
  const [openSections, setOpenSections] = useState({
    quickViews: true,
    favorites: true,
    channels: true,
  });

  const toggleSection = (key: "quickViews" | "favorites" | "channels") => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
    <div className="h-screen w-screen overflow-hidden bg-[#141021] text-[#E1DFDD] flex flex-col font-sans select-none">
      
      {/* ================= TOP TEAMS COMMAND BAR ================= */}
      <header className="h-12 bg-[#141021] border-b border-white/[0.07] px-3 flex items-center justify-between flex-shrink-0 z-50">
        {/* Left: Sidebar Toggle & History Arrows */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors active:scale-95"
            title="Toggle Navigation Pane"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="1.8" />
              <line x1="9" y1="4" x2="9" y2="20" strokeWidth="1.8" />
            </svg>
          </button>
          <div className="hidden sm:flex items-center gap-1 text-slate-500">
            <button onClick={() => window.history.back()} className="p-1 hover:text-slate-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => window.history.forward()} className="p-1 hover:text-slate-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* Center: Search / Command Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="w-full bg-[#242038] hover:bg-[#2C2744] focus-within:bg-[#1F1C2E] focus-within:ring-1 focus-within:ring-[#7B83EB] border border-white/10 rounded-md px-3 py-1.5 flex items-center gap-2.5 transition-all">
            <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Press Ctrl+G to search courses, channels, or doubts"
              className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Organization & User Presence Badge */}
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-block text-xs font-semibold text-slate-300 tracking-tight">
            GuruCool • GnOvaTech
          </span>
          <div className="relative cursor-pointer group">
            <div className="w-7 h-7 rounded-full bg-[#5B5FC7] text-white text-[11px] font-bold flex items-center justify-center shadow-inner group-hover:ring-2 group-hover:ring-[#7B83EB] transition-all">
              RU
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#141021] rounded-full"></span>
          </div>
        </div>
      </header>

      {/* ================= MAIN TEAMS BODY ================= */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 1. Far-Left App Activity Rail */}
        <aside className="w-[68px] bg-[#141021] border-r border-white/[0.06] flex flex-col items-center justify-between py-2 flex-shrink-0 z-40">
          <div className="flex flex-col items-center gap-1 w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative w-full py-2.5 flex flex-col items-center justify-center gap-1 transition-all group ${
                    isActive ? "text-[#7B83EB]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#7B83EB] rounded-r-full"></span>
                  )}
                  <div className="relative">
                    {item.icon}
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-2 bg-[#F7630C] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-3 pb-2">
            <Link
              href="/"
              className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
              title="Back to Landing Page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Link>
          </div>
        </aside>

        {/* 2. Secondary Aubergine Channel Sidebar */}
        {sidebarOpen && (
          <aside className="w-[280px] bg-[#1B162A] border-r border-white/[0.06] flex flex-col flex-shrink-0 overflow-y-auto transition-all duration-300">
            {/* Pane Header */}
            <div className="px-4 pt-4 pb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-tight">Student Hub</h2>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Link href="/dashboard/forum" className="p-1.5 hover:bg-white/5 hover:text-white rounded-md transition-colors" title="New Doubt Thread">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </Link>
              </div>
            </div>

            {/* Teams Filter Pills */}
            <div className="px-4 pb-3 flex flex-wrap gap-1.5 border-b border-white/[0.06]">
              {["Unread", "Channels", "Doubts", "Meeting chats"].map((pill) => (
                <button
                  key={pill}
                  onClick={() => setActivePill(pill)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all active:scale-95 ${
                    activePill === pill
                      ? "bg-[#322C4B] text-white border-[#7B83EB]/50"
                      : "bg-transparent text-slate-400 border-white/15 hover:border-white/30 hover:text-slate-200"
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Collapsible Tree Sections */}
            <div className="p-2 space-y-3 text-xs flex-1">
              
              {/* Quick Views */}
              <div>
                <button
                  onClick={() => toggleSection("quickViews")}
                  className="w-full px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
                >
                  <span className={`transition-transform duration-200 ${openSections.quickViews ? "rotate-90" : ""}`}>›</span>
                  Quick views
                </button>
                {openSections.quickViews && (
                  <div className="mt-1 space-y-0.5">
                    <Link
                      href="/dashboard"
                      className={`px-3 py-2 rounded-md flex items-center justify-between transition-colors ${
                        pathname === "/dashboard"
                          ? "bg-[#2D2741] text-white font-semibold"
                          : "text-slate-300 hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <svg className="w-3.5 h-3.5 text-[#7B83EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        AI Insights & Mastery
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[#7B83EB]"></span>
                    </Link>
                    <Link
                      href="/dashboard/player"
                      className={`px-3 py-2 rounded-md flex items-center gap-2.5 transition-colors ${
                        pathname === "/dashboard/player"
                          ? "bg-[#2D2741] text-white font-semibold"
                          : "text-slate-300 hover:bg-white/[0.04]"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                      My Learning Player
                    </Link>
                  </div>
                )}
              </div>

              {/* Favorites */}
              <div>
                <button
                  onClick={() => toggleSection("favorites")}
                  className="w-full px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
                >
                  <span className={`transition-transform duration-200 ${openSections.favorites ? "rotate-90" : ""}`}>›</span>
                  Favorites
                </button>
                {openSections.favorites && (
                  <div className="mt-1 space-y-0.5">
                    <div className="px-3 py-2 rounded-md flex items-center gap-2.5 text-slate-300 hover:bg-white/[0.04] cursor-pointer">
                      <div className="relative">
                        <div className="w-6 h-6 rounded-full bg-[#5B5FC7] text-white text-[10px] font-bold flex items-center justify-center">
                          RU
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#1B162A]"></span>
                      </div>
                      <span className="truncate">Rupayan (You)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Teams and Channels */}
              <div>
                <button
                  onClick={() => toggleSection("channels")}
                  className="w-full px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
                >
                  <span className={`transition-transform duration-200 ${openSections.channels ? "rotate-90" : ""}`}>›</span>
                  Teams and channels
                </button>
                {openSections.channels && (
                  <div className="mt-1 space-y-1">
                    <div className="px-2 py-1.5 flex items-center gap-2.5 text-slate-200 font-semibold">
                      <div className="w-6 h-6 rounded bg-[#0078D4] text-white text-[10px] font-black flex items-center justify-center">
                        GC
                      </div>
                      <span className="truncate">GuruCool Phygital Batch</span>
                    </div>
                    <div className="pl-9 space-y-0.5">
                      <Link
                        href="/dashboard/forum"
                        className={`block px-3 py-1.5 rounded-md transition-colors ${
                          pathname === "/dashboard/forum"
                            ? "bg-[#2D2741] text-white font-semibold"
                            : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        General & Course Hubs
                      </Link>
                      <Link
                        href="/dashboard/catalog"
                        className={`block px-3 py-1.5 rounded-md transition-colors ${
                          pathname === "/dashboard/catalog"
                            ? "bg-[#2D2741] text-white font-semibold"
                            : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        Course Catalog
                      </Link>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </aside>
        )}

        {/* 3. Main Workspace Viewport */}
        <main className="flex-1 bg-[#1F1F23] overflow-y-auto select-text">
          {children}
        </main>

      </div>
    </div>
  );
}
