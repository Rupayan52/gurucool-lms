"use client";
import { useEffect, useState } from "react";

export default function BroadcastStudio() {
  const [liveLessons, setLiveLessons] = useState<any[]>([]);
  const [vodUrls, setVodUrls] = useState<Record<string, string>>({});

  const loadData = () => fetch("/api/teacher/studio").then(r => r.json()).then(setLiveLessons);
  useEffect(() => { loadData(); }, []);

  const handleEndBroadcast = async (lessonId: string) => {
    const vodUrl = vodUrls[lessonId];
    if (!vodUrl) return alert("Please provide the recorded Video URL before ending the broadcast.");
    
    await fetch("/api/teacher/studio", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, videoUrl: vodUrl })
    });
    alert("Broadcast Ended. Recorded VOD has been published to all students.");
    loadData();
  };

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]"></div>
          Broadcast Studio
        </h1>
        <p className="mt-2 text-slate-500 font-medium text-lg">Manage active livestreams and publish recorded VODs.</p>
      </header>

      <div className="space-y-6">
        {liveLessons.length === 0 ? (
          <div className="p-10 bg-white rounded-3xl border border-slate-200 text-center font-bold text-slate-500 shadow-sm">No active broadcasts. Deploy a Live Lesson from the Content Manager.</div>
        ) : liveLessons.map(lesson => (
          <div key={lesson.id} className="bg-white rounded-3xl border border-red-200 shadow-[0_0_20px_rgba(239,68,68,0.1)] p-8 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-red-600 text-white px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md">Live Now</span>
                <span className="text-slate-400 font-mono text-xs">{lesson.id}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">{lesson.title}</h2>
              <a href={lesson.liveUrl} target="_blank" className="text-blue-600 font-bold hover:underline break-all text-sm">{lesson.liveUrl}</a>
            </div>
            
            <div className="w-full md:w-96 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Publish Recorded VOD</label>
              <input type="url" value={vodUrls[lesson.id] || ""} onChange={e => setVodUrls({...vodUrls, [lesson.id]: e.target.value})} placeholder="https://..." className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-red-500 font-medium text-sm mb-4" />
              <button onClick={() => handleEndBroadcast(lesson.id)} className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-md text-sm">
                End Broadcast & Publish VOD
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
