"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LiveSessionRoom({ params }: { params: { threadId: string } }) {
  const router = useRouter();
  const [showEndModal, setShowEndModal] = useState(false);
  const [endReason, setEndReason] = useState("");
  const [ending, setEnding] = useState(false);

  // Dynamically generate a secure, unique Jitsi room using your exact ffmuc.net configuration
  const roomUrl = `https://meet.ffmuc.net/GuruCool_1on1_${params.threadId}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true`;

  const terminateSession = async () => {
    if (!endReason.trim()) return;
    setEnding(true);
    try {
      await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'TERMINATE_MEET', threadId: params.threadId, reason: endReason })
      });
      router.push("/"); // Smart middleware routes users back to their respective dashboards
    } catch (e) {
      console.error(e);
      setEnding(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#1C1C21] flex flex-col relative overflow-hidden font-sans">
      
      {/* CUSTOM OVERLAY HEADER: Enforces the Termination Workflow */}
      <div className="h-16 bg-[#16161A] border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-10 shadow-lg">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full">
               <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></div>
               <span className="text-rose-500 text-[10px] font-black uppercase tracking-widest">Live & Recording Active</span>
            </div>
            <h1 className="text-slate-200 font-bold text-sm">GuruCool Secure 1-on-1 Workspace</h1>
         </div>
         
         <button onClick={() => setShowEndModal(true)} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-[0_4px_14px_rgba(225,29,72,0.39)] transition-all flex items-center gap-2 active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            End Session & Save Recording
         </button>
      </div>

      {/* EMBEDDED VIDEO SERVICE */}
      <div className="flex-1 w-full relative bg-black">
         <iframe src={roomUrl} allow="camera; microphone; fullscreen; display-capture; autoplay" className="w-full h-full border-none" />
      </div>

      {/* TERMINATION MODAL */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1C1C21] rounded-3xl border border-white/10 shadow-2xl w-full max-w-md p-8 text-white animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-2xl font-black mb-2 text-white">Terminate Live Session</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">Ending this session will disconnect both parties. You must provide a valid reason for termination. This will be logged and visible to the other participant in their dashboard.</p>
            
            <textarea value={endReason} onChange={e => setEndReason(e.target.value)} rows={3} className="w-full bg-[#16161A] border border-white/10 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 resize-none mb-6 placeholder-slate-600" placeholder="e.g., Covered all doubts, moving to next module..." />
            
            <div className="flex gap-3">
              <button onClick={() => setShowEndModal(false)} className="flex-1 py-3 bg-[#25252B] hover:bg-[#2F2F37] font-bold rounded-xl text-sm transition-colors border border-white/5">Return to Call</button>
              <button onClick={terminateSession} disabled={ending || !endReason.trim()} className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 font-bold rounded-xl text-sm shadow-md transition-all disabled:opacity-50 active:scale-95">
                {ending ? "Closing Tunnel..." : "Confirm End Session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
