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
  
  // Live Broadcast States
  const [broadcastType, setBroadcastType] = useState("VOD");
  const [scheduledTime, setScheduledTime] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  const loadData = () => {
    fetch("/api/course-builder").then((res) => res.json()).then((data) => {
      if (data.error) alert("System Log: " + data.error + (data.details ? " | " + data.details : ""));
      setSubjects(Array.isArray(data) ? data : []);
    }).catch(e => console.error(e));
  };
  useEffect(() => { loadData(); }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/course-builder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "SUBJECT", name: newSubjectName }) });
    const data = await res.json();
    if (data.error) alert("Creation Failed: " + data.error + " | " + data.details);
    setNewSubjectName(""); loadData();
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject) return alert("Select a Course first.");
    const res = await fetch("/api/course-builder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "CHAPTER", title: newChapterTitle, subjectId: activeSubject }) });
    const data = await res.json();
    if (data.error) alert("Creation Failed: " + data.error + " | " + data.details);
    setNewChapterTitle(""); loadData();
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChapter) return alert("Select a Chapter first.");
    const res = await fetch("/api/course-builder/lesson", { 
      method: "POST", headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ title: lessonTitle, chapterId: activeChapter, videoUrl, pdfUrl, orderIndex: 1, isLive: broadcastType !== "VOD", liveUrl, broadcastType, scheduledStartTime: scheduledTime || null }) 
    });
    const data = await res.json();
    if (data.error) alert("Deployment Failed: " + data.error + " | " + data.details);
    else { 
      setLessonTitle(""); setVideoUrl(""); setPdfUrl(""); setBroadcastType("VOD"); setScheduledTime(""); setLiveUrl("");
      alert("Content Deployed Successfully."); 
      loadData(); 
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Enterprise Content Manager</h1>
        <p className="mt-2 text-slate-500 font-medium text-lg">Architect courses, build chapters, and deploy cinematic lessons.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Step 1: Create a Course</h2>
            <form onSubmit={handleCreateSubject} className="flex gap-4">
              <input type="text" required value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="e.g., Biology Fundamentals" className="flex-1 border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-bold" />
              <button type="submit" className="bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 shadow-md whitespace-nowrap transition-colors">Create Course</button>
            </form>
          </div>

          {subjects.length === 0 ? (
             <div className="text-center p-10 text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-3xl">Use the form above to create your first course.</div>
          ) : subjects.map((subject) => (
            <div key={subject.id} className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all ${activeSubject === subject.id ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200'}`}>
              <div onClick={() => setActiveSubject(subject.id)} className="bg-slate-900 p-6 text-white flex justify-between items-center cursor-pointer hover:bg-slate-800">
                <h2 className="text-xl font-black">{subject.name}</h2>
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-lg uppercase tracking-widest">{subject.chapters?.length || 0} Chapters</span>
              </div>
              
              {activeSubject === subject.id && (
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Step 2: Add Chapter to {subject.name}</h2>
                  <form onSubmit={handleCreateChapter} className="flex gap-4">
                    <input type="text" required value={newChapterTitle} onChange={e => setNewChapterTitle(e.target.value)} placeholder="e.g., Cell Structure" className="flex-1 border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium text-sm" />
                    <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 shadow-md text-sm">Add Chapter</button>
                  </form>
                </div>
              )}

              <div className="p-6 space-y-3">
                {subject.chapters?.map((chapter: any) => (
                  <div key={chapter.id} onClick={() => setActiveChapter(chapter.id)} className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${activeChapter === chapter.id ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                    <div className="font-bold text-slate-900">{chapter.name || chapter.title}</div>
                    {activeChapter === chapter.id && <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-1 rounded uppercase tracking-widest">Selected for Lesson</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 h-fit sticky top-6">
          <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">Step 3: Deploy Media</h3>
          <form onSubmit={handleAddLesson} className="space-y-4 mt-6">
            <input type="text" readOnly value={activeChapter ? "Target Chapter Locked" : "No Chapter Selected"} className={`w-full border rounded-xl p-3 text-sm font-bold cursor-not-allowed outline-none ${activeChapter ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`} />
            
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Lesson Title <span className="text-red-500">*</span></label>
              <input type="text" required value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder="e.g., Quantum Mechanics 101" className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium text-sm" />
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setIsLive(!isLive)}>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${isLive ? 'bg-red-600 text-white border-transparent' : 'border-2 border-slate-300 bg-white'}`}>
                {isLive && "✓"}
              </div>
              <span className="text-sm font-bold text-slate-900">This is a Live Broadcast</span>
            </div>

            {isLive ? (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div> Live Stream URL
                </label>
                <input type="url" required={isLive} value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="https://youtube.com/embed/..." className="w-full border border-red-300 bg-red-50 rounded-xl p-3 outline-none focus:border-red-500 font-bold text-sm text-red-900" />
              </div>
            ) : (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Video URL (VOD) <span className="text-slate-400 normal-case font-medium">(Optional)</span></label>
                <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium text-sm" />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">PDF Handout <span className="text-slate-400 normal-case font-medium">(Optional)</span></label>
              <input type="url" value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="https://..." className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium text-sm" />
            </div>
            
            <button type="submit" disabled={!activeChapter} className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-black hover:bg-blue-600 shadow-md disabled:opacity-50 mt-4 uppercase tracking-widest text-xs transition-colors">
              Inject Content
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
