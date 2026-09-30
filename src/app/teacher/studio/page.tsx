"use client";
import { useEffect, useState, useRef } from "react";
import DailyIframe from "@daily-co/daily-js";

export default function EnterpriseBroadcastStudio() {
  const [liveLessons, setLiveLessons] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<{url: string, token: string} | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<any>(null);

  useEffect(() => {
    fetch("/api/teacher/studio").then(r => r.json()).then(setLiveLessons);
  }, []);

  const goLive = async (lessonId: string) => {
    setIsDeploying(true);
    
    // Fetch both the URL and the Faculty Owner Token
    const res = await fetch(`/api/broadcast?room=${lessonId}`);
    const data = await res.json();
    
    if (data.error) {
      alert("System Architecture Error: " + data.error);
      setIsDeploying(false);
      return;
    }
    
    setActiveSession({ url: data.url, token: data.token });
    setIsDeploying(false);
  };

  useEffect(() => {
    if (activeSession && containerRef.current) {
      // Initialize Daily with responsive mobile/desktop configuration
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
      
      // THE FIX: Passing the token bypasses the iframe X-Frame-Options block entirely
      callFrame.join({ 
        url: activeSession.url, 
        token: activeSession.token 
      });

      callFrame.on('left-meeting', () => {
        callFrame.destroy();
        setActiveSession(null);
      });
    }

    return () => {
      if (callFrameRef.current) callFrameRef.current.destroy();
    };
  }, [activeSession]);

  if (activeSession) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col fixed inset-0 z-[100] p-4 sm:p-8">
        <div className="flex justify-between items-center text-white mb-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
            <h1 className="font-black tracking-widest uppercase text-sm sm:text-lg">Live Faculty Engine</h1>
          </div>
          <button 
            onClick={() => { if (callFrameRef.current) callFrameRef.current.destroy(); setActiveSession(null); }} 
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all text-white shadow-xl"
          >
            End Transmission
          </button>
        </div>
        
        {/* The Native Daily Component - Protected by Owner Token */}
        <div className="flex-1 w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800" ref={containerRef}>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-10 border-b border-slate-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Transmission Hub</h1>
        <p className="mt-2 text-slate-500 font-medium text-sm sm:text-lg">Unified Engine for Live Broadcasts & Interactive Doubt Solving.</p>
      </header>
      
      <div className="grid grid-cols-1 gap-6">
        {liveLessons.filter(l => l.broadcastType === "NATIVE_WEBRTC").map(lesson => (
          <div key={lesson.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{lesson.title}</h2>
              <div className="flex gap-2 mt-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">Multi-Device Ready</span>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full font-mono">{lesson.id}</span>
              </div>
            </div>
            <button 
              onClick={() => goLive(lesson.id)} 
              disabled={isDeploying}
              className="w-full sm:w-auto bg-slate-900 hover:bg-blue-600 disabled:bg-slate-400 text-white px-10 py-4 sm:py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl whitespace-nowrap"
            >
              {isDeploying ? "Authenticating..." : "Start Session"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
