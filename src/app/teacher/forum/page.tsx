"use client";
import { useEffect, useState } from "react";

export default function ModeratorForum() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [activeSubject, setActiveSubject] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch("/api/catalog").then(r => r.json()).then(data => {
      const subs = data.subjects || [];
      setSubjects(subs);
      // Auto-select the first subject to prevent null queries
      if (subs.length > 0) setActiveSubject(subs[0]); 
    });
  }, []);

  useEffect(() => {
    if (!activeSubject) return;
    
    fetch(`/api/forum?subjectId=${activeSubject.id}`)
      .then(r => r.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(e => console.error(e));
  }, [activeSubject]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeSubject) return;
    
    await fetch("/api/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId: activeSubject.id, content: text, text: text })
    });
    
    setText("");
    fetch(`/api/forum?subjectId=${activeSubject.id}`)
      .then(r => r.json())
      .then(data => setMessages(Array.isArray(data) ? data : []));
  };

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          Course Hubs <span className="bg-blue-100 text-blue-700 text-[10px] uppercase tracking-widest px-2 py-1 rounded-md">Moderator View</span>
        </h1>
        <p className="mt-2 text-slate-500 font-medium text-lg">Broadcast announcements and moderate your batch discussions.</p>
      </header>

      <div className="flex h-[600px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-2 overflow-y-auto">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Subject Channels</h3>
          {subjects.map(sub => (
            <button 
              key={sub.id} 
              onClick={() => setActiveSubject(sub)}
              className={`text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeSubject?.id === sub.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              # {sub.name.toLowerCase()}
            </button>
          ))}
        </div>

        {/* MAIN CHAT AREA */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-6 border-b border-slate-100 bg-white shadow-sm z-10">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span className="text-blue-500">#</span> {activeSubject?.name || "Loading..."}
            </h2>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 font-medium mt-10">No discussions in this cohort yet.</div>
            ) : messages.map((msg, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {msg.user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="font-bold text-slate-900 text-sm">{msg.user?.name || "Student"}</span>
                </div>
                <p className="text-slate-700 font-medium">{msg.content || msg.text || msg.message}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handlePublish} className="flex gap-4">
              <input 
                type="text" 
                value={text} 
                onChange={e => setText(e.target.value)} 
                placeholder="Broadcast to your batch..." 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-blue-500 font-medium text-slate-700" 
              />
              <button type="submit" disabled={!text.trim()} className="bg-blue-600 text-white px-8 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
                Publish
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
