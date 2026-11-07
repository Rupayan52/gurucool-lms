"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Faculty {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
}

interface CourseItem {
  id: string;
  name: string;
  teacherName: string;
  faculties: Faculty[];
  enrolled: boolean;
}

export default function CourseCatalog() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  
  // Faculty Modal State
  const [activeFaculty, setActiveFaculty] = useState<Faculty | null>(null);
  const router = useRouter();

  useEffect(() => { fetchCatalog(); }, []);

  const fetchCatalog = async () => {
    try {
      const res = await fetch("/api/student/catalog");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (subjectId: string) => {
    setRegisteringId(subjectId);
    try {
      const res = await fetch("/api/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId })
      });
      if (res.ok) await fetchCatalog(); // Instant Sync
    } catch (e) {
      console.error(e);
    } finally {
      setRegisteringId(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full"><div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-100 tracking-tight">Course Catalog</h1>
        <p className="text-sm font-medium text-slate-400 mt-1">Activate your free trials and select your mentors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-[#1C1C21] rounded-3xl border border-white/5 p-6 shadow-xl flex flex-col relative overflow-hidden group hover:border-blue-500/30 transition-all">
            
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            
            <h2 className="text-2xl font-black text-white mb-6 capitalize">{course.name}</h2>
            
            <div className="mt-auto space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Assigned Mentor(s)</p>
                <div className="flex flex-wrap gap-2">
                  {course.faculties.length > 0 ? (
                    course.faculties.map(faculty => (
                      <button 
                        key={faculty.id} 
                        onClick={() => setActiveFaculty(faculty)}
                        className="flex items-center gap-2 bg-[#25252B] hover:bg-[#2F2F37] border border-white/5 px-3 py-1.5 rounded-lg transition-colors group/btn"
                      >
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[9px] font-black overflow-hidden">
                          {faculty.avatarUrl ? <img src={faculty.avatarUrl} className="w-full h-full object-cover"/> : faculty.name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-slate-300 group-hover/btn:text-white transition-colors">Prof. {faculty.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="bg-[#25252B] border border-white/5 px-3 py-1.5 rounded-lg">
                      <span className="text-xs font-bold text-slate-500">Prof. Pending</span>
                    </div>
                  )}
                </div>
              </div>

              {course.enrolled ? (
                <button disabled className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> Enrolled
                </button>
              ) : (
                <button 
                  onClick={() => handleRegister(course.id)} 
                  disabled={registeringId === course.id}
                  className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider bg-[#1B1B22] hover:bg-blue-600 text-slate-300 hover:text-white border border-white/5 shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {registeringId === course.id ? "Activating..." : "Start Free Trial"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* FACULTY VIEWER MODAL                                      */}
      {/* ========================================================= */}
      {activeFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1C1C21] rounded-[32px] border border-white/10 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="h-32 bg-gradient-to-r from-blue-900 to-indigo-900 relative">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <button onClick={() => setActiveFaculty(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-colors z-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="px-8 pb-8 relative -mt-16">
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-full border-4 border-[#1C1C21] bg-[#25252B] shadow-xl overflow-hidden flex items-center justify-center font-black text-4xl text-blue-400 mb-4">
                  {activeFaculty.avatarUrl ? <img src={activeFaculty.avatarUrl} className="w-full h-full object-cover"/> : activeFaculty.name.charAt(0)}
                </div>
                <h2 className="text-2xl font-black text-white">Prof. {activeFaculty.name}</h2>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-500/20 mt-2">Faculty Mentor</span>
              </div>

              <div className="bg-[#25252B] rounded-2xl p-6 border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Professional Headline</p>
                <p className="text-sm font-medium text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {activeFaculty.bio || "This faculty member has not provided a biography yet."}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
