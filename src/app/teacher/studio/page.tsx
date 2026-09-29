"use client";
import { useEffect, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer, VideoTrack, useTracks, useLocalParticipant, ConnectionStateToast } from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

// 1. RAW HTML HARDWARE CONTROLS (LiveKit cannot hide these)
function RawHardwareControls() {
  const { localParticipant } = useLocalParticipant();
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(false);

  const toggleCam = async () => {
    if (!localParticipant) return;
    await localParticipant.setCameraEnabled(!camOn);
    setCamOn(!camOn);
  };

  const toggleMic = async () => {
    if (!localParticipant) return;
    await localParticipant.setMicrophoneEnabled(!micOn);
    setMicOn(!micOn);
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-6 flex justify-center gap-6 z-50">
      <button onClick={toggleMic} className={`px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl ${micOn ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
        {micOn ? "Disable Microphone" : "Enable Microphone"}
      </button>
      <button onClick={toggleCam} className={`px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl ${camOn ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
        {camOn ? "Disable Camera" : "Enable Camera"}
      </button>
    </div>
  );
}

// 2. BULLETPROOF VIDEO GRID
function BulletproofGrid() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  
  return (
    <div className="flex-1 flex items-center justify-center bg-black p-4 gap-4 w-full h-full relative">
      <ConnectionStateToast />
      {tracks.length === 0 && (
        <div className="text-slate-500 font-black tracking-widest uppercase text-xl flex flex-col items-center gap-4 animate-pulse">
          <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          Hardware Offline. Click buttons below to ignite stream.
        </div>
      )}
      {tracks.map((t) => (
        <div key={t.participant.identity + t.source} className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700 w-full max-w-6xl aspect-video relative">
          <VideoTrack trackRef={t} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest animate-pulse shadow-lg">Live</div>
        </div>
      ))}
    </div>
  );
}

export default function EnterpriseBroadcastStudio() {
  const [liveLessons, setLiveLessons] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    fetch("/api/teacher/studio").then(r => r.json()).then(setLiveLessons);
  }, []);

  const goLive = async (lessonId: string) => {
    setToken("");
    const res = await fetch(`/api/livekit?room=${lessonId}`);
    const data = await res.json();
    if (data.error) return alert("System Auth Error: " + data.error);
    setToken(data.token);
    setActiveRoom(lessonId);
  };

  if (token && activeRoom) {
    // URL SANITIZER: Instantly fixes https:// to wss:// to prevent connection crashes
    let safeUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";
    safeUrl = safeUrl.replace("http://", "ws://").replace("https://", "wss://");

    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col fixed inset-0 z-[100]">
        <div className="p-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,1)]"></div>
            <h1 className="font-black tracking-widest uppercase text-xl">Transmission: {activeRoom}</h1>
          </div>
          <button onClick={() => { setToken(""); setActiveRoom(null); }} className="bg-slate-800 hover:bg-red-600 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl">
            End Broadcast
          </button>
        </div>
        
        <div className="flex-1 relative flex flex-col">
          <LiveKitRoom
            video={false} 
            audio={false} 
            connect={true} 
            token={token}
            serverUrl={safeUrl}
            data-lk-theme="default"
            style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}
            // Removed onDisconnected auto-close so the UI NEVER vanishes on you.
          >
            <BulletproofGrid />
            <RawHardwareControls />
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
              <h2 className="text-2xl font-black text-slate-900 mb-1">{lesson.title}</h2>
              <p className="text-sm text-slate-500 font-bold font-mono">{lesson.id}</p>
            </div>
            <button onClick={() => goLive(lesson.id)} className="bg-slate-900 hover:bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl">
              Go Live
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
