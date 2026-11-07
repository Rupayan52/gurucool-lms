"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [openDoubtsCount, setOpenDoubtsCount] = useState<number>(0);

  useEffect(() => {
    fetch("/api/teacher/profile")
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.teacher) setTeacher(d.teacher);
      })
      .catch(() => {});

    fetch("/api/doubts?role=teacher")
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.doubts) {
          setOpenDoubtsCount(d.doubts.filter((x: any) => x.status === "OPEN").length);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/teacher/dashboard",
      badge: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      name: "Curriculum & Tests",
      href: "/teacher/curriculum",
      badge: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      name: "Doubt Clearing Desk",
      href: "/teacher/doubts",
      badge: openDoubtsCount > 0 ? openDoubtsCount : null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      name: "Resolution Center",
      href: "/teacher/resolution-center",
      badge: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      name: "My Profile",
      href: "/teacher/profile",
      badge: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  const activeNav = navItems.find(item => pathname?.startsWith(item.href)) || navItems[0];

  return (
    <div className="min-h-screen flex bg-[#F4F6F9] font-sans text-slate-900">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#0B0F19] text-white flex flex-col justify-between shrink-0 border-r border-slate-800/80 select-none">
        <div>
          {/* Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center font-black text-white text-sm shadow-md shadow-pink-500/20">
                G
              </div>
              <span className="text-xl font-black tracking-tight">
                <span className="text-blue-400">Guru</span>Cool.
              </span>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md">
              Faculty
            </span>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1.5">
            <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Command Center
            </p>
            {navItems.map(item => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-white border border-pink-500/30 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-pink-400" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== null && (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-pink-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Faculty Card & Sign Out */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {teacher && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center font-black text-xs text-white overflow-hidden shrink-0">
                {teacher.avatarUrl ? (
                  <img src={teacher.avatarUrl} alt={teacher.name} className="w-full h-full object-cover" />
                ) : (
                  teacher.name?.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">Prof. {teacher.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{teacher.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT SHELL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/70 px-8 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-800">
              {activeNav.name}
            </span>
          </div>

          <div className="flex items-center gap-5">
            {teacher && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                  {teacher.avatarUrl ? (
                    <img src={teacher.avatarUrl} alt={teacher.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-xs text-slate-600">
                      {teacher.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                  Hello, Prof. {teacher.name}
                </span>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
