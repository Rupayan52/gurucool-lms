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
  { href: "/teacher/profile", label: "Profile", icon: "👤" }
];

function triggerTactileFeedback(intensity: "LIGHT" | "MEDIUM" | "HEAVY" = "LIGHT") {
  if (typeof window === "undefined") return;
  try {
    if (navigator.vibrate) {
      navigator.vibrate(intensity === "HEAVY" ? 20 : intensity === "MEDIUM" ? 12 : 6);
    }
  } catch {}
  try {
    const rnBridge = (window as any).ReactNativeWebView;
    if (rnBridge && typeof rnBridge.postMessage === "function") {
      rnBridge.postMessage(JSON.stringify({ type: "HAPTIC", intensity }));
    }
  } catch {}
}

export default function MobileAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const [isMobileView, setIsMobileView] = useState(false);
  const [transitionKey, setTransitionKey] = useState(pathname);
  const [backToast, setBackToast] = useState<string | null>(null);
  const lastBackPressRef = useRef<number>(0);

  const isTeacherRoute = pathname.startsWith("/teacher");
  const isStudentRoute = pathname.startsWith("/dashboard");
  const showAppChrome = isMobileView && (isTeacherRoute || isStudentRoute);

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

  // Subtle tactile ripple on buttons
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const target = (e.target as HTMLElement)?.closest('button, a, [role="button"]') as HTMLElement | null;
      if (!target) return;
      triggerTactileFeedback("LIGHT");

      const rect = target.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height) * 1.25;
      ripple.className = "gc-touch-ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      const prevPos = window.getComputedStyle(target).position;
      if (prevPos === "static") target.style.position = "relative";
      target.style.overflow = "hidden";
      target.appendChild(ripple);
      setTimeout(() => ripple.remove(), 480);
    };

    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  // Hardware Back Button Guard
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.pushState({ gcBackGuard: true, path: pathname }, "", window.location.href);

    const handlePopState = () => {
      triggerTactileFeedback("MEDIUM");
      const rootPath = isTeacherRoute ? "/teacher" : isStudentRoute ? "/dashboard" : "/";
      if (pathname !== rootPath && (isTeacherRoute || isStudentRoute)) {
        router.push(rootPath);
        return;
      }

      const now = Date.now();
      if (now - lastBackPressRef.current < 2200) return;

      lastBackPressRef.current = now;
      setBackToast("Swipe Back again to minimize app");
      window.history.pushState({ gcBackGuard: true }, "", window.location.href);
      setTimeout(() => setBackToast(null), 2000);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname, isTeacherRoute, isStudentRoute, router]);

  useEffect(() => {
    setTransitionKey(pathname);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  const activeTabs = isTeacherRoute ? TEACHER_TABS : STUDENT_TABS;
  const isTabActive = (item: NavItem) => {
    if (item.matchExact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };
  const activeTitle =
    activeTabs.find(t => isTabActive(t))?.label ||
    (isTeacherRoute ? "Faculty Workspace" : "Student Workspace");

  return (
    <div className={showAppChrome ? "gc-mobile-shell-active" : ""}>
      {backToast && (
        <div className="gc-back-toast">
          <img src="/gurucool-logo.svg" alt="GuruCool" className="w-4 h-4 rounded-full" />
          <span>{backToast}</span>
        </div>
      )}

      {/* SUBTLE, UNOBTRUSIVE MOBILE STATUS HEADER (NO BACK OR RELOAD BUTTONS) */}
      {showAppChrome && (
        <header
          className={`gc-ios-topbar ${
            isTeacherRoute ? "gc-ios-topbar-light" : "gc-ios-topbar-dark"
          }`}
        >
          <div className="flex items-center gap-2">
            <img
              src="/gurucool-logo.svg"
              alt="GuruCool"
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-[11px] font-extrabold tracking-tight opacity-80">
              GuruCool
            </span>
            <span className="opacity-30 text-xs">•</span>
            <span className="text-[11px] font-bold opacity-65">{activeTitle}</span>
          </div>

          <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-500/10 opacity-70">
            {isTeacherRoute ? "Faculty" : "Student"}
          </span>
        </header>
      )}

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
