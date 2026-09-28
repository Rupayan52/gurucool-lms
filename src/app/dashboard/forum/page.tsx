"use client";
import { useEffect, useState } from "react";

export default function StudentCourseHub() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [activeSubject, setActiveSubject] = useState<string>("");
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");

  useEffect(() => {
    fetch("/api/student/subjects").then(r => r.json()).then(data => {
      setSubjects(data);
      if (data.length > 0) setActiveSubject(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (activeSubject) fetch(`/api/forum?subjectId=${activeSubject}`).then(r => r.json()).then(setPosts);
  }, [activeSubject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/forum", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subjectId: activeSubject, content: newPost }) });
    setNewPost("");
    fetch(`/api/forum?subjectId=${activeSubject}`).then(r => r.json()).then(setPosts);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Course Hubs</h1>
        <p className="mt-2 text-slate-500 font-medium text-lg">Collaborate in your assigned batch channels.</p>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[700px]">
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Subject Channels</div>
          <div className="space-y-1">
            {subjects.map(s => (
              <button key={s.id} onClick={() => setActiveSubject(s.id)} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all text-sm ${activeSubject === s.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}>
                # {s.name.toLowerCase().replace(/\s+/g, '-')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white">
          <div className="p-6 border-b border-slate-100 bg-white z-10 shadow-sm">
            <h2 className="font-black text-slate-900 text-lg"># {subjects.find(s => s.id === activeSubject)?.name || "Select a channel"}</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {posts.map(post => (
              <div key={post.id} className={`p-5 rounded-2xl border flex gap-4 max-w-3xl ${post.isPinned ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white shrink-0 ${post.user.role === 'TEACHER' ? 'bg-blue-600 ring-2 ring-blue-200' : 'bg-slate-700'}`}>
                  {post.user.name.charAt(0)}
                </div>
                <div>
                  <div className="flex gap-2 mb-1">
                    <span className="font-bold text-slate-900">{post.user.name}</span>
                    {post.user.role === 'TEACHER' && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black uppercase tracking-widest">Faculty</span>}
                    {post.isPinned && <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest">📌 Pinned</span>}
                  </div>
                  <p className={`font-medium leading-relaxed ${post.isPinned ? 'text-blue-900' : 'text-slate-700'}`}>{post.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white border-t border-slate-100">
            <form onSubmit={handleSubmit} className="relative">
              <textarea required value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Contribute to the discussion..." className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 pr-32 outline-none focus:border-blue-500 font-medium resize-none h-24"></textarea>
              <button type="submit" disabled={newPost.length < 10} className="absolute bottom-4 right-4 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50">Publish</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
