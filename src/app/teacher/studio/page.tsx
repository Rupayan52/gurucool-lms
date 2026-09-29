"use client";
import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference, RoomAudioRenderer, PreJoin, LocalUserChoices } from "@livekit/components-react";
import "@livekit/components-styles";

export default function EnterpriseBroadcastStudio() {
  const [liveLessons, setLiveLessons] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [networkError, setNetworkError] = useState("");
  const [preJoinChoices, setPreJoinChoices] = useState<LocalUserChoices | undefined>(undefined);

  useEffect(() => {
    fetch("/api/teacher/studio").then(r => r.json()).then(setLiveLessons);
  }, []);

  const goLive = async (lessonId: string) => {
    setToken("");
    setNetworkError("");
    setPreJoinChoices(undefined);
    const res = await fetch(`/api/livekit?room=${lessonId}&bust=${Date.now()}`);
    const data = await res.json();
    if (data.error) return alert("API Error: " + data.error);
    setToken(data.token);
    setActiveRoom(lessonId);
  };

  if (token && activeRoom) {
    const hardcodedUrl = "wss://gurucool-lms-tx4rja80.livekit.cloud";

    if (!preJoinChoices) {
      return (
        <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center fixed inset-0 z-[100] p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <h1 className="text-2xl font-black text-white text-center mb-6 uppercase tracking-widest">Hardware Setup</h1>
            
            {/* CRITICAL FIX: Wrapped PreJoin in the LiveKit theme data attribute so styles render properly */}
            <div className="rounded-xl overflow-hidden shadow-lg border-2 border-slate-700 bg-slate-950" data-lk-theme="default">
              <PreJoin
                defaults={{
                  audioEnabled: false,
                  videoEnabled: false,
                }}
                onSubmit={(values) => setPreJoinChoices(values)}
                onError={(err) => console.warn("Hardware locked by OS:", err)}
              />
            </div>

            <button onClick={() => { setToken(""); setActiveRoom(null); }} className="mt-8 w-full text-red-500 hover:text-red-400 font-bold uppercase tracking-widest text-xs transition-colors">
              Cancel Broadcast
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col fixed inset-0 z-[100]">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
            <h1 className="font-black tracking-widest uppercase text-sm sm:text-lg">Live: {activeRoom}</h1>
          </div>
          <button onClick={() => { setToken(""); setActiveRoom(null); setPreJoinChoices(undefined); }} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all">
            End Broadcast
          </button>
        </div>
        
        {networkError && (
          <div className="bg-red-600 text-white font-black p-4 text-center text-sm uppercase tracking-widest z-50 shadow-xl">
            Connection Issue: {networkError}
          </div>
        )}

        <div className="flex-1 relative flex flex-col">
          <LiveKitRoom
            video={preJoinChoices.videoEnabled}
            audio={preJoinChoices.audioEnabled}
            connect={true} 
            token={token}
            serverUrl={hardcodedUrl}
            data-lk-theme="default"
            style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}
            onDisconnected={(reason) => setNetworkError(String(reason || "Unknown Disconnect"))}
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
          <p className="mt-2 text-slate-500 font-medium text-sm sm:text-lg">Cross-Platform Enterprise Engine Active.</p>
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
              Enter Studio
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
