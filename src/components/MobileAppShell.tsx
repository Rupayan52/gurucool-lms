"use client";
import React, { useEffect, useRef, useState } from "react";
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

// Synthesize subtle iOS Taptic Click + Physical Vibration
function triggerTactileFeedback(intensity: "LIGHT" | "MEDIUM" | "HEAVY" = "LIGHT") {
  if (typeof window === "undefined") return;

  try {
    if (navigator.vibrate) {
      navigator.vibrate(intensity === "HEAVY" ? 22 : intensity === "MEDIUM" ? 14 : 8);
    }
  } catch {}

  try {
    const rnBridge = (window as any).ReactNativeWebView;
    if (rnBridge && typeof rnBridge.postMessage === "function") {
      rnBridge.postMessage(JSON.stringify({ type: "HAPTIC", intensity }));
    }
  } catch {}

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx: AudioContext =
      (window as any).__gcAudioCtx || ((window as any).__gcAudioCtx = new AudioCtx());
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(intensity === "HEAVY" ? 190 : 155, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.018);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.02);
  } catch {}
}

export default function MobileAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const [isMobileView, setIsMobileView] = useState(false);
  const [transitionKey, setTransitionKey] = useState(pathname);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [knownVersion, setKnownVersion] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [backToast, setBackToast] = useState<string | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  const lastBackPressRef = useRef<number>(0);
  const touchStartYRef = useRef<number | null>(null);

  const isTeacherRoute = pathname.startsWith("/teacher");
  const isStudentRoute = pathname.startsWith("/dashboard");
  const showAppChrome = isMobileView && (isTeacherRoute || isStudentRoute);

  // 1. Detect mobile screen or WebView User-Agent
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

  // 2. Global Tactile Ripple & Haptic Listener on Every Interactive Element
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        'button, a, [role="button"], input, select, textarea, .gc-tactile-card'
      ) as HTMLElement | null;

      if (!target) return;

      triggerTactileFeedback("LIGHT");

      // Spawn expanding touch ripple inside buttons & links
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.getAttribute("role") === "button"
      ) {
        const rect = target.getBoundingClientRect();
        const ripple = document.createElement("span");
        const size = Math.max(rect.width, rect.height) * 1.35;
        ripple.className = "gc-touch-ripple";
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

        const prevPos = window.getComputedStyle(target).position;
        if (prevPos === "static") {
          target.style.position = "relative";
        }
        target.style.overflow = "hidden";
        target.appendChild(ripple);
        setTimeout(() => {
          ripple.remove();
        }, 520);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  // 3. Hardware Back Button Guard — Prevents Pressing Back from Exiting the App!
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Push a guard state so pressing Back stays inside the web app
    window.history.pushState({ gcBackGuard: true, path: pathname }, "", window.location.href);

    const handlePopState = () => {
      triggerTactileFeedback("MEDIUM");

      if (drawerOpen) {
        setDrawerOpen(false);
        window.history.pushState({ gcBackGuard: true }, "", window.location.href);
        return;
      }

      const rootPath = isTeacherRoute ? "/teacher" : isStudentRoute ? "/dashboard" : "/";
      if (pathname !== rootPath && (isTeacherRoute || isStudentRoute)) {
        router.push(rootPath);
        return;
      }

      const now = Date.now();
      if (now - lastBackPressRef.current < 2200) {
        // Allow exit only if user intentionally double-presses Back within 2 seconds on root screen
        return;
      }

      lastBackPressRef.current = now;
      setBackToast("Press Back again to minimize app");
      window.history.pushState({ gcBackGuard: true }, "", window.location.href);
      setTimeout(() => setBackToast(null), 2200);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname, drawerOpen, isTeacherRoute, isStudentRoute, router]);

  // 4. Pull-Down-to-Refresh Tactile Gesture at Top of Page
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY <= 4) {
        touchStartYRef.current = e.touches[0].clientY;
      } else {
        touchStartYRef.current = null;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartYRef.current === null || window.scrollY > 4) return;
      const deltaY = e.touches[0].clientY - touchStartYRef.current;
      if (deltaY > 15) {
        const damped = Math.min(95, Math.round(deltaY * 0.42));
        if (damped >= 70 && pullDistance < 70) {
          triggerTactileFeedback("MEDIUM");
        }
        setPullDistance(damped);
      }
    };

    const onTouchEnd = () => {
      if (pullDistance >= 70) {
        triggerTactileFeedback("HEAVY");
        handleLiveReload();
      }
      setPullDistance(0);
      touchStartYRef.current = null;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pullDistance]);

  // 5. Route transition scroll-top reset
  useEffect(() => {
    setTransitionKey(pathname);
    setDrawerOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  // 6. Live OTA Deployment Poller
  useEffect(() => {
    let mounted = true;
    const checkLiveVersion = async () => {
      try {
        const res = await fetch(`/api/app/version?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted || !data?.version) return;

        setKnownVersion(prev => {
          if (prev && prev !== data.version) {
            setUpdateAvailable(true);
            triggerTactileFeedback("MEDIUM");
          }
          return prev || data.version;
        });
      } catch {}
    };

    checkLiveVersion();
    const interval = setInterval(checkLiveVersion, 18000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLiveReload = () => {
    triggerTactileFeedback("HEAVY");
    setSyncing(true);
    setUpdateAvailable(false);
    router.refresh();
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }, 200);
  };

  const handleSignOut = async () => {
    triggerTactileFeedback("HEAVY");
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
    (isTeacherRoute ? "Faculty Studio" : "GnOvATech Hub");

  const rootDashboardPath = isTeacherRoute ? "/teacher" : "/dashboard";
  const canNavigateUp =
    (isTeacherRoute || isStudentRoute) && pathname !== rootDashboardPath;

  return (
    <div className={showAppChrome ? "gc-mobile-shell-active" : ""}>
      {/* PULL-TO-REFRESH INDICATOR */}
      {pullDistance > 18 && (
        <div
          className="gc-pull-indicator"
          style={{ transform: `translate(-50%, ${pullDistance - 35}px)` }}
        >
          <img
            src="/gnovatech-logo.svg"
            alt="GAT"
            className={`gc-pull-logo ${pullDistance >= 70 ? "gc-spin" : ""}`}
          />
          <span>
            {pullDistance >= 70 ? "Release to Live Sync..." : "Pull down to refresh"}
          </span>
        </div>
      )}

      {/* BACK GUARD TOAST PILL */}
      {backToast && (
        <div className="gc-back-toast">
          <img src="/gnovatech-logo.svg" alt="GAT" className="w-5 h-5 rounded-full" />
          <span>{backToast}</span>
        </div>
      )}

      {/* DYNAMIC ISLAND OTA UPDATE PILL */}
      {updateAvailable && (
        <div className="gc-ios-dynamic-island" onClick={handleLiveReload}>
          <span className="gc-live-dot" />
          <span>New Live Update Ready • Tap to Apply ↻</span>
        </div>
      )}

      {/* iOS TOP BAR WITH GAT - HOUSE OF GNOVATECH EMBLEM */}
      {showAppChrome && (
        <header
          className={`gc-ios-topbar ${
            isTeacherRoute ? "gc-ios-topbar-light" : "gc-ios-topbar-dark"
          }`}
        >
          <div className="flex items-center gap-2">
            {canNavigateUp ? (
              <button
                type="button"
                onClick={() => {
                  triggerTactileFeedback("MEDIUM");
                  router.push(rootDashboardPath);
                }}
                className="gc-ios-icon-btn"
                aria-label="Go Back"
              >
                ←
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  triggerTactileFeedback("MEDIUM");
                  setDrawerOpen(true);
                }}
                className="gc-ios-icon-btn"
                aria-label="Open Menu"
              >
                ☰
              </button>
            )}
          </div>

          <div
            className="gc-ios-topbar-center"
            onClick={() => {
              triggerTactileFeedback("LIGHT");
              setDrawerOpen(true);
            }}
          >
            <img
              src="/gnovatech-logo.svg"
              alt="House of GnOvATech"
              className="gc-gat-avatar"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="gc-ios-brand-pill">GnOvATech</span>
                <h1 className="gc-ios-topbar-title">{activeTitle}</h1>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLiveReload}
            className={`gc-ios-icon-btn ${syncing ? "gc-spin" : ""}`}
            aria-label="Sync Live"
          >
            ↻
          </button>
        </header>
      )}

      {/* iOS BOTTOM SHEET DRAWER WITH HOUSE OF GNOVATECH BRANDING */}
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
              <div className="flex items-center gap-3">
                <img
                  src="/gnovatech-logo.svg"
                  alt="House of GnOvATech"
                  className="w-12 h-12 rounded-2xl shadow-md border border-amber-400/40"
                />
                <div>
                  <p className="gc-ios-sheet-overline">
                    HOUSE OF GNOVATECH • AI • INNOVATE • ELEVATE
                  </p>
                  <h2 className="gc-ios-sheet-title">
                    {isTeacherRoute ? "Faculty Command Center" : "Student Learning Hub"}
                  </h2>
                </div>
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
                    triggerTactileFeedback("MEDIUM");
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
                ↻ Sync Latest Cloud Updates
              </button>
              <button type="button" onClick={handleSignOut} className="gc-ios-action-logout">
                Sign Out of Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGE CONTENT CONTAINER (NO TRANSFORM TRAP SO SCROLLING IS 100% SMOOTH) */}
      <div key={transitionKey} className="gc-ios-page-transition">
        {children}
      </div>

      {/* iOS FROSTED BOTTOM TAB BAR */}
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
                onClick={() => {
                  triggerTactileFeedback("MEDIUM");
                  router.push(tab.href);
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
