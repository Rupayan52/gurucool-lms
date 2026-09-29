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
    const res = await fetch(`/api/livekit?room=${lessonId}`);
    const data = await res.json();
    if (data.error) return alert("System Auth Error: " + data.error);
    setToken(data.token);
    setActiveRoom(lessonId);
  };

  if (token && activeRoom) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
            <h1 className="font-black tracking-widest uppercase">Live Transmission Active</h1>
          </div>
          <button onClick={() => { setToken(""); setActiveRoom(null); }} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors shadow-lg">
            Terminate Broadcast
          </button>
        </div>
        
        {/* WEBRTC ENGINE */}
        <div className="flex-1 relative">
          <LiveKitRoom
            video={false} // DO NOT auto-publish (prevents browser block)
            audio={false} // DO NOT auto-publish
            connect={true} // Explicitly force the WebSocket connection
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            data-lk-theme="default"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {/* The VideoConference component automatically provides the ControlBar (Mic/Cam/Screen buttons) */}
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-slate-300"></div>
            Enterprise Broadcast Studio
          </h1>
          <p className="mt-2 text-slate-500 font-medium text-lg">SFU WebRTC Engine Ready. Select a cohort to begin transmission.</p>
        </div>
      </header>
      <div className="space-y-6">
        {liveLessons.filter(l => l.broadcastType === "NATIVE_WEBRTC").map(lesson => (
          <div key={lesson.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md">Scheduled Live</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">{lesson.title}</h2>
              <p className="text-sm text-slate-500 font-bold font-mono">{lesson.id}</p>
            </div>
            <button onClick={() => goLive(lesson.id)} className="bg-slate-900 hover:bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl hover:shadow-blue-500/20">
              Go Live
            </button>
          </div>
        ))}
        {liveLessons.filter(l => l.broadcastType === "NATIVE_WEBRTC").length === 0 && (
          <div className="p-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center font-bold text-slate-500">No WebRTC lessons scheduled. Deploy one from the Content Manager.</div>
        )}
      </div>
    </div>
  );
}
