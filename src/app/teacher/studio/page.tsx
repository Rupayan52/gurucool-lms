"use client";
import { useEffect, useState } from "react";

export default function EnterpriseBroadcastStudio() {
  const [liveLessons, setLiveLessons] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<"LIVE_CLASS" | "DOUBT_SOLVING">("LIVE_CLASS");
  const [roomUrl, setRoomUrl] = useState<string>("");

  useEffect(() => {
    fetch("/api/teacher/studio").then(r => r.json()).then(setLiveLessons);
  }, []);

  const launchSession = (lessonId: string, type: "LIVE_CLASS" | "DOUBT_SOLVING") => {
    const uniqueRoom = `GurucoolLMS${lessonId.replace(/[^a-zA-Z0-9]/g, '')}${Date.now()}`;
    setSessionType(type);
    setActiveRoom(uniqueRoom);

    // Strict Jitsi configuration parameters
    const jitsiConfig = [
      "config.prejoinPageEnabled=true",
      "config.disableDeepLinking=true",
      "config.startWithAudioMuted=true",
      "userInfo.displayName=" + encodeURIComponent("Faculty Admin")
    ].join("&");

    const url = `https://meet.jit.si/${uniqueRoom}#${jitsiConfig}`;
    setRoomUrl(url);

    // THE FIX: Launches immediately in a focused, clean app window, bypassing all iframe blocks globally
    window.open(url, "_blank", "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no");
  };

  if (activeRoom) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col fixed inset-0 z-[100] p-4 sm:p-8">
        <div className="flex justify-between items-center text-white mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)] ${sessionType === 'LIVE_CLASS' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
            <h1 className="font-black tracking-widest uppercase text-sm sm:text-lg">
              {sessionType === "LIVE_CLASS" ? "Live Broadcast Mode" : "Interactive Doubt Solving"}
            </h1>
          </div>
          <button 
            onClick={() => setActiveRoom(null)} 
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all text-white shadow-xl"
          >
            End Session
          </button>
        </div>
        
        {/* Clean UI showing the broadcast is running natively */}
        <div className="flex-1 w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </div>
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-widest">Session Active</h2>
            <p className="text-slate-400 max-w-lg mb-8 text-lg">
              Your secure broadcast environment has been launched in a native application window to bypass all browser security restrictions.
            </p>
            <div className="flex gap-4">
                <button 
                    onClick={() => window.open(roomUrl, "_blank", "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(5,150,105,0.4)]"
                >
                    Re-Open Studio Window
                </button>
            </div>
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
          <div key={lesson.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col items-start justify-between gap-6">
            <div className="w-full">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{lesson.title}</h2>
              <div className="flex gap-2 mt-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">Multi-Device Ready</span>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full font-mono">{lesson.id}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button 
                onClick={() => launchSession(lesson.id, "LIVE_CLASS")} 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg"
              >
                Launch Live Class
              </button>
              <button 
                onClick={() => launchSession(lesson.id, "DOUBT_SOLVING")} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg"
              >
                Start Doubt Solving (Zoom)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
