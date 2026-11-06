"use client";
import React, { useEffect, useState } from "react";

interface Subject {
  id: string;
  name: string;
  description: string | null;
}

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  mentoredSubjects: Subject[];
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/teacher/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data.teacher);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return <div className="p-10 text-red-500 font-bold">{error || "Profile not found."}</div>;
  }

  return (
    <div className="p-10 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Identity</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your credentials and academic portfolio.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Identity Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-emerald-500 to-teal-600"></div>
            
            <div className="relative flex flex-col items-center mt-4">
              <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-lg mb-4">
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-3xl font-black text-slate-800">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-1">{profile.name}</h2>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-100 mb-6">
                {profile.role}
              </span>
              
              <div className="w-full space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Registered Email</p>
                  <p className="text-sm font-semibold text-slate-800 break-all">{profile.email}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">System ID</p>
                  <p className="text-xs font-mono text-slate-500 break-all">{profile.id}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Joined Date</p>
                  <p className="text-sm font-semibold text-slate-800">{new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Academic Portfolio */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Academic Portfolio</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Subjects assigned to your jurisdiction.</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black shadow-inner">
                {profile.mentoredSubjects.length}
              </div>
            </div>

            {profile.mentoredSubjects.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center h-[300px]">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-1">No Subjects Assigned</h4>
                <p className="text-sm text-slate-500">You have not been linked to any core subjects by the administrator yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.mentoredSubjects.map(sub => (
                  <div key={sub.id} className="p-5 rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-all"></div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      </div>
                      <h4 className="font-black text-lg text-slate-800">{sub.name}</h4>
                    </div>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">
                      {sub.description || "Core curriculum module under your jurisdiction."}
                    </p>
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
