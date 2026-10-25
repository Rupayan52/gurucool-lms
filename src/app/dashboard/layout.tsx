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

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePill, setActivePill] = useState<"Unread" | "Channels" | "Doubts" | "Meeting chats">("Channels");
  const [openSections, setOpenSections] = useState({
    quickViews: true,
    favorites: true,
    channels: true,
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Profile Dropdown State (Matches Teams Popover)
  const [profileOpen, setProfileOpen] = useState(false);
  const [presence, setPresence] = useState<"Available" | "Busy" | "Do not disturb" | "Away">("Available");
  const [presenceMenuOpen, setPresenceMenuOpen] = useState(false);
  const [workLocation, setWorkLocation] = useState<string>("Set work location");
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [editingStatus, setEditingStatus] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Load saved theme & bind Ctrl+G shortcut + outside click listeners
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
      {/* ================= TOP TEAMS COMMAND BAR ================= */}
      <header
        className={`h-12 px-3 flex items-center justify-between flex-shrink-0 z-50 border-b transition-colors ${
          isDark
            ? "bg-[#141021] border-white/[0.07]"
            : "bg-[#464775] text-white border-black/10"
        }`}
      >
        {/* Left: Sidebar Toggle & History Arrows */}
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
          <div className="hidden sm:flex items-center gap-1 text-slate-300">
            <button
              onClick={() => window.history.back()}
              className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors"
              title="Back"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => window.history.forward()}
              className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors"
              title="Forward"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Center: Functional Search / Command Bar */}
        <div ref={searchContainerRef} className="flex-1 max-w-xl mx-4 relative">
          <div
            className={`w-full rounded-md px-3 py-1.5 flex items-center gap-2.5 transition-all border ${
              isDark
                ? "bg-[#242038] hover:bg-[#2C2744] focus-within:bg-[#1F1C2E] border-white/10 focus-within:ring-1 focus-within:ring-[#7B83EB]"
                : "bg-white/90 hover:bg-white focus-within:bg-white text-slate-900 border-transparent focus-within:ring-2 focus-within:ring-blue-300"
            }`}
          >
            <svg
              className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-slate-400" : "text-slate-500"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && filteredSearch.length > 0) {
                  router.push(filteredSearch[0].href);
                  setSearchOpen(false);
                  setSearchQuery("");
                }
              }}
              placeholder="Press Ctrl+G to search courses, channels, or doubts"
              className={`w-full bg-transparent text-xs focus:outline-none ${
                isDark ? "text-slate-200 placeholder-slate-400" : "text-slate-800 placeholder-slate-500"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchOpen && (
            <div
              className={`absolute left-0 right-0 mt-1.5 rounded-lg shadow-2xl border overflow-hidden z-50 ${
                isDark
                  ? "bg-[#25242B] border-white/10 text-slate-200"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">
                Quick Navigation ({filteredSearch.length})
              </div>
              {filteredSearch.length > 0 ? (
                filteredSearch.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => {
                      router.push(item.href);
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                      isDark ? "hover:bg-[#32313B]" : "hover:bg-slate-100"
                    }`}
                  >
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#5B5FC7]/20 text-[#7B83EB] font-bold">
                      {item.category}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-xs text-slate-400 text-center">
                  No matching channels or courses found. Press Enter in Course Hubs to post a doubt.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Theme Switcher, Org Label & Teams Profile Popover */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Button */}
          <button
            onClick={toggleTheme}
            className="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
            title="Switch between Light and Dark theme"
          >
            {isDark ? (
              <>
                <svg className="w-3.5 h-3.5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-indigo-200" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          <span className="hidden md:inline-block text-xs font-semibold text-slate-200 tracking-tight">
            GuruCool
          </span>

          {/* Profile Trigger & Teams Popover Card */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="relative flex items-center justify-center focus:outline-none group"
              title="Account Manager"
            >
              <div className="w-7 h-7 rounded-full bg-[#CBE8E8] text-[#1A5252] text-xs font-bold flex items-center justify-center shadow-inner group-hover:ring-2 group-hover:ring-[#7B83EB] transition-all">
                B
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${presenceColor} border-2 border-[#141021] rounded-full`}
              ></span>
            </button>

            {/* MICROSOFT TEAMS PROFILE CARD POPOVER (Matches 2nd Reference Image) */}
            {profileOpen && (
              <div
                className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border overflow-hidden z-50 transition-all ${
                  isDark
                    ? "bg-[#242424] border-white/10 text-[#E1DFDD]"
                    : "bg-white border-slate-200 text-slate-900"
                }`}
              >
                {/* Top Row: Organization & Sign out */}
                <div className="px-5 pt-4 pb-3 flex items-center justify-between">
                  <span className="text-sm font-bold tracking-tight">GuruCool</span>
                  <Link
                    href="/login"
                    className={`text-xs hover:underline ${
                      isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Sign out
                  </Link>
                </div>

                {/* User Details Row */}
                <div className="px-5 pb-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#CBE8E8] text-[#1A5252] text-lg font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    B
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold truncate">
                      bandyopadhyayrupayan (Student)
                    </h4>
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        isDark ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      bandyopadhyayrupayan@gmail.com
                    </p>
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className={`inline-flex items-center gap-1.5 text-xs mt-1 hover:underline ${
                        isDark ? "text-slate-300 hover:text-white" : "text-blue-600"
                      }`}
                    >
                      <span>View account</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Status List */}
                <div className="px-2 py-1 space-y-0.5 text-xs">
                  {/* 1. Available / Presence Selector */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setPresenceMenuOpen(!presenceMenuOpen);
                        setLocationMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${
                        isDark ? "hover:bg-white/5" : "hover:bg-slate-100"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-4 h-4 rounded-full ${presenceColor} flex items-center justify-center text-black`}>
                          <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-[13px]">{presence}</span>
                      </span>
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {presenceMenuOpen && (
                      <div
                        className={`mx-3 my-1 p-1 rounded-lg border ${
                          isDark ? "bg-[#1B1B1B] border-white/10" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        {(["Available", "Busy", "Do not disturb", "Away"] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setPresence(status);
                              setPresenceMenuOpen(false);
                            }}
                            className={`w-full px-3 py-1.5 text-left rounded-md text-xs flex items-center justify-between ${
                              isDark ? "hover:bg-white/10" : "hover:bg-slate-200/70"
                            }`}
                          >
                            <span>{status}</span>
                            {presence === status && <span>✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Set Work Location */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setLocationMenuOpen(!locationMenuOpen);
                        setPresenceMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${
                        isDark ? "hover:bg-white/5" : "hover:bg-slate-100"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[13px]">{workLocation}</span>
                      </span>
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {locationMenuOpen && (
                      <div
                        className={`mx-3 my-1 p-1 rounded-lg border ${
                          isDark ? "bg-[#1B1B1B] border-white/10" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        {["Campus Classroom", "Remote / Home", "Study Library"].map((loc) => (
                          <button
                            key={loc}
                            onClick={() => {
                              setWorkLocation(loc);
                              setLocationMenuOpen(false);
                            }}
                            className={`w-full px-3 py-1.5 text-left rounded-md text-xs ${
                              isDark ? "hover:bg-white/10" : "hover:bg-slate-200/70"
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Set Status Message */}
                  <div>
                    <button
                      onClick={() => setEditingStatus(!editingStatus)}
                      className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${
                        isDark ? "hover:bg-white/5" : "hover:bg-slate-100"
                      }`}
                    >
                      <span className="flex items-center gap-3 truncate">
                        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-[13px] truncate">
                          {statusMessage ? statusMessage : "Set status message"}
                        </span>
                      </span>
                      <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {editingStatus && (
                      <div className="px-3 py-2">
                        <input
                          type="text"
                          value={statusMessage}
                          onChange={(e) => setStatusMessage(e.target.value)}
                          placeholder="What's your study focus today?"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") setEditingStatus(false);
                          }}
                          className={`w-full px-2.5 py-1.5 rounded text-xs border focus:outline-none ${
                            isDark
                              ? "bg-[#1B1B1B] border-white/15 text-white"
                              : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className={`my-2 border-t ${isDark ? "border-white/10" : "border-slate-200"}`} />

                {/* Personal Account Section */}
                <div className="px-5 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                      <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-[13px] font-bold">Personal</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="text-[11px] text-[#7B83EB] hover:underline font-semibold"
                  >
                    {isDark ? "Switch to Light" : "Switch to Dark"}
                  </button>
                </div>

                {/* Divider */}
                <div className={`mt-1 border-t ${isDark ? "border-white/10" : "border-slate-200"}`} />

                {/* Add Another Account */}
                <Link
                  href="/login"
                  onClick={() => setProfileOpen(false)}
                  className={`px-5 py-3.5 flex items-center gap-3 text-[13px] font-bold transition-colors ${
                    isDark ? "hover:bg-white/5" : "hover:bg-slate-100"
                  }`}
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Add another account</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= MAIN TEAMS BODY ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* 1. Far-Left App Activity Rail */}
        <aside
          className={`w-[68px] border-r flex flex-col items-center justify-between py-2 flex-shrink-0 z-40 transition-colors ${
            isDark
              ? "bg-[#141021] border-white/[0.06]"
              : "bg-[#EBEBEB] border-slate-300/80"
          }`}
        >
          <div className="flex flex-col items-center gap-1 w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative w-full py-2.5 flex flex-col items-center justify-center gap-1 transition-all group ${
                    isActive
                      ? "text-[#5B5FC7] font-semibold"
                      : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#5B5FC7] rounded-r-full"></span>
                  )}
                  <div className="relative">
                    {item.icon}
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-2 bg-[#F7630C] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-3 pb-2">
            <Link
              href="/"
              className={`p-2 transition-colors ${
                isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Back to Landing Page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Link>
          </div>
        </aside>

        {/* 2. Secondary Channel Sidebar */}
        {sidebarOpen && (
          <aside
            className={`w-[280px] border-r flex flex-col flex-shrink-0 overflow-y-auto transition-colors duration-200 ${
              isDark
                ? "bg-[#1B162A] border-white/[0.06]"
                : "bg-[#F5F5F5] border-slate-200"
            }`}
          >
            {/* Pane Header */}
            <div className="px-4 pt-4 pb-3 flex items-center justify-between">
              <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Student Hub
              </h2>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Link
                  href="/dashboard/forum"
                  className={`p-1.5 rounded-md transition-colors ${
                    isDark ? "hover:bg-white/5 hover:text-white" : "hover:bg-slate-200 hover:text-slate-900"
                  }`}
                  title="New Doubt Thread"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Teams Filter Pills */}
            <div
              className={`px-4 pb-3 flex flex-wrap gap-1.5 border-b ${
                isDark ? "border-white/[0.06]" : "border-slate-200"
              }`}
            >
              {(["Unread", "Channels", "Doubts", "Meeting chats"] as const).map((pill) => (
                <button
                  key={pill}
                  onClick={() => setActivePill(pill)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all active:scale-95 ${
                    activePill === pill
                      ? isDark
                        ? "bg-[#322C4B] text-white border-[#7B83EB]/50"
                        : "bg-[#5B5FC7] text-white border-[#5B5FC7]"
                      : isDark
                      ? "bg-transparent text-slate-400 border-white/15 hover:border-white/30 hover:text-slate-200"
                      : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
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
                  className={`w-full px-2 py-1 text-[11px] font-semibold flex items-center gap-1.5 ${
                    isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className={`transition-transform duration-200 ${openSections.quickViews ? "rotate-90" : ""}`}>
                    ›
                  </span>
                  Quick views
                </button>
                {openSections.quickViews && (
                  <div className="mt-1 space-y-0.5">
                    <Link
                      href="/dashboard"
                      className={`px-3 py-2 rounded-md flex items-center justify-between transition-colors ${
                        pathname === "/dashboard"
                          ? isDark
                            ? "bg-[#2D2741] text-white font-semibold"
                            : "bg-indigo-50 text-[#5B5FC7] font-semibold"
                          : isDark
                          ? "text-slate-300 hover:bg-white/[0.04]"
                          : "text-slate-700 hover:bg-slate-200/60"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <svg className="w-3.5 h-3.5 text-[#7B83EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI Insights & Mastery
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[#7B83EB]"></span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Favorites */}
              <div>
                <button
                  onClick={() => toggleSection("favorites")}
                  className={`w-full px-2 py-1 text-[11px] font-semibold flex items-center gap-1.5 ${
                    isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className={`transition-transform duration-200 ${openSections.favorites ? "rotate-90" : ""}`}>
                    ›
                  </span>
                  Favorites
                </button>
                {openSections.favorites && (
                  <div className="mt-1 space-y-0.5">
                    <button
                      onClick={() => setProfileOpen(true)}
                      className={`w-full px-3 py-2 rounded-md flex items-center gap-2.5 text-left transition-colors ${
                        isDark
                          ? "text-slate-300 hover:bg-white/[0.04]"
                          : "text-slate-700 hover:bg-slate-200/60"
                      }`}
                    >
                      <div className="relative">
                        <div className="w-6 h-6 rounded-full bg-[#CBE8E8] text-[#1A5252] text-[10px] font-bold flex items-center justify-center">
                          B
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 ${presenceColor} rounded-full border border-[#1B162A]`}
                        ></span>
                      </div>
                      <span className="truncate">bandyopadhyayrupayan (You)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Teams and Channels */}
              <div>
                <button
                  onClick={() => toggleSection("channels")}
                  className={`w-full px-2 py-1 text-[11px] font-semibold flex items-center gap-1.5 ${
                    isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className={`transition-transform duration-200 ${openSections.channels ? "rotate-90" : ""}`}>
                    ›
                  </span>
                  Teams and channels
                </button>
                {openSections.channels && (
                  <div className="mt-1 space-y-1">
                    <div
                      className={`px-2 py-1.5 flex items-center gap-2.5 font-semibold ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                    >
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
                            ? isDark
                              ? "bg-[#2D2741] text-white font-semibold"
                              : "bg-indigo-50 text-[#5B5FC7] font-semibold"
                            : isDark
                            ? "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                        }`}
                      >
                        General & Course Hubs
                      </Link>
                      <Link
                        href="/dashboard/catalog"
                        className={`block px-3 py-1.5 rounded-md transition-colors ${
                          pathname === "/dashboard/catalog"
                            ? isDark
                              ? "bg-[#2D2741] text-white font-semibold"
                              : "bg-indigo-50 text-[#5B5FC7] font-semibold"
                            : isDark
                            ? "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
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
        <main
          className={`flex-1 overflow-y-auto select-text transition-colors duration-200 ${
            isDark ? "bg-[#1F1F23]" : "bg-white"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
