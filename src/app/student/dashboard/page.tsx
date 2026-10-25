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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [metricsRes, sessionsRes] = await Promise.all([
          fetch("/api/student/metrics").catch(() => null),
          fetch("/api/student/sessions").catch(() => null)
        ]);

        if (metricsRes?.ok) {
          setMetrics(await metricsRes.json());
        } else {
          // PRODUCTION EMPTY STATE: No fake data.
          setMetrics({
            studyVelocityHours: null, velocityVsLastWeek: null,
            assessmentAccuracy: null, accuracyPercentile: null,
            aiSuggestionTitle: null, aiSuggestionText: null
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

  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 pb-20 selection:bg-blue-200">
      
      {/* ================= EXACT HEADER MATCH ================= */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="w-full px-6 h-[72px] flex items-center justify-between">
          
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors active:scale-95">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div className="flex items-center gap-2 ml-2 cursor-pointer">
              {/* Fallback geometric logo if the actual image asset isn't loaded */}
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-amber-200 to-amber-400"></div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-indigo-600"></div>
              </div>
              <div className="flex flex-col justify-center ml-1">
                <h1 className="text-[22px] font-black text-blue-600 leading-none tracking-tight">GuruCOOL.</h1>
                <span className="text-[8px] font-black text-slate-500 tracking-widest uppercase mt-0.5">By GnOvaTech</span>
              </div>
            </div>
          </div>

          {/* Center: Date & Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-[15px] font-bold text-slate-500">
            <span className="text-slate-400 font-medium mr-4">{today}</span>
            <Link href="/student/player" className="hover:text-blue-600 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> My Learning Player
            </Link>
            <Link href="/catalog" className="hover:text-blue-600 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z"></path></svg> Course Catalog
            </Link>
            <Link href="/hubs" className="hover:text-blue-600 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg> Course Hubs
            </Link>
          </div>

          {/* Right: Profile Badge */}
          <div className="flex items-center gap-3 border border-slate-200 rounded-full p-1 pr-5 hover:shadow-md transition-shadow cursor-pointer bg-white active:scale-95">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-inner">
              RU
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-900 leading-none">Rupayan</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Student</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {/* ================= TITLE ================= */}
        <div className="mb-10 animate-in slide-in-from-bottom-4 fade-in duration-700 ease-out">
          <h2 className="text-[40px] font-black tracking-tight text-[#0F172A] mb-1">AI Insights & Mastery</h2>
          <p className="text-lg text-slate-500 font-medium">Your learning trajectory, quantified.</p>
        </div>

        {/* ================= METRICS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          
          {/* Card 1: Velocity */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-xl transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] relative overflow-hidden group">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8] mb-4">Study Velocity</h3>
            
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-[56px] leading-none font-black tracking-tighter text-[#0F172A]">
                {isLoading ? <div className="h-12 w-24 bg-slate-100 rounded-lg animate-pulse inline-block"></div> : metrics?.studyVelocityHours !== null ? metrics.studyVelocityHours : '--'}
              </span>
              {!isLoading && <span className="text-xl font-black text-[#94A3B8]">hrs</span>}
            </div>
            
            <div className="mt-4 relative z-10">
              {!isLoading && metrics?.velocityVsLastWeek !== null ? (
                <span className="bg-[#ECFDF5] text-[#059669] text-[11px] font-black px-3 py-1.5 rounded uppercase tracking-wider">
                  +{metrics.velocityVsLastWeek}% vs last week
                </span>
              ) : !isLoading ? (
                <span className="bg-slate-50 text-slate-400 text-[11px] font-black px-3 py-1.5 rounded uppercase tracking-wider">
                  Awaiting Data
                </span>
              ) : null}
            </div>

            {/* Stopwatch Watermark */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-100 group-hover:text-slate-200 transition-colors pointer-events-none">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0012 4c-4.97 0-9 4.03-9 9s4.02 9 9 9a8.994 8.994 0 007.03-14.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
              </svg>
            </div>
          </div>

          {/* Card 2: Accuracy */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-xl transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] relative overflow-hidden group">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8] mb-4">Assessment Accuracy</h3>
            
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-[56px] leading-none font-black tracking-tighter text-[#0F172A]">
                {isLoading ? <div className="h-12 w-24 bg-slate-100 rounded-lg animate-pulse inline-block"></div> : metrics?.assessmentAccuracy !== null ? metrics.assessmentAccuracy : '--'}
              </span>
              {!isLoading && <span className="text-xl font-black text-[#94A3B8]">%</span>}
            </div>
            
            <div className="mt-4 relative z-10">
              {!isLoading && metrics?.accuracyPercentile !== null ? (
                <span className="bg-[#EFF6FF] text-[#2563EB] text-[11px] font-black px-3 py-1.5 rounded uppercase tracking-wider">
                  {metrics.accuracyPercentile}
                </span>
              ) : !isLoading ? (
                <span className="bg-slate-50 text-slate-400 text-[11px] font-black px-3 py-1.5 rounded uppercase tracking-wider">
                  Take a quiz
                </span>
              ) : null}
            </div>

            {/* Target Watermark */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-rose-50 group-hover:text-rose-100 transition-colors pointer-events-none">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </div>
          </div>

          {/* Card 3: GuruAI */}
          <div className="bg-[#0F172A] rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(15,23,42,0.2)] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] text-white flex flex-col justify-center">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#38BDF8] mb-2 flex items-center gap-2">
              GURUAI SUGGESTION
            </h3>
            
            {isLoading ? (
              <div className="space-y-3 mt-2">
                <div className="h-6 w-3/4 bg-slate-800 rounded-md animate-pulse"></div>
                <div className="h-4 w-full bg-slate-800 rounded-md animate-pulse mt-2"></div>
                <div className="h-4 w-5/6 bg-slate-800 rounded-md animate-pulse"></div>
              </div>
            ) : (
              <>
                <h4 className="text-xl font-bold mb-2 text-white">
                  {metrics?.aiSuggestionTitle || 'Analyzing Study Patterns...'}
                </h4>
                <p className="text-[15px] text-[#94A3B8] leading-relaxed font-medium">
                  {metrics?.aiSuggestionText || 'GuruAI requires more quiz data and watch time to generate a customized learning path.'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* ================= SESSIONS SECTION ================= */}
        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150 fill-mode-both ease-out">
          <h2 className="text-[22px] font-black tracking-tight text-[#0F172A] mb-6">Upcoming Live Concierge Sessions</h2>
          
          <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center min-h-[300px] text-center">
            {isLoading ? (
               <div className="flex flex-col items-center gap-4">
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl animate-pulse"></div>
                 <div className="h-6 w-48 bg-slate-100 rounded-md animate-pulse"></div>
                 <div className="h-4 w-64 bg-slate-100 rounded-md animate-pulse"></div>
               </div>
            ) : sessions && sessions.length > 0 ? (
              <div className="w-full flex flex-col gap-4">
                {sessions.map(session => (
                   <div key={session.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-200">
                     <div className="text-left">
                       <h4 className="text-lg font-black text-slate-900">{session.title}</h4>
                       <p className="text-sm font-bold text-slate-500">{session.faculty} • {session.scheduledTime}</p>
                     </div>
                     <button onClick={() => window.open(session.meetUrl, '_blank')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-md">
                       Join Mentorship
                     </button>
                   </div>
                ))}
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="w-[72px] h-[72px] bg-[#EFF6FF] rounded-[1.5rem] flex items-center justify-center text-[#2563EB] mx-auto mb-6 shadow-sm">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM15 16H5V8h10v8z"/></svg>
                </div>
                <h3 className="text-xl font-black text-[#0F172A] mb-2">No Live Mentorships Scheduled</h3>
                <p className="text-[#64748B] font-medium max-w-md mx-auto">
                  Submit a doubt in the Expert Helpdesk to trigger a 1-on-1 video breakdown.
                </p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
