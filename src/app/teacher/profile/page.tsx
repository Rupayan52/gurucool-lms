"use client";
import React, { useEffect, useState, useRef } from "react";

export default function ProfessionalTeacherProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  // Roster & Student Performance Modals
  const [activeRoster, setActiveRoster] = useState<any | null>(null);
  const [activeStudent, setActiveStudent] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const res = await fetch("/api/teacher/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.teacher);
        setAllSubjects(data.allSubjects || []);
        setEditName(data.teacher.name);
        setEditBio(data.teacher.bio || "");
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
    await fetchProfileData();
    setSaving(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
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
    await fetchProfileData();
    setRegisteringId(null);
  };

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center h-full min-h-[450px]">
        <div className="w-8 h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const registeredSubjectIds = profile.teacherRegistrations.map((tr: any) => tr.subject.id);
  const availableSubjects = allSubjects.filter(sub => !registeredSubjectIds.includes(sub.id));

  return (
    <div className="relative min-h-full p-6 lg:p-10 overflow-hidden z-0">
      {/* Vibrant Finance-Style Abstract Shapes */}
      <div className="absolute top-24 right-4 w-72 h-72 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-[40px] rotate-45 blur-[90px] opacity-30 -z-10 pointer-events-none"></div>
      <div className="absolute -bottom-28 right-36 w-96 h-96 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-full blur-[100px] opacity-35 -z-10 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Faculty Profile</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Manage your personal credentials, subject jurisdictions, and enrolled student rosters
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT COLUMN: CRISP PORTRAIT & PERSONAL CREDENTIALS CARD */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden flex flex-col h-full">
              {/* Proportional Portrait Container */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full h-72 bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center cursor-pointer group overflow-hidden"
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center font-black text-2xl text-pink-500 mb-2">
                      {profile.name?.charAt(0)}
                    </div>
                    <span className="text-xs font-bold">Click to Upload Portrait</span>
                  </div>
                )}

                {/* Subtle Floating Pill on Hover */}
                <div className="absolute bottom-4 right-4 bg-slate-900/75 backdrop-blur-md text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-md opacity-90 group-hover:opacity-100 transition-all">
                  Change Photo
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {/* Clean Underline Form Inputs */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">My profile</h2>
                    <p className="text-[11px] text-slate-400">Verified Faculty Account</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member Since</p>
                    <p className="text-[11px] font-semibold text-slate-500">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Active"}
                    </p>
                  </div>
                </div>

                <div className="space-y-5 mb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full text-sm font-bold text-slate-800 border-b border-slate-200 focus:border-pink-500 focus:outline-none py-2 bg-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Role Jurisdiction</label>
                      <input
                        type="text"
                        readOnly
                        value="Senior Faculty Mentor"
                        className="w-full text-sm font-semibold text-slate-500 border-b border-slate-100 py-2 bg-transparent cursor-default"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                    <input
                      type="text"
                      readOnly
                      value={profile.email}
                      className="w-full text-sm font-medium text-slate-500 border-b border-slate-100 py-2 bg-transparent cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic Bio & Specialization</label>
                    <input
                      type="text"
                      value={editBio}
                      onChange={e => setEditBio(e.target.value)}
                      placeholder="e.g., Faculty of Physics & Quantum Mechanics"
                      className="w-full text-sm font-medium text-slate-800 border-b border-slate-200 focus:border-pink-500 focus:outline-none py-2 bg-transparent transition-colors"
                    />
                  </div>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-orange-500">Live Profile Sync</span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"></span>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white text-xs font-bold py-3 px-10 rounded-full shadow-[0_10px_25px_rgba(236,72,153,0.35)] transition-all active:scale-95"
                  >
                    {saving ? "Saving..." : savedToast ? "✓ Saved" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STACKED ROSTER & CATALOG CARDS */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* TOP CARD: MY TEACHING ROSTER */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 flex-1">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900">My Teaching Roster</h3>
                <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                  {profile.teacherRegistrations.length} Active
                </span>
              </div>

              {profile.teacherRegistrations.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  No subjects registered yet. Select a subject from the catalog below.
                </p>
              ) : (
                <div className="space-y-4">
                  {profile.teacherRegistrations.map((tr: any) => (
                    <div
                      key={tr.subject.id}
                      className="flex items-center justify-between py-2.5 px-3 rounded-2xl hover:bg-slate-50/80 transition-colors"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{tr.subject.name}</h4>
                        <p className="text-[11px] font-medium text-slate-400">
                          {tr.subject.registrations?.length || 0} Students Enrolled
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveRoster(tr.subject)}
                        className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white text-[11px] font-bold px-5 py-2 rounded-full shadow-[0_6px_16px_rgba(244,63,94,0.3)] transition-all active:scale-95"
                      >
                        Manage Roster
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BOTTOM CARD: AVAILABLE SUBJECTS CATALOG */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 flex-1">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900">Available Subjects Catalog</h3>
                <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                  {availableSubjects.length} Available
                </span>
              </div>

              {availableSubjects.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  You are registered for all available subjects in the catalog.
                </p>
              ) : (
                <div className="space-y-4">
                  {availableSubjects.map(sub => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between py-2.5 px-3 rounded-2xl hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                        <h4 className="text-sm font-bold text-slate-700">{sub.name}</h4>
                      </div>
                      <button
                        onClick={() => registerForSubject(sub.id)}
                        disabled={registeringId === sub.id}
                        className="bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-600 hover:to-emerald-600 text-white text-[11px] font-bold px-6 py-2 rounded-full shadow-[0_6px_16px_rgba(16,185,129,0.3)] transition-all active:scale-95 disabled:opacity-50"
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
      </div>

      {/* MODAL 1: ENROLLED STUDENT ROSTER */}
      {activeRoster && !activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900">{activeRoster.name} Roster</h3>
                <p className="text-xs text-slate-500 mt-1">{activeRoster.registrations?.length || 0} enrolled students</p>
              </div>
              <button
                onClick={() => setActiveRoster(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {activeRoster.registrations?.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">No students enrolled in this subject yet.</div>
              ) : (
                activeRoster.registrations.map((reg: any) => (
                  <div
                    key={reg.student.id}
                    onClick={() => setActiveStudent({ ...reg.student, subjectName: activeRoster.name })}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-pink-300 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center font-black overflow-hidden">
                        {reg.student.avatarUrl ? (
                          <img src={reg.student.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                          reg.student.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{reg.student.name}</h4>
                        <p className="text-[11px] text-slate-400">{reg.student.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wider">
                      View Performance →
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: STUDENT ACADEMIC OVERVIEW */}
      {activeStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-orange-400 to-pink-500 relative">
              <button
                onClick={() => setActiveStudent(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/30"
              >
                ✕
              </button>
            </div>

            <div className="px-8 pb-8 relative -mt-12">
              <div className="flex items-end gap-5 mb-6">
                <div className="w-24 h-24 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center font-black text-3xl text-pink-500">
                  {activeStudent.avatarUrl ? (
                    <img src={activeStudent.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    activeStudent.name.charAt(0)
                  )}
                </div>
                <div className="pb-1">
                  <h2 className="text-2xl font-black text-slate-900">{activeStudent.name}</h2>
                  <p className="text-xs font-bold text-pink-500 uppercase tracking-widest mt-0.5">
                    {activeStudent.subjectName} • Live Performance Metrics
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quiz Average</p>
                  <p className="text-2xl font-black text-emerald-500">
                    {activeStudent.metrics?.quizAvg !== null && activeStudent.metrics?.quizAvg !== undefined
                      ? `${activeStudent.metrics.quizAvg}%`
                      : "N/A"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {activeStudent.metrics?.quizzesTaken || 0}/{activeStudent.metrics?.totalQuizzes || 0} Completed
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assignments</p>
                  <p className="text-2xl font-black text-blue-500">
                    {activeStudent.metrics?.submittedCount || 0}/{activeStudent.metrics?.totalAssignments || 0}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {activeStudent.metrics?.gradedCount || 0} Graded
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assignment Score</p>
                  <p className="text-2xl font-black text-orange-500">
                    {activeStudent.metrics?.assignmentAvg !== null && activeStudent.metrics?.assignmentAvg !== undefined
                      ? `${activeStudent.metrics.assignmentAvg}%`
                      : "N/A"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Verified Evaluation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
