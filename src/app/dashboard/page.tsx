"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AIMetrics {
  studyVelocityHours: number | null;
  velocityVsLastWeek: number | null;
  assessmentAccuracy: number | null;
  accuracyPercentile: string | null;
  aiSuggestionTitle: string | null;
  aiSuggestionText: string | null;
}

interface LiveSession {
  id: string;
  title: string;
  faculty: string;
  scheduledTime: string;
  meetUrl: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [sessions, setSessions] = useState<LiveSession[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Overview" | "Shared" | "Recap">("Overview");
  const [quickDoubt, setQuickDoubt] = useState("");
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [metricsRes, sessionsRes] = await Promise.all([
          fetch("/api/student/metrics").catch(() => null),
          fetch("/api/student/sessions").catch(() => null),
        ]);

        if (metricsRes?.ok) {
          setMetrics(await metricsRes.json());
        } else {
          setMetrics({
            studyVelocityHours: null,
            velocityVsLastWeek: null,
            assessmentAccuracy: null,
            accuracyPercentile: null,
            aiSuggestionTitle: null,
            aiSuggestionText: null,
          });
        }

        if (sessionsRes?.ok) {
          setSessions(await sessionsRes.json());
        } else {
          setSessions([]);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const isDark = theme === "dark";

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const handleQuickDoubtSubmit = () => {
    if (!quickDoubt.trim()) return;
    router.push("/dashboard/forum");
  };

  return (
    <div
      className={`min-h-full flex flex-col justify-between transition-colors duration-200 ${
        isDark ? "bg-[#1F1F23] text-[#E1DFDD]" : "bg-[#F8F9FA] text-slate-900"
      }`}
    >
      {/* ================= TEAMS WORKSPACE TOP HEADER ================= */}
      <div>
        <div
          className={`h-14 border-b px-6 flex items-center justify-between sticky top-0 backdrop-blur-md z-30 transition-colors ${
            isDark
              ? "bg-[#1F1F23]/90 border-white/[0.08]"
              : "bg-white/90 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-4 h-full">
            <div className="w-8 h-8 rounded-full bg-[#5B5FC7]/20 border border-[#7B83EB]/40 flex items-center justify-center text-[#7B83EB] font-black text-xs">
              AI
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                AI Insights & Mastery
              </h1>
              <span
                className={`hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${
                  isDark
                    ? "bg-white/10 text-slate-300 border-white/10"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                Student Workspace
              </span>
            </div>

            {/* Teams Channel Tabs */}
            <div className="hidden md:flex items-center gap-5 ml-4 h-full text-xs font-semibold">
              {(["Overview", "Shared", "Recap"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`h-full flex items-center border-b-2 transition-colors ${
                    activeTab === tab
                      ? isDark
                        ? "border-[#7B83EB] text-white"
                        : "border-[#5B5FC7] text-[#5B5FC7]"
                      : isDark
                      ? "border-transparent text-slate-400 hover:text-slate-200"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Right Quick Actions: My Learning Player + Request 1-on-1 Meet */}
          <div className="flex items-center gap-2.5">
            <span className={`hidden xl:inline-block text-xs mr-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {today}
            </span>

            {/* SHIFTED MY LEARNING PLAYER BUTTON */}
            <Link
              href="/dashboard/player"
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-2 border transition-all active:scale-95 shadow-sm ${
                isDark
                  ? "bg-[#29282E] hover:bg-[#34333B] text-white border-white/15"
                  : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300"
              }`}
            >
              <svg className="w-3.5 h-3.5 text-[#7B83EB]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>My Learning Player</span>
            </Link>

            <Link
              href="/dashboard/forum"
              className="bg-[#5B5FC7] hover:bg-[#4E52B5] text-white text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Request 1-on-1 Meet</span>
            </Link>
          </div>
        </div>

        {/* ================= MAIN WORKSPACE CONTENT ================= */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Date Divider Line */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`h-[1px] flex-1 ${isDark ? "bg-white/[0.07]" : "bg-slate-200"}`}></div>
            <span className={`text-[11px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Your learning trajectory, quantified • {today}
            </span>
            <div className={`h-[1px] flex-1 ${isDark ? "bg-white/[0.07]" : "bg-slate-200"}`}></div>
          </div>

          {activeTab === "Overview" && (
            <>
              {/* ================= METRICS GRID ================= */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                {/* Card 1: Study Velocity */}
                <div
                  className={`rounded-2xl p-6 border shadow-lg hover:-translate-y-1 hover:border-[#7B83EB]/40 transition-all duration-300 relative overflow-hidden group ${
                    isDark
                      ? "bg-[#29282E] border-white/[0.06]"
                      : "bg-white border-slate-200/80"
                  }`}
                >
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Study Velocity
                  </h3>

                  <div className="flex items-baseline gap-1.5 relative z-10">
                    <span
                      className={`text-5xl leading-none font-black tracking-tight ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {isLoading ? (
                        <span className="h-11 w-20 bg-slate-500/20 rounded-lg animate-pulse inline-block"></span>
                      ) : (
                        metrics?.studyVelocityHours ?? "--"
                      )}
                    </span>
                    {!isLoading && (
                      <span className="text-lg font-bold text-slate-400">hrs</span>
                    )}
                  </div>

                  <div className="mt-5 relative z-10">
                    {!isLoading && metrics?.velocityVsLastWeek !== null ? (
                      <span className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 text-[11px] font-bold px-3 py-1 rounded uppercase tracking-wider">
                        +{metrics?.velocityVsLastWeek}% vs last week
                      </span>
                    ) : !isLoading ? (
                      <Link
                        href="/dashboard/player"
                        className={`inline-block border text-[11px] font-bold px-3 py-1 rounded uppercase tracking-wider transition-colors ${
                          isDark
                            ? "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                        }`}
                      >
                        Awaiting Data • Launch Player
                      </Link>
                    ) : null}
                  </div>

                  <div
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
                      isDark ? "text-white/[0.03] group-hover:text-white/[0.06]" : "text-slate-100"
                    }`}
                  >
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0012 4c-4.97 0-9 4.03-9 9s4.02 9 9 9a8.994 8.994 0 007.03-14.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                    </svg>
                  </div>
                </div>

                {/* Card 2: Assessment Accuracy */}
                <div
                  className={`rounded-2xl p-6 border shadow-lg hover:-translate-y-1 hover:border-[#7B83EB]/40 transition-all duration-300 relative overflow-hidden group ${
                    isDark
                      ? "bg-[#29282E] border-white/[0.06]"
                      : "bg-white border-slate-200/80"
                  }`}
                >
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Assessment Accuracy
                  </h3>

                  <div className="flex items-baseline gap-1.5 relative z-10">
                    <span
                      className={`text-5xl leading-none font-black tracking-tight ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {isLoading ? (
                        <span className="h-11 w-20 bg-slate-500/20 rounded-lg animate-pulse inline-block"></span>
                      ) : (
                        metrics?.assessmentAccuracy ?? "--"
                      )}
                    </span>
                    {!isLoading && (
                      <span className="text-lg font-bold text-slate-400">%</span>
                    )}
                  </div>

                  <div className="mt-5 relative z-10">
                    {!isLoading && metrics?.accuracyPercentile !== null ? (
                      <span className="bg-[#5B5FC7]/20 text-[#9EA2FF] border border-[#7B83EB]/30 text-[11px] font-bold px-3 py-1 rounded uppercase tracking-wider">
                        {metrics?.accuracyPercentile}
                      </span>
                    ) : !isLoading ? (
                      <Link
                        href="/dashboard/player"
                        className={`inline-block border text-[11px] font-bold px-3 py-1 rounded uppercase tracking-wider transition-colors ${
                          isDark
                            ? "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                        }`}
                      >
                        Take a quiz
                      </Link>
                    ) : null}
                  </div>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7B83EB]/[0.08] group-hover:text-[#7B83EB]/[0.15] transition-colors pointer-events-none">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  </div>
                </div>

                {/* Card 3: GuruAI Suggestion */}
                <div className="bg-gradient-to-br from-[#2B2640] to-[#1D192B] rounded-2xl p-6 border border-[#7B83EB]/30 shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center text-white">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#9EA2FF] mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#7B83EB] animate-pulse"></span>
                    GURUAI SUGGESTION
                  </h3>

                  {isLoading ? (
                    <div className="space-y-2.5 mt-2">
                      <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse"></div>
                      <div className="h-3.5 w-full bg-white/10 rounded animate-pulse"></div>
                      <div className="h-3.5 w-5/6 bg-white/10 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-lg font-bold mb-1.5 text-white leading-snug">
                        {metrics?.aiSuggestionTitle || "Analyzing Study Patterns..."}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {metrics?.aiSuggestionText ||
                          "GuruAI requires more quiz data and watch time to generate a customized learning path for you."}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* ================= SESSIONS SECTION ================= */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    Upcoming Live Concierge Sessions
                  </h2>
                  <span className="text-xs text-slate-400">
                    Synced with FFMUC Video Engine
                  </span>
                </div>

                <div
                  className={`rounded-2xl p-8 border shadow-lg flex flex-col items-center justify-center min-h-[260px] text-center ${
                    isDark
                      ? "bg-[#29282E] border-white/[0.06]"
                      : "bg-white border-slate-200/80"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-500/10 rounded-2xl animate-pulse"></div>
                      <div className="h-5 w-44 bg-slate-500/10 rounded animate-pulse"></div>
                      <div className="h-3.5 w-60 bg-slate-500/10 rounded animate-pulse"></div>
                    </div>
                  ) : sessions && sessions.length > 0 ? (
                    <div className="w-full flex flex-col gap-3">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                            isDark
                              ? "bg-[#1F1F23] border-white/10 hover:border-[#7B83EB]/50"
                              : "bg-slate-50 border-slate-200 hover:border-[#5B5FC7]"
                          }`}
                        >
                          <div className="text-left">
                            <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                              {session.title}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {session.faculty} • {session.scheduledTime}
                            </p>
                          </div>
                          <button
                            onClick={() => window.open(session.meetUrl, "_blank")}
                            className="bg-[#5B5FC7] hover:bg-[#4E52B5] text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider active:scale-95 transition-all shadow"
                          >
                            Join Meet
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto">
                      <div className="w-14 h-14 bg-[#5B5FC7]/15 border border-[#7B83EB]/30 rounded-2xl flex items-center justify-center text-[#7B83EB] mx-auto mb-4">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className={`text-base font-bold mb-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                        No Live Mentorships Scheduled
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-5">
                        Submit a doubt in the Expert Helpdesk or Course Hubs to trigger an instant 1-on-1 video breakdown.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link
                          href="/dashboard/forum"
                          className={`inline-flex items-center gap-2 border px-5 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                            isDark
                              ? "bg-[#322C4B] hover:bg-[#3E375C] text-white border-[#7B83EB]/40"
                              : "bg-[#5B5FC7] hover:bg-[#4E52B5] text-white border-transparent"
                          }`}
                        >
                          Open Course Hubs
                        </Link>
                        <Link
                          href="/dashboard/player"
                          className={`inline-flex items-center gap-2 border px-5 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                            isDark
                              ? "bg-white/5 hover:bg-white/10 text-slate-200 border-white/15"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                          }`}
                        >
                          Open Learning Player
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "Shared" && (
            <div
              className={`rounded-2xl p-10 border text-center ${
                isDark ? "bg-[#29282E] border-white/[0.06]" : "bg-white border-slate-200"
              }`}
            >
              <h3 className={`text-base font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                Shared Study Materials & Notes
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Lecture slides, PDFs, and faculty whiteboards shared during live broadcasts appear here.
              </p>
              <Link
                href="/dashboard/player"
                className="inline-flex items-center gap-2 bg-[#5B5FC7] hover:bg-[#4E52B5] text-white px-5 py-2 rounded-lg text-xs font-semibold transition-all"
              >
                Go to Learning Player
              </Link>
            </div>
          )}

          {activeTab === "Recap" && (
            <div
              className={`rounded-2xl p-10 border text-center ${
                isDark ? "bg-[#29282E] border-white/[0.06]" : "bg-white border-slate-200"
              }`}
            >
              <h3 className={`text-base font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                Session Recaps & AI Summaries
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Completed 1-on-1 doubt sessions and recorded FFMUC lectures will be indexed here automatically.
              </p>
              <Link
                href="/dashboard/forum"
                className="inline-flex items-center gap-2 bg-[#5B5FC7] hover:bg-[#4E52B5] text-white px-5 py-2 rounded-lg text-xs font-semibold transition-all"
              >
                Request a Session in Course Hubs
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ================= TEAMS MESSAGE / QUICK DOUBT BAR ================= */}
      <div className="px-6 pb-5 pt-2">
        <div
          className={`max-w-6xl mx-auto border focus-within:border-[#7B83EB] rounded-lg px-4 py-2.5 flex items-center justify-between transition-colors ${
            isDark
              ? "bg-[#29282E] border-white/10"
              : "bg-white border-slate-300 shadow-sm"
          }`}
        >
          <input
            type="text"
            value={quickDoubt}
            onChange={(e) => setQuickDoubt(e.target.value)}
            placeholder="Type a quick doubt or question to post in Course Hubs..."
            className={`w-full bg-transparent text-xs focus:outline-none ${
              isDark ? "text-white placeholder-slate-400" : "text-slate-900 placeholder-slate-400"
            }`}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQuickDoubtSubmit();
            }}
          />
          <div className="flex items-center gap-3 text-slate-400 pl-3 border-l border-white/10">
            <button
              onClick={handleQuickDoubtSubmit}
              className="hover:text-[#7B83EB] transition-colors"
              title="Send to Hubs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
