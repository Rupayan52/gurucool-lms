"use client";
import { useEffect, useState } from "react";

const MOCK_AI_DOUBTS = [
  { id: 1, student: "Aarav Sharma", doubt: "Can you explain the Coriolis effect on the projectile again?", aiScore: 98, analytics: "Top 5% Performer • High Engagement", status: "pending" },
  { id: 2, student: "Sneha Patel", doubt: "I didn't understand the derivation in step 4.", aiScore: 85, analytics: "Consistent Viewer • Struggling with Calculus", status: "pending" },
  { id: 3, student: "Rahul Verma", doubt: "Will this be in the exam?", aiScore: 12, analytics: "Low Engagement • Frequently asks off-topic", status: "pending" },
];

export default function EnterpriseBroadcastStudio() {
  const [liveLessons, setLiveLessons] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [roomUrl, setRoomUrl] = useState<string>("");
  
  const [chatUnlocked, setChatUnlocked] = useState(false);
  const [doubtsQueue, setDoubtsQueue] = useState(MOCK_AI_DOUBTS);

  useEffect(() => {
    fetch("/api/teacher/studio").then(r => r.json()).then(setLiveLessons);
  }, []);

  const launchLiveClass = (lessonId: string) => {
    const uniqueRoom = `GurucoolLMS${lessonId.replace(/[^a-zA-Z0-9]/g, '')}${Date.now()}`;
    setActiveRoom(uniqueRoom);

    // CRITICAL FIX 1: Disabled prejoin page to skip hardware test and go LIVE instantly
    const jitsiConfig = [
      "config.prejoinPageEnabled=false",
      "config.startWithAudioMuted=false",
      "config.startWithVideoMuted=false",
      "userInfo.displayName=" + encodeURIComponent("Faculty Admin")
    ].join("&");

    // CRITICAL FIX 2: Switched to FFMUC Enterprise Cluster to completely bypass the Jitsi Login Wall
    const url = `https://meet.ffmuc.net/${uniqueRoom}#${jitsiConfig}`;
    setRoomUrl(url);

    // CRITICAL FIX 3: Opened as a standard blank tab to ensure Chrome unlocks the Screen Share API
    window.open(url, "_blank");
  };

  const handleDoubtAction = (id: number, action: "resolve" | "dismiss") => {
    setDoubtsQueue(prev => prev.filter(d => d.id !== id));
  };

  if (activeRoom) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col fixed inset-0 z-[100]">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
            <h1 className="font-black tracking-widest uppercase text-sm sm:text-lg">Live Mission Control</h1>
          </div>
          <div className="flex gap-4">
            <button 
                onClick={() => window.open(roomUrl, "_blank")}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all text-white"
            >
                Re-Open Video Feed
            </button>
            <button 
              onClick={() => setActiveRoom(null)} 
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all text-white shadow-xl"
            >
              End Broadcast
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">Classroom Status</h2>
            
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Q&A Submissions</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${chatUnlocked ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {chatUnlocked ? "UNLOCKED" : "LOCKED"}
                </span>
              </div>
              <button 
                onClick={() => setChatUnlocked(!chatUnlocked)}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg ${chatUnlocked ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              >
                {chatUnlocked ? "Lock Student Q&A" : "Unlock Student Q&A"}
              </button>
              <p className="text-slate-500 text-xs mt-4 text-center">
                {chatUnlocked ? "Students can currently submit doubts to the AI queue." : "Doubt submissions are currently disabled to maintain focus."}
              </p>
            </div>

            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 flex-1">
              <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Live Analytics (Mock)</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-white mb-1"><span>Attention Score</span> <span className="text-emerald-400">92%</span></div>
                  <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{width: '92%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-white mb-1"><span>Bandwidth Stability</span> <span className="text-blue-400">Excellent</span></div>
                  <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: '100%'}}></div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-black p-6 flex flex-col">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-widest">AI Priority Queue</h2>
                <p className="text-slate-400 text-sm mt-1">Doubts scored and sorted by student engagement analytics.</p>
              </div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                {doubtsQueue.length} Pending
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {doubtsQueue.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 font-bold uppercase tracking-widest">No pending doubts</div>
              ) : (
                doubtsQueue.sort((a, b) => b.aiScore - a.aiScore).map(doubt => (
                  <div key={doubt.id} className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-xl transition-all hover:border-blue-500">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-black text-lg">{doubt.student}</h3>
                        <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">{doubt.analytics}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 ${doubt.aiScore > 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : doubt.aiScore > 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                        AI Match: {doubt.aiScore}%
                      </div>
                    </div>
                    <p className="text-slate-300 text-lg mb-6">"{doubt.doubt}"</p>
                    <div className="flex gap-3">
                      <button onClick={() => handleDoubtAction(doubt.id, "resolve")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all">
                        Mark Resolved
                      </button>
                      <button onClick={() => handleDoubtAction(doubt.id, "dismiss")} className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all">
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-10 border-b border-slate-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Broadcast Studio</h1>
        <p className="mt-2 text-slate-500 font-medium text-sm sm:text-lg">One-to-Many Live Class Engine with AI Analytics.</p>
      </header>
      
      <div className="grid grid-cols-1 gap-6">
        {liveLessons.filter(l => l.broadcastType === "NATIVE_WEBRTC").map(lesson => (
          <div key={lesson.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-blue-200 transition-all">
            <div className="w-full">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{lesson.title}</h2>
              <div className="flex gap-2 mt-2">
                <span className="bg-red-100 text-red-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">Live Broadcast</span>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full font-mono">{lesson.id}</span>
              </div>
            </div>
            <button 
              onClick={() => launchLiveClass(lesson.id)} 
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-10 py-4 sm:py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl whitespace-nowrap flex items-center justify-center gap-3"
            >
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              Go Live
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
