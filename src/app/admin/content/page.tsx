"use client";
import { useEffect, useState } from "react";

export default function ContentManager() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState("");
  
  // Lesson Deployment State
  const [lessonTitle, setLessonTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  const loadData = () => {
    fetch("/api/admin/courses")
      .then((res) => res.json())
      .then((data) => {
        // Securely map pure subjects directly from the database schema
        setSubjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChapter) return alert("Please select a target chapter first.");
    
    const res = await fetch("/api/admin/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: lessonTitle, chapterId: activeChapter, videoUrl, pdfUrl, orderIndex: 1 })
    });
    
    if (res.ok) {
      setLessonTitle(""); setVideoUrl(""); setPdfUrl("");
      alert("Lesson securely injected into the database.");
      loadData();
    } else {
      alert("Cryptographic validation failed. Ensure you have Admin clearance.");
    }
  };

  if (loading) return <div className="p-10 font-bold text-slate-400 animate-pulse">Decrypting Curriculum Database...</div>;

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Enterprise Content Manager</h1>
        <p className="mt-2 text-slate-500 font-medium text-lg">Manage your curriculum hierarchy and deploy secure lessons.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Curriculum Hierarchy View */}
        <div className="lg:col-span-2 space-y-6">
          {subjects.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center shadow-sm">
              <p className="text-slate-500 font-medium">No subjects found. Seed your database to establish curriculum.</p>
            </div>
          ) : (
            subjects.map((subject) => (
              <div key={subject.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    {subject.name}
                  </h2>
                  <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-lg uppercase tracking-widest">{subject.chapters?.length || 0} Chapters</span>
                </div>
                
                <div className="p-6">
                  {(!subject.chapters || subject.chapters.length === 0) ? (
                    <p className="text-sm text-slate-400 font-medium">No chapters exist for this subject.</p>
                  ) : (
                    <div className="space-y-4">
                      {subject.chapters.map((chapter: any) => (
                        <div 
                          key={chapter.id} 
                          onClick={() => setActiveChapter(chapter.id)} 
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${activeChapter === chapter.id ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/20' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                        >
                          <div className="font-bold text-slate-900">{chapter.title}</div>
                          <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1 font-black">ID: {chapter.id}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Secure Lesson Deployment Form */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 h-fit sticky top-6">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            Deploy Lesson
          </h3>
          <form onSubmit={handleAddLesson} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Target Chapter ID</label>
              <input type="text" readOnly value={activeChapter} placeholder="Select a chapter from the list" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none text-slate-500 font-mono text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Lesson Title</label>
              <input type="text" required value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Video URL (Secure)</label>
              <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">PDF Handout URL</label>
              <input type="url" value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium" placeholder="https://..." />
            </div>
            <button type="submit" disabled={!activeChapter} className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-black hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50 mt-4 uppercase tracking-widest text-xs">
              Inject into Database
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
