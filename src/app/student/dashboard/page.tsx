"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

// Production Data Interfaces
interface AIMetrics {
  studyVelocityHours: number | null;
  velocityVsLastWeek: number | null;
  assessmentAccuracy: number | null;
  accuracyPercentile: string | null;
  aiSuggestionTitle: string | null;
  aiSuggestionText: string | null;
  aiSuggestionLink: string | null;
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

  // Production Fetch Logic (Will fall back to empty states if API is not yet wired)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Attempting to fetch real data from your backend
        const [metricsRes, sessionsRes] = await Promise.all([
          fetch("/api/student/metrics").catch(() => null),
          fetch("/api/student/sessions").catch(() => null)
        ]);

        if (metricsRes?.ok) {
          setMetrics(await metricsRes.json());
        } else {
          // Empty production state
          setMetrics({
            studyVelocityHours: null, velocityVsLastWeek: null,
            assessmentAccuracy: null, accuracyPercentile: null,
            aiSuggestionTitle: null, aiSuggestionText: null, aiSuggestionLink: null
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
    <div className="min-h-screen bg-[#F2F2F7] font-sans text-slate-900 pb-20 selection:bg-blue-200">
      
      {/* iOS Style Glass Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 active:scale-95 transition-transform">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-blue-600">GuruCOOL.</h1>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 -mt-1">By GnOvaTech</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <span className="text-slate-400 font-medium">{today}</span>
            <Link href="/student/player" className="hover:text-blue-600 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> My Learning Player
            </Link>
            <Link href="/catalog" className="hover:text-blue-600 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg> Course Catalog
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-tight">Rupayan</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black shadow-lg shadow-blue-600/30">
              RU
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Page Title with iOS Slide-up Entry */}
        <div className="mb-10 animate-in slide-in-from-bottom-4 fade-in duration-700 ease-out">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">AI Insights & Mastery</h2>
          <p className="text-lg text-slate-500 font-medium">Your learning trajectory, quantified.</p>
        </div>

        {/* AI Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Velocity Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] relative overflow-hidden group">
            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Study Velocity</h3>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-12 w-32 bg-slate-100 rounded-lg animate-pulse"></div>
                <div className="h-6 w-24 bg-slate-100 rounded-md animate-pulse"></div>
              </div>
            ) : metrics?.studyVelocityHours !== null ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter">{metrics?.studyVelocityHours}</span>
                  <span className="text-lg font-bold text-slate-400">hrs</span>
                </div>
                <div className={`mt-4 inline-block px-3 py-1 rounded-full text-xs font-bold ${metrics?.velocityVsLastWeek && metrics.velocityVsLastWeek > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {metrics?.velocityVsLastWeek && metrics.velocityVsLastWeek > 0 ? '+' : ''}{metrics?.velocityVsLastWeek}% vs last week
                </div>
              </>
            ) : (
              <div className="py-4">
                <p className="text-xl font-bold text-slate-300">No Data Yet</p>
                <p className="text-xs font-medium text-slate-400 mt-2">Complete a lesson to track velocity.</p>
              </div>
            )}
          </div>

          {/* Accuracy Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] relative overflow-hidden group">
            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity text-rose-500">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Assessment Accuracy</h3>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-12 w-24 bg-slate-100 rounded-lg animate-pulse"></div>
                <div className="h-6 w-32 bg-slate-100 rounded-md animate-pulse"></div>
              </div>
            ) : metrics?.assessmentAccuracy !== null ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter">{metrics?.assessmentAccuracy}</span>
                  <span className="text-lg font-bold text-slate-400">%</span>
                </div>
                <div className="mt-4 inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                  {metrics?.accuracyPercentile}
                </div>
              </>
            ) : (
              <div className="py-4">
                <p className="text-xl font-bold text-slate-300">Pending</p>
                <p className="text-xs font-medium text-slate-400 mt-2">Take a quiz to generate accuracy score.</p>
              </div>
            )}
          </div>

          {/* GuruAI Suggestion Card */}
          <div className="bg-[#0F172A] rounded-[2rem] p-8 shadow-xl border border-slate-800 hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] text-white flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                GuruAI Suggestion
              </h3>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-6 w-3/4 bg-slate-800 rounded-md animate-pulse"></div>
                  <div className="h-4 w-full bg-slate-800 rounded-md animate-pulse mt-4"></div>
                  <div className="h-4 w-5/6 bg-slate-800 rounded-md animate-pulse"></div>
                </div>
              ) : metrics?.aiSuggestionTitle ? (
                <>
                  <h4 className="text-xl font-black mb-2 leading-tight">{metrics.aiSuggestionTitle}</h4>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed">
                    {metrics.aiSuggestionText}
                  </p>
                </>
              ) : (
                <div className="py-2">
                  <h4 className="text-lg font-bold text-slate-300 mb-2">Analyzing Patterns...</h4>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">GuruAI requires more viewing data to generate personalized learning paths.</p>
                </div>
              )}
            </div>
            {metrics?.aiSuggestionLink && (
               <button className="mt-6 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg self-start transition-colors active:scale-95">
                 Take Action
               </button>
            )}
          </div>
        </div>

        {/* Live Concierge Sessions Section */}
        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150 fill-mode-both ease-out">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-6">Upcoming Live Concierge Sessions</h2>
          
          <div className="bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center min-h-[300px] text-center">
            {isLoading ? (
               <div className="flex flex-col items-center gap-4">
                 <div className="w-16 h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
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
                     <button onClick={() => window.open(session.meetUrl, '_blank')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-md">
                       Join Now
                     </button>
                   </div>
                ))}
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-6 shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No Live Mentorships Scheduled</h3>
                <p className="text-slate-500 font-medium max-w-md mx-auto">
                  Submit a doubt in the Expert Helpdesk to trigger a 1-on-1 video breakdown with your faculty.
                </p>
                <Link href="/student/doubts" className="inline-block mt-8 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg">
                  Go to Helpdesk
                </Link>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
