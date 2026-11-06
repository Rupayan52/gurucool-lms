"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const navItems = [
    { name: "Resolution Center", href: "/teacher/resolution-center", icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" },
    { name: "My Profile", href: "/teacher/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans">
      {/* Sidebar Command Center */}
      <aside className="w-[260px] bg-[#111A2C] text-slate-300 flex flex-col flex-shrink-0 shadow-2xl z-20">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
            <span className="text-[#3B82F6]">Guru</span><span className="text-white">Cool.</span>
            <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider ml-1 shadow-sm">FACULTY</span>
          </h1>
        </div>

        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 ml-2">Command Center</p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? "bg-white/10 text-white shadow-inner" : "hover:bg-white/5 hover:text-slate-100"}`}>
                  <svg className={`w-5 h-5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-5 border-t border-white/5">
          <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
