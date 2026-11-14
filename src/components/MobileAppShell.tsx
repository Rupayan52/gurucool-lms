"use client";
import React, { useEffect, useState } from "react";
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
  { href: "/teacher/profile", label: "Roster", icon: "🏛️" }
];

export default function MobileAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const [isMobileView, setIsMobileView] = useState(false);
  const [transitionKey, setTransitionKey] = useState(pathname);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [knownVersion, setKnownVersion] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const isTeacherRoute = pathname.startsWith("/teacher");
  const isStudentRoute = pathname.startsWith("/dashboard");
  const showAppChrome = isMobileView && (isTeacherRoute || isStudentRoute);

  useEffect(() => {
    const checkViewport = () => {
      const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|wv/i.test(
        ua
      );
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

  useEffect(() => {
    setTransitionKey(pathname);
    setDrawerOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  useEffect(() => {
    let mounted = true;
    const checkLiveVersion = async () => {
      try {
        const res = await fetch(`/api/app/version?t=${Date.now()}`, {
          cache: "no-store"
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted || !data?.version) return;

        setKnownVersion(prev => {
          if (prev && prev !== data.version) {
            setUpdateAvailable(true);
          }
          return prev || data.version;
        });
      } catch {}
    };

    checkLiveVersion();
    const interval = setInterval(checkLiveVersion, 20000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkLiveVersion();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const handleLiveReload = () => {
    setSyncing(true);
    setUpdateAvailable(false);
    router.refresh();
    setTimeout(() => {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("_sync", String(Date.now()));
        window.location.replace(url.pathname);
      }
    }, 220);
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  };

  const activeTabs = isTeacherRoute ? TEACHER_TABS : STUDENT_TABS;
  const isTabActive = (item: NavItem) => {
    if (item.matchExact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };
  const activeTitle =
    activeTabs.find(t => isTabActive(t))?.label ||
    (isTeacherRoute ? "Faculty Studio" : "GuruCool Hub");

  return (
    <div className={showAppChrome ? "gc-mobile-shell-active" : ""}>
      {updateAvailable && (
        <div className="gc-ios-dynamic-island" onClick={handleLiveReload}>
          <span className="gc-live-dot" />
          <span>New Live Update Deployed • Tap to Sync Now ↻</span>
        </div>
      )}

      {showAppChrome && (
        <header
          className={`gc-ios-topbar ${
            isTeacherRoute ? "gc-ios-topbar-light" : "gc-ios-topbar-dark"
          }`}
        >
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="gc-ios-icon-btn"
          >
            ☰
          </button>
          <div className="gc-ios-topbar-center">
            <span className="gc-ios-brand-pill">
              {isTeacherRoute ? "FACULTY" : "STUDENT"}
            </span>
            <h1 className="gc-ios-topbar-title">{activeTitle}</h1>
          </div>
          <button
            type="button"
            onClick={handleLiveReload}
            className={`gc-ios-icon-btn ${syncing ? "gc-spin" : ""}`}
          >
            ↻
          </button>
        </header>
      )}

      {showAppChrome && drawerOpen && (
        <div className="gc-ios-sheet-backdrop" onClick={() => setDrawerOpen(false)}>
          <div
            className={`gc-ios-sheet ${
              isTeacherRoute ? "gc-ios-sheet-light" : "gc-ios-sheet-dark"
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="gc-ios-sheet-handle" />
            <div className="gc-ios-sheet-header">
              <div>
                <p className="gc-ios-sheet-overline">GURUCOOL NATIVE APP</p>
                <h2 className="gc-ios-sheet-title">
                  {isTeacherRoute ? "Faculty Command Center" : "Student Learning Hub"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="gc-ios-close-btn"
              >
                ✕
              </button>
            </div>
            <div className="gc-ios-sheet-grid">
              {activeTabs.map(tab => (
                <button
                  key={tab.href}
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push(tab.href);
                  }}
                  className={`gc-ios-sheet-card ${isTabActive(tab) ? "active" : ""}`}
                >
                  <span className="gc-ios-sheet-emoji">{tab.icon}</span>
                  <span className="gc-ios-sheet-label">{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="gc-ios-sheet-actions">
              <button type="button" onClick={handleLiveReload} className="gc-ios-action-sync">
                ↻ Force Live Cloud Sync
              </button>
              <button type="button" onClick={handleSignOut} className="gc-ios-action-logout">
                Sign Out of Account
              </button>
            </div>
          </div>
        </div>
      )}

      <div key={transitionKey} className="gc-ios-page-transition">
        {children}
      </div>

      {showAppChrome && (
        <nav
          className={`gc-ios-tabbar ${
            isTeacherRoute ? "gc-ios-tabbar-light" : "gc-ios-tabbar-dark"
          }`}
        >
          {activeTabs.map(tab => {
            const active = isTabActive(tab);
            return (
              <button
                key={tab.href}
                type="button"
                onClick={() => router.push(tab.href)}
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
