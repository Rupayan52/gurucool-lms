"use client";
import React, { useEffect, useState, useRef } from "react";

interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface Registration {
  student: Student;
  createdAt: string;
}

interface Subject {
  id: string;
  name: string;
  registrations: Registration[];
}

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  avatarUrl?: string | null;
  bio?: string | null;
  mentoredSubjects: Subject[];
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Expanded Subject State
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/teacher/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data.teacher);
      setEditName(data.teacher.name);
      setEditBio(data.teacher.bio || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await fetch("/api/teacher/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, bio: editBio }),
      });
      await fetchProfile();
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Optimistic UI update
        if (profile) setProfile({ ...profile, avatarUrl: base64String });
        
        // Save to DB
        await fetch("/api/teacher/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: base64String }),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>;
  if (!profile) return <div className="p-10 text-red-500 font-bold">Profile not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 animate-in fade-in duration-500 pb-20">
      
      {/* LINKEDIN STYLE HEADER CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8 relative">
        {/* Banner */}
        <div className="h-40 w-full bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        {/* Profile Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg text-xs font-bold transition-all">Cancel</button>
              <button onClick={handleSaveProfile} disabled={saving} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-lg transition-all">{saving ? "Saving..." : "Save Changes"}</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg text-xs font-bold shadow-lg transition-all flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              Edit Profile
            </button>
          )}
        </div>

        <div className="px-8 pb-8 relative">
          {/* Avatar Area */}
          <div className="relative -mt-16 mb-4 flex justify-between items-end">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 shadow-xl overflow-hidden flex items-center justify-center relative">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-slate-400">{profile.name.charAt(0)}</span>
                )}
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          {/* User Details */}
          <div className="max-w-2xl">
            {isEditing ? (
              <div className="space-y-4">
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full text-2xl font-black text-slate-900 border-b-2 border-blue-500 focus:outline-none bg-slate-50 p-2 rounded" placeholder="Your Name" />
                <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} className="w-full text-sm text-slate-600 border border-slate-300 focus:border-blue-500 focus:outline-none bg-slate-50 p-3 rounded-lg resize-none" placeholder="Add a professional bio or headline..." />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black text-slate-900">{profile.name}</h1>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mt-1 mb-4">{profile.role}</p>
                <p className="text-sm text-slate-600 leading-relaxed max-w-3xl whitespace-pre-wrap">{profile.bio || "No biography provided. Click Edit Profile to add your professional headline."}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ACADEMIC JURISDICTION & ENROLLED STUDENTS */}
      <div>
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-xl font-black text-slate-900">Academic Jurisdiction</h2>
          <span className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-full">{profile.mentoredSubjects.length} Active Subjects</span>
        </div>

        {profile.mentoredSubjects.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">No subjects assigned yet.</div>
        ) : (
          <div className="space-y-4">
            {profile.mentoredSubjects.map(subject => {
              const isExpanded = expandedSubject === subject.id;
              const studentCount = subject.registrations.length;

              return (
                <div key={subject.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                  {/* Subject Header (Clickable) */}
                  <div 
                    onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                    className="p-6 cursor-pointer hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{subject.name}</h3>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">{studentCount} Students Enrolled</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="text-sm font-bold text-blue-600 hover:underline">{isExpanded ? "Close Roster" : "View Roster"}</button>
                      <svg className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  {/* Enrolled Students Roster (Expanded) */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-in slide-in-from-top-2 duration-300">
                      {studentCount === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">No students are currently registered for this subject.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {subject.registrations.map(reg => (
                            <div key={reg.student.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 hover:border-blue-300 transition-colors shadow-sm">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm flex-shrink-0 overflow-hidden">
                                {reg.student.avatarUrl ? <img src={reg.student.avatarUrl} className="w-full h-full object-cover" /> : reg.student.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 truncate">{reg.student.name}</h4>
                                <p className="text-[10px] text-slate-500 truncate">{reg.student.email}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Joined {new Date(reg.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
