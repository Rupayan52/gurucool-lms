"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

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
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [sessions, setSessions] = useState<LiveSession[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Overview" | "Shared" | "Recap">("Overview");

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
          // STRICT PRODUCTION STATE: Zero fake numbers
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

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-full bg-[#1F1F23] text-[#E1DFDD] flex flex-col justify-between">
      
      {/* ================= TEAMS WORKSPACE TOP HEADER ================= */}
      <div>
        <div className="h-14 border-b border-white/[0.08] px-6 flex items-center justify-between sticky top-0 bg-[#1F1F23]/90 backdrop-blur-md z-30">
          <div className="flex items-center gap-4 h-full">
            <div className="w-8 h-8 rounded-full bg-[#5B5FC7]/20 border border-[#7B83EB]/40 flex items-center justify-center text-[#7B83EB] font-black text-xs">
              AI
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-bold text-white tracking-tight">
                AI Insights & Mastery
              </h1>
              <span className="text-[10px] font-semibold bg-white/10 text-slate-300 px-2 py-0.5 rounded border border-white/10">
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
                      ? "border-[#7B83EB] text-white"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Right Quick Actions (Video & Helpdesk) */}
          <div className="flex items-center gap-3">
            <span className="hidden lg:inline-block text-xs text-slate-400 mr-2">
              {today}
            </span>
            <Link
              href="/dashboard/forum"
              className="bg-[#5B5FC7] hover:bg-[#4E52B5] text-white text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Request 1-on-1 Meet
            </Link>
          </div>
        </div>

        {/* ================= MAIN WORKSPACE CONTENT ================= */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          
          {/* Date Divider Line (Teams Chat Style) */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] flex-1 bg-white/[0.07]"></div>
            <span className="text-[11px] font-medium text-slate-400">
              Your learning trajectory, quantified • {today}
            </span>
            <div className="h-[1px] flex-1 bg-white/[0.07]"></div>
          </div>

          {/* ================= METRICS GRID ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            
            {/* Card 1: Study Velocity */}
            <div className="bg-[#29282E] rounded-2xl p-6 border border-white/[0.06] shadow-lg hover:-translate-y-1 hover:border-[#7B83EB]/40 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] relative overflow-hidden group">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Study Velocity
              </h3>

              <div className="flex items-baseline gap-1.5 relative z-10">
                <span className="text-5xl leading-none font-black tracking-tight text-white">
                  {isLoading ? (
                    <span className="h-11 w-20 bg-white/10 rounded-lg animate-pulse inline-block"></span>
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
                  <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold px-3 py-1 rounded uppercase tracking-wider">
                    +{metrics?.velocityVsLastWeek}% vs last week
                  </span>
                ) : !isLoading ? (
                  <span className="bg-white/5 text-slate-400 border border-white/10 text-[11px] font-bold px-3 py-1 rounded uppercase tracking-wider">
                    Awaiting Data
                  </span>
                ) : null}
              </div>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/[0.03] group-hover:text-white/[0.06] transition-colors pointer-events-none">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0012 4c-4.97 0-9 4.03-9 9s4.02 9 9 9a8.994 8.994 0 007.03-14.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                </svg>
              </div>
            </div>

            {/* Card 2: Assessment Accuracy */}
            <div className="bg-[#29282E] rounded-2xl p-6 border border-white/[0.06] shadow-lg hover:-translate-y-1 hover:border-[#7B83EB]/40 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] relative overflow-hidden group">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Assessment Accuracy
              </h3>

              <div className="flex items-baseline gap-1.5 relative z-10">
                <span className="text-5xl leading-none font-black tracking-tight text-white">
                  {isLoading ? (
                    <span className="h-11 w-20 bg-white/10 rounded-lg animate-pulse inline-block"></span>
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
                  <span className="bg-white/5 text-slate-400 border border-white/10 text-[11px] font-bold px-3 py-1 rounded uppercase tracking-wider">
                    Take a quiz
                  </span>
                ) : null}
              </div>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7B83EB]/[0.05] group-hover:text-[#7B83EB]/[0.1] transition-colors pointer-events-none">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              </div>
            </div>

            {/* Card 3: GuruAI Suggestion (Teams Purple Accent Card) */}
            <div className="bg-gradient-to-br from-[#2B2640] to-[#1D192B] rounded-2xl p-6 border border-[#7B83EB]/30 shadow-lg hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex flex-col justify-center">
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
              <h2 className="text-lg font-bold tracking-tight text-white">
                Upcoming Live Concierge Sessions
              </h2>
              <span className="text-xs text-slate-400">
                Synced with FFMUC Video Engine
              </span>
            </div>

            <div className="bg-[#29282E] rounded-2xl p-8 border border-white/[0.06] shadow-lg flex flex-col items-center justify-center min-h-[260px] text-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl animate-pulse"></div>
                  <div className="h-5 w-44 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-3.5 w-60 bg-white/5 rounded animate-pulse"></div>
                </div>
              ) : sessions && sessions.length > 0 ? (
                <div className="w-full flex flex-col gap-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-[#1F1F23] rounded-xl border border-white/10 hover:border-[#7B83EB]/50 transition-colors"
                    >
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-white">
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
                  <div className="w-14 h-14 bg-[#5B5FC7]/15 border border-[#7B83EB]/30 rounded-2xl flex items-center justify-center text-[#9EA2FF] mx-auto mb-4">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">
                    No Live Mentorships Scheduled
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-5">
                    Submit a doubt in the Expert Helpdesk or Course Hubs to trigger an instant 1-on-1 video breakdown.
                  </p>
                  <Link
                    href="/dashboard/forum"
                    className="inline-flex items-center gap-2 bg-[#322C4B] hover:bg-[#3E375C] text-white border border-[#7B83EB]/40 px-5 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95"
                  >
                    Open Course Hubs
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ================= TEAMS MESSAGE / QUICK DOUBT BAR ================= */}
      <div className="px-6 pb-5 pt-2 bg-[#1F1F23]">
        <div className="max-w-6xl mx-auto bg-[#29282E] border border-white/10 focus-within:border-[#7B83EB] rounded-lg px-4 py-2.5 flex items-center justify-between transition-colors">
          <input
            type="text"
            placeholder="Type a quick doubt or question to post in Course Hubs..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") window.location.href = "/dashboard/forum";
            }}
          />
          <div className="flex items-center gap-3 text-slate-400 pl-3 border-l border-white/10">
            <Link href="/dashboard/forum" className="hover:text-[#7B83EB] transition-colors" title="Send to Hubs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
