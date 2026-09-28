"use client";
import { useEffect, useState } from "react";

export default function ContentManager() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [activeSubject, setActiveSubject] = useState("");
  const [activeChapter, setActiveChapter] = useState("");
  
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newChapterTitle, setNewChapterTitle] = useState("");
  
  const [lessonTitle, setLessonTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  const loadData = () => {
    fetch("/api/admin/courses").then((res) => res.json()).then((data) => setSubjects(Array.isArray(data) ? data : []));
  };
  useEffect(() => { loadData(); }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "SUBJECT", name: newSubjectName }) });
    setNewSubjectName(""); loadData();
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject) return alert("Select a subject first.");
    await fetch("/api/admin/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "CHAPTER", title: newChapterTitle, subjectId: activeSubject }) });
    setNewChapterTitle(""); loadData();
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChapter) return alert("Select a chapter first.");
    await fetch("/api/admin/lessons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: lessonTitle, chapterId: activeChapter, videoUrl, pdfUrl, orderIndex: 1 }) });
    setLessonTitle(""); setVideoUrl(""); setPdfUrl(""); alert("Lesson Deployed."); loadData();
  };

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900">Course Designer & Content Manager</h1>
        <p className="mt-2 text-slate-500 font-medium text-lg">Architect new courses and deploy curriculum.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Create New Course (Subject) */}
          <form onSubmit={handleCreateSubject} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex gap-4">
            <input type="text" required value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="New Course Name (e.g., Biology)" className="flex-1 border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-bold" />
            <button type="submit" className="bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 shadow-md whitespace-nowrap">Create Course</button>
          </form>

          {subjects.map((subject) => (
            <div key={subject.id} className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all ${activeSubject === subject.id ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200'}`}>
              <div onClick={() => setActiveSubject(subject.id)} className="bg-slate-900 p-6 text-white flex justify-between items-center cursor-pointer hover:bg-slate-800">
                <h2 className="text-xl font-black">{subject.name}</h2>
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-lg uppercase tracking-widest">{subject.chapters?.length || 0} Chapters</span>
              </div>
              
              {activeSubject === subject.id && (
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                  <form onSubmit={handleCreateChapter} className="flex gap-4">
                    <input type="text" required value={newChapterTitle} onChange={e => setNewChapterTitle(e.target.value)} placeholder="New Chapter Title" className="flex-1 border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium" />
                    <button type="submit" className="bg-slate-900 text-white px-6 rounded-xl font-bold hover:bg-slate-800 shadow-md">Add Chapter</button>
                  </form>
                </div>
              )}

              <div className="p-6 space-y-4">
                {subject.chapters?.map((chapter: any) => (
                  <div key={chapter.id} onClick={() => setActiveChapter(chapter.id)} className={`p-4 rounded-xl border cursor-pointer transition-all ${activeChapter === chapter.id ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/20' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}>
                    <div className="font-bold text-slate-900">{chapter.title}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 h-fit sticky top-6">
          <h3 className="text-xl font-black text-slate-900 mb-6">Deploy Lesson</h3>
          <form onSubmit={handleAddLesson} className="space-y-4">
            <input type="text" readOnly value={activeChapter ? "Chapter Selected" : "No Chapter Selected"} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-500 font-mono text-sm cursor-not-allowed" />
            <input type="text" required value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder="Lesson Title" className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium" />
            <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="Video URL" className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium" />
            <input type="url" value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="PDF URL" className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium" />
            <button type="submit" disabled={!activeChapter} className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-black hover:bg-blue-600 shadow-md disabled:opacity-50 mt-4 uppercase tracking-widest text-xs">Inject Lesson</button>
          </form>
        </div>
      </div>
    </div>
  );
}
