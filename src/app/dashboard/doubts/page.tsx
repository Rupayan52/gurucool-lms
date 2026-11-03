"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function DoubtClearingHub() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("gurucool-theme") as "dark" | "light" | null;
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<"dark" | "light">;
      if (customEvent.detail) setTheme(customEvent.detail);
    };
    window.addEventListener("gurucool-theme-change", handleThemeChange);
    return () => window.removeEventListener("gurucool-theme-change", handleThemeChange);
  }, []);

  const isDark = theme === "dark";

  return (
    <div className={`min-h-full p-8 ${isDark ? "bg-[#1F1F23] text-white" : "bg-white text-slate-900"}`}>
      <div className="max-w-5xl mx-auto">
        <div className={`pb-5 mb-8 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <h1 className="text-2xl font-black tracking-tight mb-2">Doubt Clearing Hub</h1>
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Post a detailed question to trigger an AI review and receive a 1-on-1 FFMUC meeting link from your faculty.
          </p>
        </div>
        
        <div className={`rounded-xl p-10 text-center border ${isDark ? "bg-[#29282E] border-white/10" : "bg-slate-50 border-slate-200"}`}>
          <div className="w-14 h-14 bg-[#5B5FC7]/15 border border-[#7B83EB]/30 rounded-full flex items-center justify-center text-[#7B83EB] mx-auto mb-4">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <h2 className="text-lg font-bold mb-2">No Active Doubts</h2>
          <p className={`text-sm mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Start a new thread to get help from your instructors.</p>
          <button className="bg-[#5B5FC7] hover:bg-[#4E52B5] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 shadow">
            Post a New Doubt
          </button>
        </div>
      </div>
    </div>
  );
}
