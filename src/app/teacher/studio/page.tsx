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
    const res = await fetch(`/api/livekit?room=${lessonId}&bust=${Date.now()}`);
    const data = await res.json();
    if (data.error) return alert("API Error: " + data.error);
    setToken(data.token);
    setActiveRoom(lessonId);
  };

  if (token && activeRoom) {
    // HARDCODED URL to bypass Vercel environment variable corruption
    const hardcodedUrl = "wss://gurucool-lms-tx4rja80.livekit.cloud";

    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col fixed inset-0 z-[100]">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h1 className="font-black tracking-widest uppercase text-sm sm:text-lg">Live: {activeRoom}</h1>
          </div>
          <button onClick={() => { setToken(""); setActiveRoom(null); }} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all">
            End Broadcast
          </button>
        </div>
        
        <div className="flex-1 relative flex flex-col">
          <LiveKitRoom
            video={true} 
            audio={true} 
            connect={true} 
            token={token}
            serverUrl={hardcodedUrl}
            data-lk-theme="default"
            style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}
            onDisconnected={(reason) => {
              if (reason) console.error("LiveKit Disconnected Reason:", reason);
            }}
          >
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">Broadcast Studio</h1>
          <p className="mt-2 text-slate-500 font-medium text-sm sm:text-lg">Hardcoded bypass deployed.</p>
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
