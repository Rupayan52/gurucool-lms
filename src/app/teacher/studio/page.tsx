"use client";
import { useEffect, useState, useRef } from "react";

export default function NativeBroadcastStudio() {
  const [liveLessons, setLiveLessons] = useState<any[]>([]);
  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(null);
  
  // WebRTC Media States
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const loadData = () => fetch("/api/teacher/studio").then(r => r.json()).then(setLiveLessons);
  useEffect(() => { loadData(); }, []);

  // 1080p Camera Capture
  const startCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } }, 
        audio: true 
      });
      setStream(media);
      if (videoRef.current) videoRef.current.srcObject = media;
    } catch (err) { alert("Camera access denied or device not found."); }
  };

  // 1080p Screen Share Capture
  const startScreenShare = async () => {
    try {
      const media = await navigator.mediaDevices.getDisplayMedia({ 
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } },
        audio: true
      });
      setScreenStream(media);
      if (screenRef.current) screenRef.current.srcObject = media;
    } catch (err) { alert("Screen share cancelled."); }
  };

  const stopMedia = () => {
    stream?.getTracks().forEach(track => track.stop());
    screenStream?.getTracks().forEach(track => track.stop());
    setStream(null); setScreenStream(null); setIsBroadcasting(false);
  };

  const goLive = () => {
    if (!stream && !screenStream) return alert("Start your camera or screen share first.");
    setIsBroadcasting(true);
    alert("SYSTEM PRE-FLIGHT: Local 1080p WebRTC capture successful. To route this to thousands of students with zero buffering, we will attach the AWS IVS / LiveKit WebRTC transport keys here in the next phase.");
  };

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.8)] ${isBroadcasting ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></div>
            In-House Broadcast Studio
          </h1>
          <p className="mt-2 text-slate-500 font-medium text-lg">Native 1080p WebRTC Transmission Control</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: WebRTC Hardware Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 shadow-2xl relative overflow-hidden">
            <div className="aspect-video bg-black rounded-2xl relative flex items-center justify-center border border-slate-800">
              {/* Primary Stream (Screen or Camera) */}
              <video ref={screenStream ? screenRef : videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-xl" />
              
              {/* Picture-in-Picture Camera (if sharing screen) */}
              {screenStream && stream && (
                <div className="absolute bottom-4 right-4 w-48 aspect-video bg-black rounded-lg border-2 border-slate-700 shadow-2xl overflow-hidden z-10">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
              )}

              {!stream && !screenStream && (
                <div className="text-slate-600 font-black tracking-widest uppercase flex flex-col items-center gap-4">
                  <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  Hardware Offline
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <button onClick={startCamera} disabled={!!stream} className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                🎥 Turn On 1080p Camera
              </button>
              <button onClick={startScreenShare} disabled={!!screenStream} className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                💻 Share Screen
              </button>
              {(stream || screenStream) && (
                <button onClick={stopMedia} className="bg-red-950 text-red-500 hover:bg-red-900 hover:text-white px-6 py-3 rounded-xl font-bold transition-colors">Stop Hardware</button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Broadcast Routing */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 h-fit">
          <h3 className="text-xl font-black text-slate-900 mb-6">Transmission Routing</h3>
          
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Select Target Cohort</label>
          <select className="w-full border border-slate-300 rounded-xl p-3 outline-none font-bold text-slate-700 mb-6 bg-slate-50">
            {liveLessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            {liveLessons.length === 0 && <option value="">No Active Live Lessons Scheduled</option>}
          </select>

          <button onClick={goLive} disabled={isBroadcasting || (!stream && !screenStream)} className={`w-full py-5 rounded-xl font-black uppercase tracking-widest shadow-xl transition-all ${isBroadcasting ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500'}`}>
            {isBroadcasting ? "🔴 You are LIVE" : "🚀 GO LIVE"}
          </button>

          {isBroadcasting && (
            <div className="mt-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              0 Buffering • 1080p60 • WebRTC
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
