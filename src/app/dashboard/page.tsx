"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentMainDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/overview")
      .then(res => res.ok ? res.json() : null)
      .then(data => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-black text-xs">
            AI
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">AI Insights & Mastery</h1>
            <p className="text-xs text-slate-400">Live academic progress synced with your enrolled subjects</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/dashboard/curriculum"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
          >
            Curriculum, Quizzes & Assignments →
          </Link>
          <Link
            href="/dashboard/doubts"
            className="px-4 py-2.5 rounded-xl bg-[#1C1C24] hover:bg-[#252530] text-slate-200 border border-white/10 font-bold text-xs"
          >
            Doubt Clearing Hub ({stats?.openDoubtsCount || 0} Open)
          </Link>
          <Link
            href="/dashboard/forum"
            className="px-4 py-2.5 rounded-xl bg-[#1C1C24] hover:bg-[#252530] text-slate-200 border border-white/10 font-bold text-xs"
          >
            Request 1-on-1 Meet
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1C1C24] rounded-3xl border border-white/10 p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Curriculum & Topics</p>
            <p className="text-3xl font-black text-white mt-3">
              {stats?.totalModules || 0} Modules • {stats?.totalTopics || 0} Topics
            </p>
            <p className="text-xs text-slate-400 mt-1">Across {stats?.enrolledSubjectsCount || 0} Enrolled Subjects</p>
          </div>
          <Link
            href="/dashboard/curriculum"
            className="mt-6 inline-block text-center py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white"
          >
            OPEN CURRICULUM & NOTES
          </Link>
        </div>

        <div className="bg-[#1C1C24] rounded-3xl border border-white/10 p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assessment Accuracy</p>
            <p className="text-3xl font-black text-emerald-400 mt-3">
              {stats?.assessmentAccuracy !== null && stats?.assessmentAccuracy !== undefined ? `${stats.assessmentAccuracy}%` : "No Attempts Yet"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {stats?.quizzesCompleted || 0}/{stats?.totalQuizzes || 0} Quizzes • {stats?.assignmentsSubmitted || 0}/{stats?.totalAssignments || 0} Assignments
            </p>
          </div>
          <Link
            href="/dashboard/curriculum"
            className="mt-6 inline-block text-center py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white"
          >
            TAKE A QUIZ OR SUBMIT ASSIGNMENT
          </Link>
        </div>

        <div className="bg-gradient-to-br from-[#231E3D] to-[#1C1C24] rounded-3xl border border-indigo-500/20 p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Doubt Resolution Status</p>
            <p className="text-2xl font-black text-white mt-3">
              {stats?.resolvedDoubtsCount || 0} Resolved • {stats?.openDoubtsCount || 0} Open
            </p>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Submit topic questions in the Doubt Clearing Hub for direct faculty answers and 1-on-1 FFMUC links.
            </p>
          </div>
          <Link
            href="/dashboard/doubts"
            className="mt-6 inline-block text-center py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white"
          >
            ASK A DOUBT
          </Link>
        </div>
      </div>

      {/* UPCOMING LIVE CONCIERGE SESSIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">Upcoming Live Concierge Sessions</h2>
          <span className="text-xs font-bold text-indigo-400">Synced with FFMUC Video Engine</span>
        </div>

        {!stats?.liveSessions || stats.liveSessions.length === 0 ? (
          <div className="bg-[#1C1C24] rounded-3xl border border-white/10 p-12 text-center space-y-4">
            <h3 className="text-lg font-black text-white">No Live Mentorships Scheduled</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Submit a doubt in the Doubt Clearing Hub or request a 1-on-1 meet inside Course Hubs to schedule a live faculty breakdown.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/dashboard/forum" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs">
                Open Course Hubs
              </Link>
              <Link href="/dashboard/doubts" className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs">
                Open Doubt Clearing Hub
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.liveSessions.map((sess: any) => (
              <div key={sess.id} className="bg-[#1C1C24] rounded-2xl border border-white/10 p-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Approved 1-on-1 Session</span>
                  <h4 className="text-base font-black text-white mt-1">Prof. {sess.teacherName}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {sess.approvedDate ? new Date(sess.approvedDate).toLocaleString() : "Active Workspace"}
                  </p>
                </div>
                <a
                  href={sess.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Join Live Room →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
