"use client";
import { useEffect, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer, VideoTrack, useTracks, useLocalParticipant, useConnectionState } from "@livekit/components-react";
import { Track, ConnectionState } from "livekit-client";
import "@livekit/components-styles";

// 1. NATIVE PUNCH-THROUGH HARDWARE CONTROLS
function RawHardwareControls() {
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(false);

  const igniteHardware = async () => {
    if (connectionState !== ConnectionState.Connected) {
      alert(`Cannot ignite hardware. The server is currently: ${connectionState}. Check your Vercel Environment Variables.`);
      return;
    }

    try {
      // NATIVE BROWSER OVERRIDE: Force Chrome permission popup directly via native HTML5
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Release the native lock immediately so LiveKit can take exclusive control
      stream.getTracks().forEach(t => t.stop());

      // Inject directly into the LiveKit Engine
      await localParticipant?.setMicrophoneEnabled(true);
      await localParticipant?.setCameraEnabled(true);
      setMicOn(true);
      setCamOn(true);
    } catch (error) {
      alert("Chrome strictly blocked hardware access. Click the Camera icon in your URL address bar to manually Allow it.");
    }
  };

  const toggleMic = async () => {
    await localParticipant?.setMicrophoneEnabled(!micOn);
    setMicOn(!micOn);
  };

  const toggleCam = async () => {
    await localParticipant?.setCameraEnabled(!camOn);
    setCamOn(!camOn);
  };

  if (!camOn && !micOn) {
    return (
      <div className="bg-slate-900 border-t border-slate-800 p-6 flex justify-center gap-6 z-50">
        <button onClick={igniteHardware} className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.5)]">
          Ignite Hardware Transmission
        </button>
      </div>
    );
  }

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
  const connectionState = useConnectionState();
  
  return (
    <div className="flex-1 flex items-center justify-center bg-black p-4 gap-4 w-full h-full relative">
      {tracks.length === 0 && (
        <div className="text-slate-500 font-black tracking-widest uppercase text-xl flex flex-col items-center gap-4 animate-pulse">
          <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          {connectionState === ConnectionState.Connected ? "Hardware Offline. Click 'Ignite' below." : `Network Status: ${connectionState}`}
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
    let safeUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";
    safeUrl = safeUrl.replace("http://", "ws://").replace("https://", "wss://");

    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col fixed inset-0 z-[100]">
        <div className="p-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,1)]"></div>
            <h1 className="font-black tracking-widest uppercase text-xl">Transmission: {activeRoom}</h1>
            <span className="ml-4 text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded">URL: {safeUrl ? safeUrl.substring(0,25) + '...' : 'MISSING URL'}</span>
          </div>
          <button onClick={() => { setToken(""); setActiveRoom(null); }} className="bg-slate-800 hover:bg-red-600 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl">
            End Broadcast
          </button>
        </div>
        
        <div className="flex-1 relative flex flex-col">
          {safeUrl ? (
            <LiveKitRoom
              video={false} 
              audio={false} 
              connect={true} 
              token={token}
              serverUrl={safeUrl}
              data-lk-theme="default"
              style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}
            >
              <BulletproofGrid />
              <RawHardwareControls />
              <RoomAudioRenderer />
            </LiveKitRoom>
          ) : (
             <div className="flex-1 flex items-center justify-center text-red-500 font-black uppercase text-xl">CRITICAL ERROR: NEXT_PUBLIC_LIVEKIT_URL IS MISSING FROM VERCEL</div>
          )}
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
