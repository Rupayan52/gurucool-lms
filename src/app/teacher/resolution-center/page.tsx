"use client";
import React, { useEffect, useState } from "react";

export default function ResolutionCenterPage() {
  const [hubs, setHubs] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeView, setActiveView] = useState<{ type: 'HUB' | 'THREAD', id: string, name: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/teacher/resolution-center");
      if (res.ok) {
        const data = await res.json();
        setHubs(data.hubs);
        setThreads(data.threads);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockThread = async (threadId: string) => {
    // Admin action: Unlock private chat
    // Implement API call to PATCH /api/teacher/threads later
    console.log("Unlocking thread:", threadId);
  };

  if (loading) return <div className="flex justify-center items-center h-full"><div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resolution Center</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage pending 1-on-1 requests and monitor active Group Hubs.</p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* LEFT PANE: NAVIGATION */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-6 overflow-y-auto pr-2">
          
          {/* GROUP HUBS */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Group Hubs</h3>
            </div>
            <div className="p-2 space-y-1">
              {hubs.length === 0 ? <p className="text-xs text-slate-400 p-2 text-center">No assigned subjects.</p> : hubs.map(hub => (
                <button
                  key={hub.id}
                  onClick={() => setActiveView({ type: 'HUB', id: hub.id, name: hub.name })}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView?.id === hub.id ? "bg-blue-600 text-white shadow-md" : "text-slate-700 hover:bg-slate-100"}`}
                >
                  <span className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-xs font-black">#</span>
                  {hub.name}
                </button>
              ))}
            </div>
          </div>

          {/* STUDENT 1-ON-1 REQUESTS */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student 1-on-1 Requests</h3>
            </div>
            <div className="p-2 space-y-1">
              {threads.length === 0 ? <p className="text-xs text-slate-400 p-2 text-center">No pending requests.</p> : threads.map(thread => (
                <button
                  key={thread.id}
                  onClick={() => setActiveView({ type: 'THREAD', id: thread.id, name: thread.student.name })}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView?.id === thread.id ? "bg-indigo-600 text-white shadow-md" : "text-slate-700 hover:bg-slate-100"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-black overflow-hidden">
                      {thread.student.avatarUrl ? <img src={thread.student.avatarUrl} className="w-full h-full object-cover"/> : thread.student.name.charAt(0)}
                    </div>
                    {thread.student.name}
                  </div>
                  {thread.isLocked && <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: ACTIVE CHAT WORKSPACE */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
          
          {!activeView ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-inner">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Workspace Initialized</h2>
              <p className="text-slate-500 max-w-md">Select a Group Hub or a Student Request from the sidebar to begin monitoring communication channels.</p>
            </div>
          ) : (
            <>
              {/* Workspace Header */}
              <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-inner ${activeView.type === 'HUB' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600 rounded-full'}`}>
                    {activeView.type === 'HUB' ? '#' : activeView.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{activeView.name}</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{activeView.type === 'HUB' ? 'Public Broadcast Channel' : 'Private Encrypted Thread'}</p>
                  </div>
                </div>
                
                {/* Admin Controls */}
                {activeView.type === 'HUB' ? (
                  <button className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    Manage Members
                  </button>
                ) : (
                  <button onClick={() => handleUnlockThread(activeView.id)} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                    Approve & Unlock Thread
                  </button>
                )}
              </div>

              {/* Chat Feed (Placeholder for WebSockets) */}
              <div className="flex-1 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center">
                 <div className={`w-24 h-24 rounded-3xl flex items-center justify-center font-black text-4xl mb-4 shadow-xl shadow-slate-200/50 ${activeView.type === 'HUB' ? 'bg-white text-blue-600 border border-slate-100' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'}`}>
                    {activeView.type === 'HUB' ? '#' : activeView.name.charAt(0)}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">Welcome to {activeView.name}</h3>
                  <p className="text-slate-500 text-sm max-w-sm">
                    {activeView.type === 'HUB' 
                      ? "Messages broadcasted here will be visible to all students registered under your jurisdiction for this subject." 
                      : "This thread is currently locked. Approve the request to initiate end-to-end communication."}
                  </p>
              </div>

              {/* Chat Input Field */}
              <div className="p-6 bg-white border-t border-slate-100">
                <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-2xl bg-slate-50 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  </button>
                  <input type="text" placeholder={`Message ${activeView.type === 'HUB' ? '#' + activeView.name : activeView.name}...`} className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 text-sm font-medium" />
                  <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}
