"use client";
import { useEffect, useState } from "react";

export default function CourseCatalog() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from the new safe Catalog API
    fetch("/api/catalog").then(r => r.json()).then(data => {
      setSubjects(data.subjects || []);
      setTeachers(data.teachers || []);
      setLoading(false);
    });
  }, []);

  const handleEnroll = async (subjectId: string, teacherId: string) => {
    if (!teacherId) return alert("Please select a Faculty member.");
    const res = await fetch("/api/student/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId, teacherId })
    });
    if (res.ok) {
      alert("Free Trial Activated! You are now assigned to this Faculty's cohort.");
      window.location.href = "/dashboard/forum";
    }
  };

  if (loading) return <div className="p-10 font-bold text-slate-400">Loading Catalog...</div>;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Course Catalog</h1>
        <p className="mt-2 text-slate-500 font-medium text-lg">Activate your free trials and select your mentors.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(subject => (
          <div key={subject.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{subject.name}</h3>
            <p className="text-sm text-slate-500 font-medium flex-1 mb-6">Complete curriculum coverage.</p>
            
            <form onSubmit={(e) => { e.preventDefault(); const tId = (e.currentTarget.elements.namedItem('teacher') as HTMLSelectElement).value; handleEnroll(subject.id, tId); }}>
              <select name="teacher" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 mb-3 cursor-pointer">
                <option value="">Select Faculty Mentor...</option>
                {teachers.map(t => <option key={t.id} value={t.id}>Prof. {t.name}</option>)}
              </select>
              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-md text-sm uppercase tracking-widest">
                Start Free Trial
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
