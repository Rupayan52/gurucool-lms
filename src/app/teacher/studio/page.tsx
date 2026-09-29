"use client";
import { useEffect, useState, useRef } from "react";
import DailyIframe from "@daily-co/daily-js";

export default function EnterpriseBroadcastStudio() {
  const [liveLessons, setLiveLessons] = useState<any[]>([]);
  const [activeRoomUrl, setActiveRoomUrl] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<any>(null);

  useEffect(() => {
    fetch("/api/teacher/studio").then(r => r.json()).then(setLiveLessons);
  }, []);

  const goLive = async (lessonId: string) => {
    setIsDeploying(true);
    const res = await fetch(`/api/broadcast?room=${lessonId}-${Date.now()}`);
    const data = await res.json();
    
    if (data.error) {
      alert("API Error: " + data.error);
      setIsDeploying(false);
      return;
    }
    
    setActiveRoomUrl(data.url);
    setIsDeploying(false);
  };

  useEffect(() => {
    if (activeRoomUrl && containerRef.current) {
      const callFrame = DailyIframe.createFrame(containerRef.current, {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
          borderRadius: '12px',
        },
        showLeaveButton: true,
        showFullscreenButton: true,
      });
      
      callFrameRef.current = callFrame;
      callFrame.join({ url: activeRoomUrl });

      callFrame.on('left-meeting', () => {
        callFrame.destroy();
        setActiveRoomUrl(null);
      });
    }

    return () => {
      if (callFrameRef.current) callFrameRef.current.destroy();
    };
  }, [activeRoomUrl]);

  if (activeRoomUrl) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col fixed inset-0 z-[100] p-4 sm:p-8">
        <div className="flex justify-between items-center text-white mb-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
            <h1 className="font-black tracking-widest uppercase text-sm sm:text-lg">Live Transmission Engine</h1>
          </div>
          <div className="flex gap-4">
            <a href={activeRoomUrl} target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all text-white shadow-xl">
              Launch in New Tab (Debug)
            </a>
            <button onClick={() => { if (callFrameRef.current) callFrameRef.current.destroy(); setActiveRoomUrl(null); }} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all text-white shadow-xl">
              Force Close
            </button>
          </div>
        </div>
        
        <div className="flex-1 w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800" ref={containerRef}>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Broadcast Studio</h1>
        <p className="mt-2 text-slate-500 font-medium text-sm sm:text-lg">Global Edge Network Enabled. Ready for Transmission.</p>
      </header>
      
      <div className="space-y-6">
        {liveLessons.filter(l => l.broadcastType === "NATIVE_WEBRTC").map(lesson => (
          <div key={lesson.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{lesson.title}</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-bold font-mono mt-1">{lesson.id}</p>
            </div>
            <button 
              onClick={() => goLive(lesson.id)} 
              disabled={isDeploying}
              className="w-full sm:w-auto bg-slate-900 hover:bg-blue-600 disabled:bg-slate-400 text-white px-10 py-4 sm:py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl"
            >
              {isDeploying ? "Deploying..." : "Enter Studio"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
