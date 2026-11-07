"use client";
import React, { useEffect, useState, useRef } from "react";

export default function ResolutionCenterPage() {
  const [profile, setProfile] = useState<any>(null);
  const [hubs, setHubs] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  
  const [activeView, setActiveView] = useState<{ type: 'HUB' | 'THREAD', id: string, name: string, threadData?: any } | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Approval State
  const [approvalDate, setApprovalDate] = useState("");

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (activeView?.type === 'HUB' || (activeView?.type === 'THREAD' && !activeView.threadData.isLocked)) fetchMessages(); }, [activeView]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchData = async () => {
    const profRes = await fetch("/api/teacher/profile");
    if (profRes.ok) setProfile((await profRes.json()).teacher);
    const res = await fetch("/api/teacher/resolution-center");
    if (res.ok) {
      const data = await res.json();
      setHubs(data.hubs);
      setThreads(data.threads);
    }
  };

  const fetchMessages = async () => {
    if (!activeView || !profile) return;
    const query = activeView.type === 'HUB' ? `?subjectId=${activeView.id}&hubTeacherId=${profile.id}` : `?threadId=${activeView.id}`;
    const res = await fetch(`/api/chat${query}`);
    if (res.ok) setMessages(await res.json());
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !activeView || !profile) return;
    const payload = { content: messageText, ...(activeView.type === 'HUB' ? { subjectId: activeView.id, hubTeacherId: profile.id } : { threadId: activeView.id }) };
    setMessageText(""); 
    
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) setMessages(prev => [...prev, await res.json()]);
  };

  const processRequest = async (action: 'APPROVE_MEET' | 'REJECT_MEET') => {
    if (!activeView) return;
    if (action === 'APPROVE_MEET' && !approvalDate) { alert("Please select a date and time."); return; }
    
    await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, threadId: activeView.id, date: approvalDate })
    });
    
    setActiveView(null);
    fetchData(); // Refresh sidebar
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col animate-in fade-in duration-500">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resolution Center</h1>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-72 flex-shrink-0 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100"><h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Group Hubs</h3></div>
            <div className="p-2 space-y-1">
              {hubs.map(hub => (
                <button key={hub.id} onClick={() => setActiveView({ type: 'HUB', id: hub.id, name: hub.name })} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView?.id === hub.id ? "bg-blue-600 text-white shadow-md" : "text-slate-700 hover:bg-slate-100"}`}>
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black ${activeView?.id === hub.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"}`}>#</span>{hub.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100"><h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student 1-on-1 Requests</h3></div>
            <div className="p-2 space-y-1">
              {threads.length === 0 ? <p className="text-xs text-slate-400 p-2 text-center">No pending requests.</p> : threads.map(thread => (
                <button key={thread.id} onClick={() => setActiveView({ type: 'THREAD', id: thread.id, name: thread.student.name, threadData: thread })} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView?.id === thread.id ? "bg-indigo-600 text-white shadow-md" : "text-slate-700 hover:bg-slate-100"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-black">{thread.student.name.charAt(0)}</div>
                    {thread.student.name}
                  </div>
                  {thread.isLocked && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
          {!activeView ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center"><h2 className="text-2xl font-black text-slate-800">Workspace Initialized</h2></div>
          ) : activeView.type === 'HUB' ? (
            <>
              {/* Standard Hub Chat Feed */}
              <div className="h-[72px] flex-shrink-0 border-b border-slate-100 flex items-center justify-between px-8 bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">#</div>
                  <div><h2 className="text-lg font-black text-slate-900">{activeView.name}</h2></div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8 flex flex-col gap-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm bg-indigo-100 text-indigo-600">{msg.sender.name.charAt(0)}</div>
                    <div className="flex flex-col items-start max-w-[80%]">
                      <div className="flex items-baseline gap-2 mb-1"><span className="font-bold text-slate-800 text-sm">{msg.sender.name}</span></div>
                      <div className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl shadow-sm text-sm whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-6 bg-white border-t border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-3 p-2 pl-4 border border-slate-200 rounded-2xl bg-[#F8FAFC]">
                  <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Message..." className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 text-sm font-medium" />
                  <button onClick={sendMessage} className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center"><svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
                </div>
              </div>
            </>
          ) : activeView.threadData?.isLocked ? (
            /* Pending Request Review Pane */
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-slate-50/50">
              <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 font-black text-4xl mb-6 shadow-inner">{activeView.name.charAt(0)}</div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Review 1-on-1 Request</h2>
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full mb-8 text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Student's Justification</p>
                <p className="text-sm font-medium text-slate-700 italic border-l-4 border-orange-400 pl-4 py-1">{activeView.threadData.reason}</p>
              </div>

              <div className="max-w-md w-full mb-8">
                <label className="block text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Schedule Meeting Time</label>
                <input type="datetime-local" value={approvalDate} onChange={e => setApprovalDate(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-sm" />
              </div>

              <div className="flex gap-4 w-full max-w-md">
                <button onClick={() => processRequest('REJECT_MEET')} className="flex-1 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-all shadow-sm">Reject Request</button>
                <button onClick={() => processRequest('APPROVE_MEET')} className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-md">Approve & Unlock</button>
              </div>
            </div>
          ) : (
             /* Active Approved Thread Feed */
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400"><p>Thread Unlocked. Meeting Scheduled for {new Date(activeView.threadData.approvedDate).toLocaleString()}</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
