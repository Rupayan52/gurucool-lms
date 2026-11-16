"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  matchExact?: boolean;
}

const STUDENT_TABS: NavItem[] = [
  { href: "/dashboard", label: "AI Mastery", icon: "✨", matchExact: true },
  { href: "/dashboard/player", label: "Live Class", icon: "🎥" },
  { href: "/dashboard/curriculum", label: "Courses", icon: "📚" },
  { href: "/dashboard/doubts", label: "Doubts", icon: "💡" },
  { href: "/dashboard/forum", label: "Hubs", icon: "💬" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" }
];

const TEACHER_TABS: NavItem[] = [
  { href: "/teacher", label: "Command", icon: "⚡", matchExact: true },
  { href: "/teacher/live-classes", label: "Live Studio", icon: "🎥" },
  { href: "/teacher/curriculum", label: "Syllabus", icon: "📘" },
  { href: "/teacher/doubts", label: "Doubts", icon: "💡" },
  { href: "/teacher/resolution-center", label: "Hubs", icon: "💬" },
  { href: "/teacher/profile", label: "Profile", icon: "👤" }
];

interface UserSummary {
  id?: string;
  name: string;
  email: string;
  role: "STUDENT" | "FACULTY";
  avatarUrl?: string | null;
}

function triggerHaptic(intensity: "LIGHT" | "MEDIUM" = "LIGHT") {
  if (typeof window === "undefined") return;
  try {
    if (navigator.vibrate) navigator.vibrate(intensity === "MEDIUM" ? 10 : 5);
  } catch {}
  try {
    const rnBridge = (window as any).ReactNativeWebView;
    if (rnBridge?.postMessage) {
      rnBridge.postMessage(JSON.stringify({ type: "HAPTIC", intensity }));
    }
  } catch {}
}

export default function MobileAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const [isMobileView, setIsMobileView] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [presence, setPresence] = useState<"Available" | "Busy" | "Offline">("Available");
  const [studentUser, setStudentUser] = useState<UserSummary | null>(null);
  const [facultyUser, setFacultyUser] = useState<UserSummary | null>(null);
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [backToast, setBackToast] = useState<string | null>(null);
  const lastBackPressRef = useRef<number>(0);

  const isTeacherRoute = pathname.startsWith("/teacher");
  const isStudentRoute = pathname.startsWith("/dashboard");
  const activeRole: "FACULTY" | "STUDENT" = isTeacherRoute ? "FACULTY" : "STUDENT";
  const showAppChrome = isMobileView && (isTeacherRoute || isStudentRoute);

  // 1. Initialize & Apply Universal Theme Engine ("dark" | "light")
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedTheme = localStorage.getItem("gc_theme_mode") as "dark" | "light" | null;
    const defaultTheme = savedTheme || (isTeacherRoute ? "light" : "dark");
    setThemeMode(defaultTheme);
    document.documentElement.setAttribute("data-gc-theme", defaultTheme);
    if (defaultTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isTeacherRoute]);

  const applyThemeMode = (nextTheme: "dark" | "light") => {
    setThemeMode(nextTheme);
    try {
      localStorage.setItem("gc_theme_mode", nextTheme);
    } catch {}

    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-gc-theme", nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Also click the hidden desktop Light/Dark toggle button if present so React layout state stays synced
      const buttons = Array.from(document.querySelectorAll("button"));
      const desktopToggle = buttons.find(btn => {
        const txt = (btn.textContent || "").trim();
        return txt === "Light" || txt === "Dark";
      });
      if (desktopToggle) {
        const btnText = (desktopToggle.textContent || "").trim().toLowerCase();
        // In dashboard layout, button label shows current or target mode; click it to sync
        if (
          (nextTheme === "light" && btnText === "light") ||
          (nextTheme === "dark" && btnText === "dark") ||
          btnText === "light" ||
          btnText === "dark"
        ) {
          try {
            desktopToggle.click();
          } catch {}
        }
      }
    }
    window.dispatchEvent(new CustomEvent("gc-toggle-theme", { detail: { theme: nextTheme } }));
  };

  const handleToggleTheme = () => {
    triggerHaptic("LIGHT");
    const nextTheme = themeMode === "dark" ? "light" : "dark";
    applyThemeMode(nextTheme);
  };

  // 2. Role-Scoped Fast SWR Cache
  useEffect(() => {
    if (typeof window === "undefined" || (window as any).__gcRoleScopedFetchInstalled) return;
    (window as any).__gcRoleScopedFetchInstalled = true;

    const nativeFetch = window.fetch.bind(window);
    const memCache = new Map<string, { body: string; status: number; headers: [string, string][]; ts: number }>();

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const method = (init?.method || "GET").toUpperCase();
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      const currentPath = window.location.pathname || "/";
      const roleScope = currentPath.startsWith("/teacher")
        ? "FACULTY"
        : currentPath.startsWith("/dashboard")
        ? "STUDENT"
        : "PUBLIC";

      const isUncachedEndpoint =
        method !== "GET" ||
        !url.startsWith("/api/") ||
        url.includes("/api/auth/") ||
        url.includes("/api/chat") ||
        url.includes("/api/threads") ||
        url.includes("/api/app/version") ||
        init?.cache === "no-store";

      if (isUncachedEndpoint) {
        if (method !== "GET" && url.startsWith("/api/")) {
          memCache.clear();
        }
        return nativeFetch(input, init);
      }

      const cacheKey = `${roleScope}::${url}`;
      const cached = memCache.get(cacheKey);
      const now = Date.now();

      const revalidate = () =>
        nativeFetch(input, init)
          .then(async res => {
            if (res.ok) {
              const cloned = res.clone();
              const body = await cloned.text();
              const headers: [string, string][] = [];
              cloned.headers.forEach((v, k) => headers.push([k, v]));
              memCache.set(cacheKey, { body, status: res.status, headers, ts: Date.now() });
            }
            return res;
          })
          .catch(() => null);

      if (cached && now - cached.ts < 25000) {
        revalidate();
        return new Response(cached.body, {
          status: cached.status,
          headers: cached.headers
        });
      }

      const freshRes = await revalidate();
      if (freshRes) return freshRes;
      return nativeFetch(input, init);
    };
  }, []);

  // 3. Detect Mobile Viewport
  useEffect(() => {
    const checkViewport = () => {
      const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|wv/i.test(ua);
      const isNarrow = typeof window !== "undefined" && window.innerWidth < 1024;
      const mobileActive = isNarrow || isMobileUA;
      setIsMobileView(mobileActive);

      if (typeof document !== "undefined") {
        if (mobileActive) {
          document.documentElement.setAttribute("data-mobile-app", "true");
        } else {
          document.documentElement.removeAttribute("data-mobile-app");
        }
      }
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // 4. Prefetch routes
  useEffect(() => {
    if (!showAppChrome) return;
    const tabs = isTeacherRoute ? TEACHER_TABS : STUDENT_TABS;
    tabs.forEach(t => {
      try {
        router.prefetch(t.href);
      } catch {}
    });
  }, [showAppChrome, isTeacherRoute, router]);

  // 5. Load Active Portal User Identity
  useEffect(() => {
    if (!showAppChrome) return;
    let cancelled = false;

    const loadActivePortalUser = async () => {
      try {
        if (isTeacherRoute) {
          const res = await fetch(`/api/teacher/profile?t=${Date.now()}`, {
            cache: "no-store",
            headers: { "x-portal-role": "FACULTY" }
          });
          if (res.ok) {
            const data = await res.json();
            const u = data?.teacher || data?.user || data;
            if (u && (u.name || u.email)) {
              if (!cancelled) {
                setFacultyUser({
                  id: u.id,
                  name: u.name,
                  email: u.email || "",
                  role: "FACULTY",
                  avatarUrl: u.avatarUrl || null
                });
              }
              return;
            }
          }
          const meRes = await fetch(`/api/auth/me?t=${Date.now()}`, { cache: "no-store" });
          if (meRes.ok) {
            const meData = await meRes.json();
            const u = meData?.user || meData;
            if (u && String(u.role || "").toUpperCase().includes("TEACH")) {
              if (!cancelled) {
                setFacultyUser({
                  id: u.id,
                  name: u.name,
                  email: u.email || "",
                  role: "FACULTY",
                  avatarUrl: u.avatarUrl || null
                });
              }
            }
          }
        } else if (isStudentRoute) {
          const res = await fetch(`/api/student/profile?t=${Date.now()}`, {
            cache: "no-store",
            headers: { "x-portal-role": "STUDENT" }
          });
          if (res.ok) {
            const data = await res.json();
            const u = data?.student || data?.user || data;
            if (u && (u.name || u.email)) {
              if (!cancelled) {
                setStudentUser({
                  id: u.id,
                  name: u.name,
                  email: u.email || "",
                  role: "STUDENT",
                  avatarUrl: u.avatarUrl || null
                });
              }
              return;
            }
          }
          const meRes = await fetch(`/api/auth/me?t=${Date.now()}`, { cache: "no-store" });
          if (meRes.ok) {
            const meData = await meRes.json();
            const u = meData?.user || meData;
            if (u && !String(u.role || "").toUpperCase().includes("TEACH")) {
              if (!cancelled) {
                setStudentUser({
                  id: u.id,
                  name: u.name,
                  email: u.email || "",
                  role: "STUDENT",
                  avatarUrl: u.avatarUrl || null
                });
              }
            }
          }
        }
      } catch {}
    };

    loadActivePortalUser();
    return () => {
      cancelled = true;
    };
  }, [showAppChrome, isTeacherRoute, isStudentRoute, pathname]);

  // 6. Hide duplicate desktop search bar visually on mobile (keep in DOM for theme sync)
  useEffect(() => {
    if (!isMobileView) return;
    const inputs = document.querySelectorAll('input[placeholder*="Search courses"], input[placeholder*="Ctrl+G"]');
    inputs.forEach(input => {
      const bar = input.closest("header, div.border-b");
      if (bar && bar instanceof HTMLElement) bar.style.display = "none";
    });
  }, [isMobileView, pathname]);

  useEffect(() => {
    setProfileMenuOpen(false);
  }, [pathname]);

  // 7. Hardware Back Button Guard:
  //    - On /login, /register, /privacy-policy, /terms-of-service, /contact-support -> ALWAYS go back to "/" (Landing Page)!
  //    - On inner /dashboard/* or /teacher/* tabs -> go back to "/dashboard" or "/teacher"
  //    - Only on "/" or "/dashboard" or "/teacher" -> show double-back toast before minimizing app
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.pushState({ gcBackGuard: true, path: pathname }, "", window.location.href);

    const handlePopState = () => {
      triggerHaptic("MEDIUM");

      if (profileMenuOpen) {
        setProfileMenuOpen(false);
        window.history.pushState({ gcBackGuard: true }, "", window.location.href);
        return;
      }

      // If user is on Login, Register, or Legal pages, Back ALWAYS routes to the Landing Page ("/")
      const isPublicSubpage =
        pathname === "/login" ||
        pathname === "/register" ||
        pathname.startsWith("/privacy-policy") ||
        pathname.startsWith("/terms-of-service") ||
        pathname.startsWith("/contact-support");

      if (isPublicSubpage) {
        router.push("/");
        return;
      }

      // If user is on an inner Student or Faculty tab, Back routes to their main dashboard
      const portalRoot = isTeacherRoute ? "/teacher" : isStudentRoute ? "/dashboard" : "/";
      if (pathname !== portalRoot && (isTeacherRoute || isStudentRoute)) {
        router.push(portalRoot);
        return;
      }

      // Otherwise user is at "/" or "/dashboard" or "/teacher" root
      const now = Date.now();
      if (now - lastBackPressRef.current < 2200) return;

      lastBackPressRef.current = now;
      setBackToast("Swipe Back again to minimize app");
      window.history.pushState({ gcBackGuard: true }, "", window.location.href);
      setTimeout(() => setBackToast(null), 2000);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname, profileMenuOpen, isTeacherRoute, isStudentRoute, router]);

  const activeTabs = isTeacherRoute ? TEACHER_TABS : STUDENT_TABS;
  const isTabActive = (item: NavItem) => {
    if (item.matchExact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };
  const activeTitle =
    activeTabs.find(t => isTabActive(t))?.label ||
    (isTeacherRoute ? "Faculty Workspace" : "Student Workspace");

  const currentUser = isTeacherRoute ? facultyUser : studentUser;
  const displayName = currentUser?.name || (isTeacherRoute ? "Faculty Educator" : "Student");
  const displayEmail =
    currentUser?.email || (isTeacherRoute ? "faculty@gurucool.edu" : "student@gurucool.edu");
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || (isTeacherRoute ? "F" : "S");
  const profilePath = isTeacherRoute ? "/teacher/profile" : "/dashboard/profile";

  const handleSignOut = async () => {
    triggerHaptic("MEDIUM");
    try {
      sessionStorage.clear();
      setStudentUser(null);
      setFacultyUser(null);
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    // Push "/" then "/login" using Next router so "/" is always in history behind "/login"
    router.push("/login");
  };

  const presenceDotColor =
    presence === "Available"
      ? "bg-emerald-400"
      : presence === "Busy"
      ? "bg-amber-400"
      : "bg-slate-400";

  const isDarkTheme = themeMode === "dark";

  return (
    <div className={`${showAppChrome ? "gc-mobile-shell-active" : ""} gc-theme-${themeMode}`}>
      {backToast && (
        <div className="gc-back-toast">
          <img src="/gurucool-logo.svg" alt="GuruCool" className="w-4 h-4 rounded-full" />
          <span>{backToast}</span>
        </div>
      )}

      {/* FLOATING "← BACK TO HOME" PILL ON /login AND /register */}
      {(pathname === "/login" || pathname === "/register") && (
        <button
          type="button"
          onClick={() => {
            triggerHaptic("LIGHT");
            router.push("/");
          }}
          className="fixed top-4 left-4 z-[9000] inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold shadow-lg backdrop-blur-md transition-all"
        >
          <span>←</span>
          <span>Back to Home</span>
        </button>
      )}

      {/* BROADENED 64PX NATIVE HEADER WITH WORKING THEME SWITCHER & PROFILE AVATAR */}
      {showAppChrome && (
        <header
          className={`gc-ios-topbar ${
            isDarkTheme ? "gc-ios-topbar-dark" : "gc-ios-topbar-light"
          }`}
        >
          <div
            className="flex items-center gap-3 min-w-0 cursor-pointer"
            onClick={() => {
              triggerHaptic("LIGHT");
              router.push(isTeacherRoute ? "/teacher" : "/dashboard");
            }}
          >
            <img
              src="/gurucool-logo.svg"
              alt="GuruCool"
              className="w-10 h-10 rounded-2xl object-cover border border-indigo-400/40 shadow-md flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  GuruCool
                </span>
                <span
                  className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                    isTeacherRoute
                      ? "bg-pink-500/15 text-pink-500"
                      : "bg-indigo-500/15 text-indigo-400"
                  }`}
                >
                  {activeRole}
                </span>
              </div>
              <h1 className="text-base font-black tracking-tight truncate leading-tight">
                {activeTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Working Light / Dark Theme Toggle Button */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className={`h-9 px-3 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 border transition-all ${
                isDarkTheme
                  ? "bg-slate-800/90 text-amber-300 border-slate-700"
                  : "bg-slate-100 text-slate-800 border-slate-200"
              }`}
              aria-label="Toggle Light or Dark Mode"
            >
              <span>{isDarkTheme ? "☀️" : "🌙"}</span>
              <span className="hidden xs:inline">{isDarkTheme ? "Light" : "Dark"}</span>
            </button>

            {/* Role-Accurate Profile Pill */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic("MEDIUM");
                setProfileMenuOpen(prev => !prev);
              }}
              className={`relative flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition-all ${
                isTeacherRoute
                  ? "bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/30"
                  : "bg-indigo-500/15 hover:bg-indigo-500/25 border-indigo-400/30"
              }`}
              aria-label="Open Profile Menu"
            >
              <div
                className={`relative w-8 h-8 rounded-full font-black text-xs flex items-center justify-center overflow-hidden shadow-sm ${
                  isTeacherRoute
                    ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white"
                    : "bg-gradient-to-br from-teal-200 to-emerald-300 text-slate-900"
                }`}
              >
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  avatarInitial
                )}
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${presenceDotColor}`}
                />
              </div>
              <span className="text-xs font-extrabold max-w-[84px] truncate">
                {displayName.split(" ")[0]}
              </span>
              <span className="text-[10px] opacity-70">▾</span>
            </button>
          </div>
        </header>
      )}

      {/* TOP-RIGHT QUICK PROFILE CARD POPOVER */}
      {showAppChrome && profileMenuOpen && (
        <div
          className="fixed inset-0 z-[9500] bg-black/40 backdrop-blur-[2px]"
          onClick={() => setProfileMenuOpen(false)}
        >
          <div
            className="fixed top-[70px] right-3 w-[calc(100vw-24px)] max-w-[330px] rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200/90 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <img src="/gurucool-logo.svg" alt="GuruCool" className="w-6 h-6 rounded-full" />
                <span className="text-sm font-black text-slate-900">GuruCool</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold transition-colors"
                >
                  Sign out
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    router.push(profilePath);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  Full Profile
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div
                className={`relative w-14 h-14 rounded-full font-black text-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
                  isTeacherRoute
                    ? "bg-pink-100 text-pink-700"
                    : "bg-teal-100 text-teal-900"
                }`}
              >
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  avatarInitial
                )}
                <span
                  className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${presenceDotColor}`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black text-slate-900 truncate">{displayName}</h3>
                <p
                  className={`text-[10px] font-extrabold uppercase tracking-widest ${
                    isTeacherRoute ? "text-pink-600" : "text-indigo-600"
                  }`}
                >
                  {isTeacherRoute ? "VERIFIED FACULTY" : "VERIFIED STUDENT"}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{displayEmail}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-2 border border-slate-200/70 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 pl-2">Presence</span>
              <div className="flex items-center gap-1">
                {(["Available", "Busy", "Offline"] as const).map(statusOption => (
                  <button
                    key={statusOption}
                    type="button"
                    onClick={() => {
                      triggerHaptic("LIGHT");
                      setPresence(statusOption);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                      presence === statusOption
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {statusOption === "Available" && "🟢 "}
                    {statusOption === "Busy" && "🟠 "}
                    {statusOption === "Offline" && "⚪ "}
                    {statusOption}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={transitionKey}
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.99 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="gc-fast-viewport"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {showAppChrome && (
        <nav
          className={`gc-ios-tabbar ${
            isDarkTheme ? "gc-ios-tabbar-dark" : "gc-ios-tabbar-light"
          }`}
        >
          {activeTabs.map(tab => {
            const active = isTabActive(tab);
            return (
              <button
                key={tab.href}
                type="button"
                onPointerDown={() => {
                  if (!active) {
                    triggerHaptic("LIGHT");
                    router.push(tab.href);
                  }
                }}
                onClick={() => {
                  if (!active) router.push(tab.href);
                }}
                className={`gc-ios-tab-item ${active ? "active" : ""}`}
              >
                <span className="gc-ios-tab-icon">{tab.icon}</span>
                <span className="gc-ios-tab-label">{tab.label}</span>
                {active && <span className="gc-ios-tab-indicator" />}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
