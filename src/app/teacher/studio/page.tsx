"use client";
import { useEffect, useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";

export default function EnterpriseBroadcastStudio() {
  const [liveLessons, setLiveLessons] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<"LIVE_CLASS" | "DOUBT_SOLVING">("LIVE_CLASS");

  useEffect(() => {
    fetch("/api/teacher/studio").then(r => r.json()).then(setLiveLessons);
  }, []);

  const launchSession = (lessonId: string, type: "LIVE_CLASS" | "DOUBT_SOLVING") => {
    // Generate a unique, sanitized room name for the Jitsi server
    const uniqueRoom = `Gurucool-LMS-${lessonId.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`;
    setSessionType(type);
    setActiveRoom(uniqueRoom);
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
        
        <div className="flex-1 w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={activeRoom}
            configOverwrite={{
              startWithAudioMuted: true,
              startWithVideoMuted: false,
              prejoinPageEnabled: true, // Native hardware testing screen
              disableModeratorIndicator: false,
              // If it's a Live Class, we restrict the interface for viewers
              ...(sessionType === "LIVE_CLASS" ? {
                disableDeepLinking: true,
                hideConferenceTimer: true,
              } : {})
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
              SHOW_CHROME_EXTENSION_BANNER: false,
              // Clean up the UI
              TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
                'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
              ]
            }}
            userInfo={{
              displayName: 'Faculty Admin'
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = '100%';
              iframeRef.style.width = '100%';
            }}
          />
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
