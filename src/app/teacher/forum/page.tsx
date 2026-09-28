"use client";
import { useEffect, useState } from "react";

export default function FacultyCourseHub() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [activeSubject, setActiveSubject] = useState<string>("");
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");

  const loadData = () => {
    if (activeSubject) fetch(`/api/forum?subjectId=${activeSubject}`).then(r => r.json()).then(setPosts);
  };

  useEffect(() => {
    // Directly map the pure Subjects array sent by the updated backend
    fetch("/api/admin/courses").then(r => r.json()).then(data => {
      const subjectArray = Array.isArray(data) ? data : [];
      setSubjects(subjectArray);
      if (subjectArray.length > 0) setActiveSubject(subjectArray[0].id);
    }).catch(err => console.error("Failed to load subjects", err));
  }, []);

  useEffect(() => { loadData(); }, [activeSubject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/forum", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subjectId: activeSubject, content: newPost }) });
    setNewPost("");
    loadData();
  };

  const togglePin = async (postId: string, currentPinStatus: boolean) => {
    await fetch("/api/forum", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId, isPinned: !currentPinStatus }) });
    loadData();
  };

  const deletePost = async (postId: string) => {
    if (confirm("Delete this message permanently?")) {
      await fetch(`/api/forum?postId=${postId}`, { method: "DELETE" });
      loadData();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center z-10 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">Course Hubs <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded-md uppercase tracking-widest">Moderator View</span></h1>
          <p className="text-sm text-slate-500 font-medium">Broadcast announcements and moderate your batch discussions.</p>
        </div>
        <select value={activeSubject} onChange={e => setActiveSubject(e.target.value)} className="bg-slate-50 border border-slate-300 rounded-xl p-3 outline-none font-bold text-slate-700 focus:border-blue-500 cursor-pointer">
          {subjects.map(s => <option key={s.id} value={s.id}># {s.name}</option>)}
        </select>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {posts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 font-medium">No discussions in this cohort yet.</div>
        ) : posts.map(post => (
          <div key={post.id} className={`p-6 rounded-2xl border shadow-sm flex gap-4 max-w-4xl relative group ${post.isPinned ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button onClick={() => togglePin(post.id, post.isPinned)} className={`p-2 rounded-lg text-xs font-bold transition-colors ${post.isPinned ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-blue-100'}`}>📌 {post.isPinned ? 'Unpin' : 'Pin'}</button>
              <button onClick={() => deletePost(post.id)} className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-700">🗑️</button>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white shrink-0 ${post.user?.role === 'TEACHER' ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-700'}`}>
              {post.user?.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 pr-24">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-slate-900 text-lg">{post.user?.name || 'Unknown User'}</span>
                {post.user?.role === 'TEACHER' && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-black uppercase tracking-widest shadow-sm">Faculty</span>}
                <span className="text-xs text-slate-400 font-medium">{new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <p className={`font-medium leading-relaxed ${post.isPinned ? 'text-blue-900' : 'text-slate-700'}`}>{post.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <textarea required value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Broadcast to your batch..." className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 pr-32 outline-none focus:border-blue-500 font-medium resize-none h-24 text-slate-900"></textarea>
          <button type="submit" disabled={newPost.length < 10} className="absolute bottom-4 right-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 hover:bg-blue-700 transition-colors">Publish</button>
        </form>
      </div>
    </div>
  );
}
