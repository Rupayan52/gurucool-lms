"use client";
import React, { useEffect, useState, useRef } from "react";

export default function ProfessionalTeacherProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  
  // Modal States
  const [activeRoster, setActiveRoster] = useState<any | null>(null);
  const [activeStudent, setActiveStudent] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/teacher/profile");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setProfile(data.teacher);
      setAllSubjects(data.allSubjects);
      setEditName(data.teacher.name);
      setEditBio(data.teacher.bio || "");
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
      body: JSON.stringify({ name: editName, bio: editBio }),
    });
    await fetchData(); 
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
          body: JSON.stringify({ avatarUrl: base64String }),
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
      body: JSON.stringify({ subjectId }),
    });
    await fetchData(); // Instant refresh fixes the lag issue
    setRegisteringId(null);
  };

  if (loading) return <div className="flex justify-center items-center h-full"><div className="w-8 h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div></div>;

  const registeredSubjectIds = profile.teacherRegistrations.map((tr: any) => tr.subject.id);
  const availableSubjects = allSubjects.filter(sub => !registeredSubjectIds.includes(sub.id));

  return (
    <div className="relative min-h-screen bg-[#F4F6F9] overflow-hidden p-6 lg:p-10 font-sans z-0">
      <div className="absolute top-20 right-0 w-72 h-72 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl rotate-45 blur-[80px] opacity-40 -z-10 pointer-events-none"></div>
      <div className="absolute -bottom-32 right-32 w-96 h-96 bg-gradient-to-br from-orange-400 to-pink-600 rounded-full blur-[100px] opacity-50 -z-10 pointer-events-none"></div>
      
      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between w-full"><h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Dashboard</h1><a href="/teacher/curriculum" className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-xs rounded-full shadow-md hover:opacity-95 transition-all">Open Curriculum & Grading Studio →</a></div>
        <p className="text-sm font-medium text-slate-500 mt-1">Welcome to the GuruCool professional portal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl">
        {/* LEFT COLUMN: PROFILE CARD */}
        <div className="lg:col-span-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col h-full border border-slate-100/50">
            <div className="w-full h-72 bg-slate-100 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-sm font-bold">Upload Portrait</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">Change Photo</span>
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
            </div>

            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-black text-slate-900">My profile</h2>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Account Created</p>
                  <p className="text-[10px] text-slate-500 font-medium">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Full Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full font-bold text-slate-800 border-b-2 border-slate-200 focus:border-pink-500 focus:outline-none bg-transparent py-2 transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Email Address</label>
                  <input type="text" readOnly value={profile.email} className="w-full font-medium text-slate-500 border-b-2 border-slate-100 bg-transparent py-2 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Professional Title / Bio</label>
                  <input type="text" value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="e.g., Senior Faculty" className="w-full font-medium text-slate-800 border-b-2 border-slate-200 focus:border-pink-500 focus:outline-none bg-transparent py-2 transition-colors" />
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Active Status</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
                <button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white font-bold py-2.5 px-8 rounded-full shadow-[0_8px_20px_rgba(236,72,153,0.3)] transition-all active:scale-95">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SUBJECT MANAGEMENT */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-150">
          
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
                    <button onClick={() => setActiveRoster(tr.subject)} className="mt-3 sm:mt-0 bg-gradient-to-r from-orange-400 to-rose-400 text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-[0_4px_14px_rgba(244,63,94,0.39)] hover:shadow-lg transition-all active:scale-95">
                      Manage Roster
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100/50 relative overflow-hidden">
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
                    <button onClick={() => registerForSubject(sub.id)} disabled={registeringId === sub.id} className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[11px] font-bold px-6 py-2 rounded-full shadow-[0_4px_14px_rgba(16,185,129,0.39)] hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
                      {registeringId === sub.id ? "Adding..." : "Register"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: STUDENT ROSTER LIST                              */}
      {/* ========================================================= */}
      {activeRoster && !activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900">{activeRoster.name} Roster</h3>
                <p className="text-xs text-slate-500 mt-1">{activeRoster.registrations?.length || 0} enrolled students</p>
              </div>
              <button onClick={() => setActiveRoster(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {activeRoster.registrations?.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No students enrolled yet.</div>
              ) : (
                activeRoster.registrations.map((reg: any) => (
                  <div key={reg.student.id} onClick={() => setActiveStudent({ ...reg.student, subjectName: activeRoster.name })} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-pink-300 hover:shadow-md cursor-pointer transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center font-black overflow-hidden shadow-inner">
                        {reg.student.avatarUrl ? <img src={reg.student.avatarUrl} className="w-full h-full object-cover"/> : reg.student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-pink-600 transition-colors">{reg.student.name}</h4>
                        <p className="text-[10px] text-slate-400">{reg.student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">Joined {new Date(reg.createdAt).toLocaleDateString()}</span>
                      <svg className="w-5 h-5 text-slate-300 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: STUDENT ACADEMIC OVERVIEW DASHBOARD              */}
      {/* ========================================================= */}
      {activeStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
              <button onClick={() => setActiveStudent(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-md transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="px-8 pb-8 relative -mt-12">
              <div className="flex items-end gap-6 mb-8">
                <div className="w-24 h-24 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center font-black text-3xl text-indigo-200">
                  {activeStudent.avatarUrl ? <img src={activeStudent.avatarUrl} className="w-full h-full object-cover"/> : activeStudent.name.charAt(0)}
                </div>
                <div className="pb-1">
                  <h2 className="text-2xl font-black text-slate-900">{activeStudent.name}</h2>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Academic Overview • {activeStudent.subjectName}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quiz Average</p>
                  <p className="text-2xl font-black text-emerald-500">{activeStudent.metrics?.quizAvg !== null && activeStudent.metrics?.quizAvg !== undefined ? activeStudent.metrics.quizAvg + "%" : "N/A"}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{activeStudent.metrics?.quizzesTaken || 0}/{activeStudent.metrics?.totalQuizzes || 0} Taken</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assignments</p>
                  <p className="text-2xl font-black text-blue-500">{activeStudent.metrics?.submittedCount || 0}/{activeStudent.metrics?.totalAssignments || 0}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{activeStudent.metrics?.gradedCount || 0} Graded</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assignment Score</p>
                  <p className="text-2xl font-black text-orange-500">{activeStudent.metrics?.assignmentAvg !== null && activeStudent.metrics?.assignmentAvg !== undefined ? activeStudent.metrics.assignmentAvg + "%" : "N/A"}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Verified Grade</p>
                </div>
              </div>

              <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Direct Communication</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Initiate a 1-on-1 session or send a direct message to this student.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md transition-all active:scale-95">
                  Message Student
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
