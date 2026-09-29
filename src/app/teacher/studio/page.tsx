"use client";
import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";

export default function EnterpriseBroadcastStudio() {
  const [liveLessons, setLiveLessons] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    fetch("/api/teacher/studio").then(r => r.json()).then(setLiveLessons);
  }, []);

  const goLive = async (lessonId: string) => {
    setToken("");
    
    // Cache-buster ensures we always get a fresh token from Vercel
    const res = await fetch(`/api/livekit?room=${lessonId}&broadcaster=true&bust=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    const data = await res.json();
    if (data.error) return alert("System Auth Error: " + data.error);
    setToken(data.token);
    setActiveRoom(lessonId);
  };

  if (token && activeRoom) {
    let safeUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";
    safeUrl = safeUrl.replace("http://", "ws://").replace("https://", "wss://");

    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col fixed inset-0 z-[100]">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
            <h1 className="font-black tracking-widest uppercase text-sm sm:text-lg">Transmission: {activeRoom}</h1>
          </div>
          <button onClick={() => { setToken(""); setActiveRoom(null); }} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all">
            End Broadcast
          </button>
        </div>
        
        <div className="flex-1 relative flex flex-col">
          {safeUrl ? (
            <LiveKitRoom
              video={true} // Letting LiveKit handle the camera natively
              audio={true} // Letting LiveKit handle the mic natively
              connect={true} 
              token={token}
              serverUrl={safeUrl}
              data-lk-theme="default"
              style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}
            >
              {/* This is the official, mobile-responsive Zoom-like interface */}
              <VideoConference />
              <RoomAudioRenderer />
            </LiveKitRoom>
          ) : (
            <div className="flex-1 flex items-center justify-center text-red-500 font-black uppercase text-xl">CRITICAL ERROR: MISSING URL</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-slate-300 hidden sm:block"></div>
            Broadcast Studio
          </h1>
          <p className="mt-2 text-slate-500 font-medium text-sm sm:text-lg">Mobile & Desktop WebRTC Engine Ready.</p>
        </div>
      </header>
      <div className="space-y-6">
        {liveLessons.filter(l => l.broadcastType === "NATIVE_WEBRTC").map(lesson => (
          <div key={lesson.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{lesson.title}</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-bold font-mono">{lesson.id}</p>
            </div>
            <button onClick={() => goLive(lesson.id)} className="w-full sm:w-auto bg-slate-900 hover:bg-blue-600 text-white px-10 py-4 sm:py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl">
              Go Live
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
