"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function FacultyExecutiveDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [studioSummary, setStudioSummary] = useState<{
    modulesCount: number;
    quizzesCount: number;
    assignmentsCount: number;
    pendingSubmissions: any[];
  }>({
    modulesCount: 0,
    quizzesCount: 0,
    assignmentsCount: 0,
    pendingSubmissions: []
  });
  const [loading, setLoading] = useState(true);

  const [quickAnswers, setQuickAnswers] = useState<Record<string, string>>({});
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardEverything();
  }, []);

  const fetchDashboardEverything = async () => {
    setLoading(true);
    try {
      const [profRes, doubtRes, currRes] = await Promise.all([
        fetch("/api/teacher/profile"),
        fetch("/api/doubts?role=teacher"),
        fetch("/api/teacher/curriculum")
      ]);

      if (profRes.ok) {
        const pData = await profRes.json();
        setProfile(pData.teacher);
      }

      if (doubtRes.ok) {
        const dData = await doubtRes.json();
        setDoubts(dData.doubts || []);
      }

      if (currRes.ok) {
        const cData = await currRes.json();
        const assignments = cData.assignments || [];
        const pendingSubs: any[] = [];
        assignments.forEach((a: any) => {
          (a.submissions || []).forEach((s: any) => {
            if (s.status !== "GRADED") {
              pendingSubs.push({
                ...s,
                assignmentTitle: a.title,
                maxMarks: a.maxMarks
              });
            }
          });
        });

        setStudioSummary({
          modulesCount: (cData.modules || []).length,
          quizzesCount: (cData.quizzes || []).length,
          assignmentsCount: assignments.length,
          pendingSubmissions: pendingSubs
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickResolveDoubt = async (doubtId: string) => {
    const answerText = quickAnswers[doubtId];
    if (!answerText?.trim()) return;
    setResolvingId(doubtId);
    const res = await fetch("/api/doubts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ANSWER_DOUBT",
        doubtId,
        teacherAnswer: answerText,
        includeMeetLink: true
      })
    });
    if (res.ok) {
      setQuickAnswers(prev => ({ ...prev, [doubtId]: "" }));
      await fetchDashboardEverything();
    }
    setResolvingId(null);
  };

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center h-full min-h-[450px]">
        <div className="w-8 h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalStudents = profile.teacherRegistrations.reduce(
    (acc: number, tr: any) => acc + (tr.subject.registrations?.length || 0),
    0
  );
  const openDoubts = doubts.filter(d => d.status === "OPEN");
  const resolvedDoubts = doubts.filter(d => d.status === "RESOLVED");

  return (
    <div className="relative min-h-full p-6 lg:p-10 overflow-hidden z-0">
      {/* Soft Finance-Portal Ambient Blobs */}
      <div className="absolute top-16 right-8 w-80 h-80 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl rotate-45 blur-[110px] opacity-25 -z-10 pointer-events-none"></div>
      <div className="absolute -bottom-24 right-28 w-96 h-96 bg-gradient-to-br from-orange-400 to-pink-600 rounded-full blur-[120px] opacity-30 -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* WELCOME BANNER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              My Faculty Dashboard
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Welcome to the GuruCool academic command portal, Prof. {profile.name}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/teacher/curriculum"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white font-bold text-xs shadow-[0_10px_25px_rgba(236,72,153,0.3)] transition-all"
            >
              Open Curriculum & Grading Studio →
            </Link>
            <Link
              href="/teacher/doubts"
              className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
            >
              Full Doubt Desk ({openDoubts.length} Open)
            </Link>
          </div>
        </div>

        {/* 4 EXECUTIVE KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-[28px] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Subjects</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="my-3">
              <p className="text-3xl font-black text-slate-900">{profile.teacherRegistrations.length}</p>
              <p className="text-xs font-medium text-slate-400 mt-1">{totalStudents} Enrolled Students</p>
            </div>
            <Link href="/teacher/profile" className="text-xs font-bold text-pink-600 hover:underline">
              Manage Roster & Subjects →
            </Link>
          </div>

          <div className="bg-white rounded-[28px] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Curriculum & Quizzes</span>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            </div>
            <div className="my-3">
              <p className="text-3xl font-black text-slate-900">
                {studioSummary.modulesCount} <span className="text-base font-bold text-slate-400">Modules</span>
              </p>
              <p className="text-xs font-medium text-slate-400 mt-1">
                {studioSummary.quizzesCount} Active Quizzes • {studioSummary.assignmentsCount} Assignments
              </p>
            </div>
            <Link href="/teacher/curriculum" className="text-xs font-bold text-indigo-600 hover:underline">
              Design Syllabus & Tests →
            </Link>
          </div>

          <div className="bg-white rounded-[28px] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grading Queue</span>
              <span className={`w-2.5 h-2.5 rounded-full ${studioSummary.pendingSubmissions.length > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}></span>
            </div>
            <div className="my-3">
              <p className="text-3xl font-black text-slate-900">{studioSummary.pendingSubmissions.length}</p>
              <p className="text-xs font-medium text-slate-400 mt-1">Submissions Awaiting Evaluation</p>
            </div>
            <Link href="/teacher/curriculum" className="text-xs font-bold text-orange-500 hover:underline">
              Open Grading Desk →
            </Link>
          </div>

          <div className="bg-white rounded-[28px] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Doubts</span>
              <span className={`w-2.5 h-2.5 rounded-full ${openDoubts.length > 0 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`}></span>
            </div>
            <div className="my-3">
              <p className="text-3xl font-black text-slate-900">{openDoubts.length} <span className="text-base font-bold text-slate-400">Open</span></p>
              <p className="text-xs font-medium text-slate-400 mt-1">{resolvedDoubts.length} Doubts Resolved</p>
            </div>
            <Link href="/teacher/doubts" className="text-xs font-bold text-emerald-600 hover:underline">
              Go to Doubt Desk →
            </Link>
          </div>
        </div>

        {/* MAIN 2-COLUMN COMMAND WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT 7 COLUMNS: LIVE STUDENT DOUBT CLEARING REGION */}
          <div className="lg:col-span-7 bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Student Doubt Clearing Region</h2>
                <p className="text-xs text-slate-400 mt-0.5">Live synchronization with the Student Doubt Clearing Hub</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 font-bold text-xs">
                  {openDoubts.length} Open
                </span>
                <Link href="/teacher/doubts" className="text-xs font-bold text-pink-600 hover:underline">
                  Full View ({doubts.length}) →
                </Link>
              </div>
            </div>

            {openDoubts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3 font-black text-xl">
                  ✓
                </div>
                <h3 className="text-sm font-black text-slate-800">All Student Doubts Cleared</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  New questions submitted by students in your subjects will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {openDoubts.slice(0, 4).map(d => (
                  <div key={d.id} className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-black uppercase">
                          {d.subjectName}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{d.student?.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(d.createdAt).toLocaleString()}</span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900">{d.title}</h4>
                    <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{d.description}</p>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <input
                        type="text"
                        value={quickAnswers[d.id] || ""}
                        onChange={e => setQuickAnswers(prev => ({ ...prev, [d.id]: e.target.value }))}
                        placeholder="Type step-by-step solution (auto-attaches FFMUC 1-on-1 link)..."
                        className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
                      />
                      <button
                        onClick={() => handleQuickResolveDoubt(d.id)}
                        disabled={resolvingId === d.id || !quickAnswers[d.id]?.trim()}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                      >
                        {resolvingId === d.id ? "Sending..." : "Resolve"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT 5 COLUMNS: SUBJECT CURRICULUM & GRADING QUICK-LAUNCH */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900">Subject Curriculum & Tests</h2>
                <Link href="/teacher/curriculum" className="text-xs font-bold text-pink-600 hover:underline">
                  Open Studio →
                </Link>
              </div>

              {profile.teacherRegistrations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 mb-4">No subjects registered yet.</p>
                  <Link href="/teacher/profile" className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold">
                    Assign Subjects in Profile
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.teacherRegistrations.map((tr: any) => (
                    <div key={tr.subject.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{tr.subject.name}</h4>
                          <p className="text-[11px] text-slate-400">{tr.subject.registrations?.length || 0} Students Enrolled</p>
                        </div>
                      </div>
                      <Link
                        href={`/teacher/curriculum?subjectId=${tr.subject.id}`}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-[11px] shadow-sm hover:opacity-95"
                      >
                        Manage Syllabus
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Submissions Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900">Un-Graded Submissions</h2>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
                  {studioSummary.pendingSubmissions.length} Pending
                </span>
              </div>

              {studioSummary.pendingSubmissions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  All submitted student assignments have been graded.
                </p>
              ) : (
                <div className="space-y-3">
                  {studioSummary.pendingSubmissions.slice(0, 4).map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
                      <div>
                        <p className="text-xs font-black text-slate-800">{sub.assignmentTitle}</p>
                        <p className="text-[11px] text-slate-400">{sub.student?.name} • Max {sub.maxMarks} pts</p>
                      </div>
                      <Link
                        href="/teacher/curriculum"
                        className="px-3.5 py-1.5 rounded-full bg-emerald-500 text-white font-bold text-[11px]"
                      >
                        Grade Now
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
