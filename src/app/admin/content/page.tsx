"use client";
import { useEffect, useState } from "react";

export default function AdminContentManager() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [lessonData, setLessonData] = useState({ title: "", videoUrl: "", pdfUrl: "", orderIndex: 1 });

  useEffect(() => {
    fetch("/api/admin/courses").then(r => r.json()).then(setClasses);
  }, []);

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapter) return alert("Select a chapter first");
    await fetch("/api/admin/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lessonData, chapterId: selectedChapter })
    });
    alert("Lesson Added Successfully");
    setLessonData({ title: "", videoUrl: "", pdfUrl: "", orderIndex: 1 });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Content Manager</h1>
      
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
        <label className="block text-sm font-bold text-slate-700 mb-2">1. Select Target Chapter</label>
        <select value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none">
          <option value="">-- Choose a Chapter --</option>
          {classes.map(c => 
            c.subjects.map((s: any) => 
              s.chapters.map((ch: any) => (
                <option key={ch.id} value={ch.id}>{c.name} > {s.name} > {ch.name}</option>
              ))
            )
          )}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">2. Add Phygital Lesson</h2>
        <form onSubmit={handleAddLesson} className="space-y-4">
          <input type="text" required placeholder="Lesson Title" value={lessonData.title} onChange={e => setLessonData({...lessonData, title: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3" />
          <input type="url" placeholder="Video URL (e.g., YouTube/Vimeo embed)" value={lessonData.videoUrl} onChange={e => setLessonData({...lessonData, videoUrl: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3" />
          <input type="url" placeholder="PDF Notes URL" value={lessonData.pdfUrl} onChange={e => setLessonData({...lessonData, pdfUrl: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3" />
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 w-full">Upload Lesson</button>
        </form>
      </div>
    </div>
  );
}
