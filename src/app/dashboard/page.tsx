"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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

  return (
    <div className="bg-[#F8F9FA] font-sans text-slate-900 pb-20 selection:bg-blue-200 min-h-[calc(100vh-72px)]">
      {/* Reduced top padding since the layout header handles the structural spacing */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-8">
        
        <div className="mb-12 animate-in slide-in-from-bottom-4 fade-in duration-700 ease-out">
          <h2 className="text-[38px] font-black tracking-tight text-[#0F172A] mb-2">AI Insights & Mastery</h2>
          <p className="text-lg text-slate-500 font-medium">Your learning trajectory, quantified.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] relative overflow-hidden group">
            <h3 className="text-[12px] font-black uppercase tracking-widest text-[#94A3B8] mb-4">Study Velocity</h3>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-[52px] leading-none font-black tracking-tighter text-[#0F172A]">
                {isLoading ? <div className="h-12 w-24 bg-slate-100 rounded-lg animate-pulse inline-block"></div> : metrics?.studyVelocityHours ?? '--'}
              </span>
              {!isLoading && <span className="text-[22px] font-black text-[#94A3B8]">hrs</span>}
            </div>
            <div className="mt-6 relative z-10">
              {!isLoading && metrics?.velocityVsLastWeek !== null ? (
                <span className="bg-[#ECFDF5] text-[#10B981] text-[12px] font-black px-4 py-1.5 rounded-md uppercase tracking-wider">
                  +{metrics?.velocityVsLastWeek}% vs last week
                </span>
              ) : !isLoading ? (
                <span className="bg-slate-50 text-slate-400 text-[12px] font-black px-4 py-1.5 rounded-md uppercase tracking-wider">
                  Awaiting Data
                </span>
              ) : null}
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-50 group-hover:text-slate-100 transition-colors pointer-events-none">
              <svg className="w-28 h-28" fill="currentColor" viewBox="0 0 24 24"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0012 4c-4.97 0-9 4.03-9 9s4.02 9 9 9a8.994 8.994 0 007.03-14.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] relative overflow-hidden group">
            <h3 className="text-[12px] font-black uppercase tracking-widest text-[#94A3B8] mb-4">Assessment Accuracy</h3>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-[52px] leading-none font-black tracking-tighter text-[#0F172A]">
                {isLoading ? <div className="h-12 w-24 bg-slate-100 rounded-lg animate-pulse inline-block"></div> : metrics?.assessmentAccuracy ?? '--'}
              </span>
              {!isLoading && <span className="text-[22px] font-black text-[#94A3B8]">%</span>}
            </div>
            <div className="mt-6 relative z-10">
              {!isLoading && metrics?.accuracyPercentile !== null ? (
                <span className="bg-[#EFF6FF] text-[#3B82F6] text-[12px] font-black px-4 py-1.5 rounded-md uppercase tracking-wider">
                  {metrics?.accuracyPercentile}
                </span>
              ) : !isLoading ? (
                <span className="bg-slate-50 text-slate-400 text-[12px] font-black px-4 py-1.5 rounded-md uppercase tracking-wider">
                  Take a quiz
                </span>
              ) : null}
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-50 group-hover:text-rose-100 transition-colors pointer-events-none">
              <svg className="w-28 h-28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            </div>
          </div>

          <div className="bg-[#0B132B] rounded-3xl p-8 shadow-xl hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] text-white flex flex-col justify-center">
            <h3 className="text-[12px] font-black uppercase tracking-widest text-[#38BDF8] mb-3">GURUAI SUGGESTION</h3>
            {isLoading ? (
              <div className="space-y-3 mt-2">
                <div className="h-7 w-3/4 bg-slate-800 rounded-md animate-pulse"></div>
                <div className="h-4 w-full bg-slate-800 rounded-md animate-pulse mt-3"></div>
                <div className="h-4 w-5/6 bg-slate-800 rounded-md animate-pulse"></div>
              </div>
            ) : (
              <>
                <h4 className="text-[22px] font-bold mb-2 text-white leading-tight">{metrics?.aiSuggestionTitle || 'Analyzing Study Patterns...'}</h4>
                <p className="text-[15px] text-[#94A3B8] leading-relaxed font-medium">{metrics?.aiSuggestionText || 'GuruAI requires more quiz data and watch time to generate a customized learning path for you.'}</p>
              </>
            )}
          </div>
        </div>

        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150 fill-mode-both ease-out">
          <h2 className="text-[24px] font-black tracking-tight text-[#0F172A] mb-6">Upcoming Live Concierge Sessions</h2>
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[320px] text-center">
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
                     <button onClick={() => window.open(session.meetUrl, '_blank')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-md">Join Mentorship</button>
                   </div>
                ))}
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="w-[72px] h-[72px] bg-[#EFF6FF] rounded-2xl flex items-center justify-center text-[#2563EB] mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-[20px] font-black text-[#0F172A] mb-2">No Live Mentorships Scheduled</h3>
                <p className="text-[#64748B] text-[15px] font-medium max-w-md mx-auto">Submit a doubt in the Expert Helpdesk to trigger a 1-on-1 video breakdown.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
