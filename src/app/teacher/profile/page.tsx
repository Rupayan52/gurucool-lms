"use client";
import React, { useEffect, useState, useRef } from "react";

export default function ProfessionalTeacherProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

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
    setSaving(false);
    fetchData(); // Refresh UI
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
    await fetch("/api/teacher/subjects/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId }),
    });
    fetchData(); // Refresh to move it to Active Subjects
  };

  if (loading) return <div className="flex justify-center items-center h-full"><div className="w-8 h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div></div>;

  // Filter out subjects the teacher is already registered for
  const registeredSubjectIds = profile.teacherRegistrations.map((tr: any) => tr.subject.id);
  const availableSubjects = allSubjects.filter(sub => !registeredSubjectIds.includes(sub.id));

  return (
    <div className="relative min-h-screen bg-[#F4F6F9] overflow-hidden p-6 lg:p-10 font-sans z-0">
      
      {/* VIBRANT BACKGROUND ABSTRACT BLOBS */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl rotate-45 blur-[80px] opacity-40 -z-10 pointer-events-none"></div>
      <div className="absolute -bottom-32 right-32 w-96 h-96 bg-gradient-to-br from-orange-400 to-pink-600 rounded-full blur-[100px] opacity-50 -z-10 pointer-events-none"></div>
      
      {/* PAGE HEADER */}
      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Dashboard</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Welcome to the GuruCool professional portal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl">
        
        {/* LEFT COLUMN: PROFESSIONAL PROFILE CARD */}
        <div className="lg:col-span-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col h-full border border-slate-100/50">
            
            {/* Image Upload Area (Rectangular Portrait Style) */}
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

            {/* Profile Form Details */}
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-black text-slate-900">My profile</h2>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Account Created</p>
                  <p className="text-[10px] text-slate-500 font-medium">{new Date(profile.createdAt).toLocaleDateString()}</p>
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
                  <input type="text" value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="e.g., Senior Physics Faculty" className="w-full font-medium text-slate-800 border-b-2 border-slate-200 focus:border-pink-500 focus:outline-none bg-transparent py-2 transition-colors" />
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

        {/* RIGHT COLUMN: SUBJECT MANAGEMENT CARDS */}
        <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-150">
          
          {/* Active Assigned Subjects */}
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
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{tr.subject._count.registrations} Students Enrolled</p>
                    </div>
                    <button className="mt-3 sm:mt-0 bg-gradient-to-r from-orange-400 to-rose-400 text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95">
                      Manage Roster
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Subjects Catalog */}
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
                    <button onClick={() => registerForSubject(sub.id)} className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[11px] font-bold px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95">
                      Register
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
