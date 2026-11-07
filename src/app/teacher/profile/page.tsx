"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function ProfessionalTeacherDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  // Quick Doubt Answer State on Dashboard
  const [quickAnswers, setQuickAnswers] = useState<Record<string, string>>({});
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Modal States
  const [activeRoster, setActiveRoster] = useState<any | null>(null);
  const [activeStudent, setActiveStudent] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profRes, doubtRes] = await Promise.all([
        fetch("/api/teacher/profile"),
        fetch("/api/doubts?role=teacher")
      ]);
      if (profRes.ok) {
        const data = await profRes.json();
        setProfile(data.teacher);
        setAllSubjects(data.allSubjects || []);
        setEditName(data.teacher.name);
        setEditBio(data.teacher.bio || "");
      }
      if (doubtRes.ok) {
        const dData = await doubtRes.json();
        setDoubts(dData.doubts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/teacher/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, bio: editBio })
    });
    await fetchDashboardData();
    setSaving(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setProfile({ ...profile, avatarUrl: base64String });
        await fetch("/api/teacher/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: base64String })
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const registerForSubject = async (subjectId: string) => {
    setRegisteringId(subjectId);
    await fetch("/api/teacher/subjects/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId })
    });
    await fetchDashboardData();
    setRegisteringId(null);
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
      await fetchDashboardData();
    }
    setResolvingId(null);
  };

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const registeredSubjectIds = profile.teacherRegistrations.map((tr: any) => tr.subject.id);
  const availableSubjects = allSubjects.filter(sub => !registeredSubjectIds.includes(sub.id));
  const openDoubts = doubts.filter(d => d.status === "OPEN");

  return (
    <div className="relative min-h-screen bg-[#F4F6F9] overflow-hidden p-6 lg:p-10 font-sans z-0">
      <div className="absolute top-20 right-0 w-72 h-72 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl rotate-45 blur-[80px] opacity-30 -z-10 pointer-events-none"></div>
      <div className="absolute -bottom-32 right-32 w-96 h-96 bg-gradient-to-br from-orange-400 to-pink-600 rounded-full blur-[100px] opacity-40 -z-10 pointer-events-none"></div>

      {/* DASHBOARD HEADER WITH DEDICATED CURRICULUM & DOUBT HUB LINKS */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Dashboard</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage your profile, teaching roster, curriculum, assessments, and student doubts.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/teacher/curriculum"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
          >
            Curriculum, Quizzes & Grading Studio →
          </Link>
          <Link
            href="/teacher/doubts"
            className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
          >
            Full Doubt Clearing Desk ({openDoubts.length} Open)
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
        {/* LEFT COLUMN: PROFILE CARD */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col h-full border border-slate-100/50">
            <div className="w-full h-72 bg-slate-100 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <span className="text-sm font-bold">Upload Portrait</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full">Change Photo</span>
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
            </div>

            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-black text-slate-900">My profile</h2>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Account Created</p>
                  <p className="text-[10px] text-slate-500 font-medium">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Full Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full font-bold text-slate-800 border-b-2 border-slate-200 focus:border-pink-500 focus:outline-none bg-transparent py-2" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Email Address</label>
                  <input type="text" readOnly value={profile.email} className="w-full font-medium text-slate-500 border-b-2 border-slate-100 bg-transparent py-2 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Professional Title / Bio</label>
                  <input type="text" value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="e.g., Senior Faculty" className="w-full font-medium text-slate-800 border-b-2 border-slate-200 focus:border-pink-500 focus:outline-none bg-transparent py-2" />
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Active Status</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold py-2.5 px-8 rounded-full shadow-md">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TEACHING ROSTER, CURRICULUM ACCESS & DOUBT CLEARING REGION */}
        <div className="lg:col-span-8 space-y-8">
          {/* My Teaching Roster */}
          <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100/50">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">My Teaching Roster</h3>
              <div className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{profile.teacherRegistrations.length} Active</div>
            </div>

            {profile.teacherRegistrations.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">You are not currently teaching any subjects.</p>
            ) : (
              <div className="space-y-4">
                {profile.teacherRegistrations.map((tr: any) => (
                  <div key={tr.subject.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{tr.subject.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{tr.subject.registrations?.length || 0} Students Enrolled</p>
                    </div>
                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                      <Link
                        href={`/teacher/curriculum?subjectId=${tr.subject.id}`}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-4 py-2 rounded-full transition-all"
                      >
                        Curriculum & Tests
                      </Link>
                      <button
                        onClick={() => setActiveRoster(tr.subject)}
                        className="bg-gradient-to-r from-orange-400 to-rose-400 text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-sm"
                      >
                        Manage Roster
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TEACHER DOUBT CLEARING REGION ON DASHBOARD */}
          <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100/50">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Student Doubt Clearing Region</h3>
                <p className="text-xs text-slate-400 mt-0.5">Synced live with the Student Doubt Clearing Hub</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">{openDoubts.length} Open</span>
                <Link href="/teacher/doubts" className="text-xs font-bold text-pink-600 hover:underline">
                  View All ({doubts.length}) →
                </Link>
              </div>
            </div>

            {openDoubts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">All student doubts across your subjects have been resolved!</p>
            ) : (
              <div className="space-y-4">
                {openDoubts.slice(0, 4).map(d => (
                  <div key={d.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
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
                    <p className="text-xs text-slate-600 whitespace-pre-wrap">{d.description}</p>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <input
                        type="text"
                        value={quickAnswers[d.id] || ""}
                        onChange={e => setQuickAnswers(prev => ({ ...prev, [d.id]: e.target.value }))}
                        placeholder="Write solution & auto-attach 1-on-1 FFMUC link..."
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
                      />
                      <button
                        onClick={() => handleQuickResolveDoubt(d.id)}
                        disabled={resolvingId === d.id || !quickAnswers[d.id]?.trim()}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                      >
                        {resolvingId === d.id ? "Sending..." : "Resolve Doubt"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Subjects Catalog */}
          <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100/50">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Available Subjects Catalog</h3>
              <div className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{availableSubjects.length} Available</div>
            </div>

            {availableSubjects.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">All available subjects have been assigned.</p>
            ) : (
              <div className="space-y-5">
                {availableSubjects.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                      <h4 className="text-sm font-bold text-slate-700">{sub.name}</h4>
                    </div>
                    <button
                      onClick={() => registerForSubject(sub.id)}
                      disabled={registeringId === sub.id}
                      className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[11px] font-bold px-6 py-2 rounded-full shadow-sm disabled:opacity-50"
                    >
                      {registeringId === sub.id ? "Adding..." : "Register"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: STUDENT ROSTER LIST */}
      {activeRoster && !activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900">{activeRoster.name} Roster</h3>
                <p className="text-xs text-slate-500 mt-1">{activeRoster.registrations?.length || 0} enrolled students</p>
              </div>
              <button onClick={() => setActiveRoster(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {activeRoster.registrations?.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No students enrolled yet.</div>
              ) : (
                activeRoster.registrations.map((reg: any) => (
                  <div
                    key={reg.student.id}
                    onClick={() => setActiveStudent({ ...reg.student, subjectName: activeRoster.name, subjectId: activeRoster.id })}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-pink-300 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center font-black overflow-hidden">
                        {reg.student.avatarUrl ? <img src={reg.student.avatarUrl} className="w-full h-full object-cover" /> : reg.student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{reg.student.name}</h4>
                        <p className="text-[10px] text-slate-400">{reg.student.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Joined {new Date(reg.createdAt).toLocaleDateString()} →</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REAL STUDENT ACADEMIC OVERVIEW DASHBOARD */}
      {activeStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
              <button onClick={() => setActiveStudent(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white">
                ✕
              </button>
            </div>

            <div className="px-8 pb-8 relative -mt-12">
              <div className="flex items-end gap-6 mb-8">
                <div className="w-24 h-24 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center font-black text-3xl text-indigo-400">
                  {activeStudent.avatarUrl ? <img src={activeStudent.avatarUrl} className="w-full h-full object-cover" /> : activeStudent.name.charAt(0)}
                </div>
                <div className="pb-1">
                  <h2 className="text-2xl font-black text-slate-900">{activeStudent.name}</h2>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Academic Overview • {activeStudent.subjectName}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quiz Average</p>
                  <p className="text-2xl font-black text-emerald-500">
                    {activeStudent.metrics?.quizAvg !== null && activeStudent.metrics?.quizAvg !== undefined ? `${activeStudent.metrics.quizAvg}%` : "N/A"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{activeStudent.metrics?.quizzesTaken || 0}/{activeStudent.metrics?.totalQuizzes || 0} Taken</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assignments</p>
                  <p className="text-2xl font-black text-blue-500">
                    {activeStudent.metrics?.submittedCount || 0}/{activeStudent.metrics?.totalAssignments || 0}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{activeStudent.metrics?.gradedCount || 0} Graded</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Doubts Asked</p>
                  <p className="text-2xl font-black text-orange-500">
                    {doubts.filter(d => d.studentId === activeStudent.id && d.subjectId === activeStudent.subjectId).length}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">In {activeStudent.subjectName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
