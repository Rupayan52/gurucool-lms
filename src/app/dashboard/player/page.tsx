"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function LearningPlayerPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("gurucool-theme") as "dark" | "light" | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<"dark" | "light">;
      if (customEvent.detail) setTheme(customEvent.detail);
    };
    window.addEventListener("gurucool-theme-change", handleThemeChange);
    return () => window.removeEventListener("gurucool-theme-change", handleThemeChange);
  }, []);

  const isDark = theme === "dark";

  const launchLiveRoom = () => {
    window.open(
      "https://meet.ffmuc.net/GuruCoolLiveBroadcastRoom#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div
      className={`min-h-full p-6 sm:p-8 transition-colors duration-200 ${
        isDark ? "bg-[#1F1F23] text-[#E1DFDD]" : "bg-[#F8F9FA] text-slate-900"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#7B83EB] uppercase tracking-wider mb-1">
              <span>Phygital Classroom</span>
              <span>•</span>
              <span>FFMUC Stream Engine</span>
            </div>
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              My Learning Player
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                isDark
                  ? "bg-[#29282E] border-white/10 text-slate-200 hover:bg-[#323139]"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              ← Back to AI Insights
            </Link>
            <button
              onClick={launchLiveRoom}
              className="bg-[#5B5FC7] hover:bg-[#4E52B5] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow transition-all active:scale-95"
            >
              Pop-Out Live Stream
            </button>
          </div>
        </div>

        {/* Main Video Stage + Module Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <div className="aspect-video rounded-2xl bg-black border border-white/10 shadow-2xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-[#5B5FC7]/20 border border-[#7B83EB]/50 flex items-center justify-center text-[#9EA2FF] mb-4">
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">
                Ready for Live Broadcast or Recorded VOD
              </h2>
              <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                Select an enrolled module from the Course Catalog or join the active faculty broadcast room directly.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={launchLiveRoom}
                  className="bg-[#5B5FC7] hover:bg-[#4E52B5] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
                >
                  Join Active Broadcast
                </button>
                <Link
                  href="/dashboard/catalog"
                  className="bg-white/10 hover:bg-white/15 text-white border border-white/15 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Browse Course Catalog
                </Link>
              </div>
            </div>
          </div>

          {/* Right Panel: Active Curriculum */}
          <div
            className={`rounded-2xl p-6 border flex flex-col justify-between ${
              isDark ? "bg-[#29282E] border-white/10" : "bg-white border-slate-200"
            }`}
          >
            <div>
              <h3 className={`text-sm font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                Active Learning Queue
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Your real-time watch progress syncs directly with Study Velocity on your dashboard.
              </p>

              <div
                className={`p-4 rounded-xl border text-center my-8 ${
                  isDark ? "bg-[#1F1F23] border-white/5" : "bg-slate-50 border-slate-200"
                }`}
              >
                <p className="text-xs font-semibold text-slate-400 mb-3">
                  No enrolled VOD modules queued yet.
                </p>
                <Link
                  href="/dashboard/catalog"
                  className="inline-block text-xs font-bold text-[#7B83EB] hover:underline"
                >
                  Enroll via Course Catalog →
                </Link>
              </div>
            </div>

            <Link
              href="/dashboard/forum"
              className="w-full py-2.5 rounded-xl bg-[#5B5FC7]/15 border border-[#7B83EB]/30 text-[#9EA2FF] text-xs font-bold text-center hover:bg-[#5B5FC7]/25 transition-colors"
            >
              Ask a Doubt in Course Hubs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
