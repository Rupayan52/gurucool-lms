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
  
  const [approvalDate, setApprovalDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchData(); }, []);
  
  // Fetch messages if it's a HUB, OR if it's an UNLOCKED THREAD
  useEffect(() => { 
    if (activeView?.type === 'HUB' || (activeView?.type === 'THREAD' && !activeView.threadData.isLocked)) {
      fetchMessages(); 
    }
  }, [activeView]);
  
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchData = async () => {
    const profRes = await fetch("/api/teacher/profile");
    if (profRes.ok) setProfile((await profRes.json()).teacher);
    const res = await fetch("/api/teacher/resolution-center");
    if (res.ok) {
      const data = await res.json();
      setHubs(data.hubs);
      setThreads(data.threads);
      
      // If a thread is currently active, update its state dynamically (e.g., locking/unlocking)
      if (activeView?.type === 'THREAD') {
        const updatedThread = data.threads.find((t: any) => t.id === activeView.id);
        if (updatedThread) {
          setActiveView(prev => prev ? { ...prev, threadData: updatedThread } : null);
        } else {
          setActiveView(null); // Thread was rejected/deleted
        }
      }
    }
  };

  const fetchMessages = async () => {
    if (!activeView || !profile) return;
    const query = activeView.type === 'HUB' ? `?subjectId=${activeView.id}` : `?threadId=${activeView.id}`;
    const res = await fetch(`/api/chat${query}`);
    if (res.ok) setMessages(await res.json());
  };

  const sendMessage = async () => {
    if ((!messageText.trim() && !selectedFile) || !activeView) return;
    
    let fileUrl = null, fileType = null, fileName = null;
    if (selectedFile) {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(selectedFile);
      });
      fileUrl = await base64Promise;
      fileType = selectedFile.type;
      fileName = selectedFile.name;
    }

    const payload = { 
      content: messageText, fileUrl, fileName, fileType,
      ...(activeView.type === 'HUB' ? { subjectId: activeView.id } : { threadId: activeView.id }) 
    };
    
    setMessageText(""); setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      const newMsg = await res.json();
      setMessages(prev => [...prev, newMsg]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const processRequest = async (action: 'APPROVE_MEET' | 'REJECT_MEET') => {
    if (!activeView) return;
    if (action === 'APPROVE_MEET' && !approvalDate) { alert("Please select a date and time."); return; }
    
    await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, threadId: activeView.id, date: approvalDate })
    });
    
    fetchData(); // Instantly fetch updated thread state and unlock the chat
  };

  const joinMeet = () => {
    alert("Live video routing activated. Generating secure WebRTC tunnel...");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col animate-in fade-in duration-500">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resolution Center</h1>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* LEFT SIDEBAR NAVIGATION */}
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
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-black overflow-hidden">{thread.student.avatarUrl ? <img src={thread.student.avatarUrl} className="w-full h-full object-cover"/> : thread.student.name.charAt(0)}</div>
                    {thread.student.name}
                  </div>
                  {thread.isLocked ? (
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: WORKSPACE */}
        <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
          
          {!activeView ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center"><h2 className="text-2xl font-black text-slate-800">Workspace Initialized</h2></div>
          ) : activeView.type === 'THREAD' && activeView.threadData?.isLocked ? (
            
            /* PENDING REQUEST REVIEW PANE */
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-slate-50/50">
              <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 font-black text-4xl mb-6 shadow-inner overflow-hidden">
                {activeView.threadData.student.avatarUrl ? <img src={activeView.threadData.student.avatarUrl} className="w-full h-full object-cover"/> : activeView.name.charAt(0)}
              </div>
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
             /* UNLOCKED CHAT FEED (Used for both HUBs and UNLOCKED THREADS) */
             <>
              <div className="h-[72px] flex-shrink-0 border-b border-slate-100 flex items-center justify-between px-8 bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${activeView.type === 'HUB' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600 rounded-full'}`}>{activeView.type === 'HUB' ? '#' : activeView.name.charAt(0)}</div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{activeView.name}</h2>
                    {activeView.type === 'THREAD' && activeView.threadData?.approvedDate && (
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Scheduled: {new Date(activeView.threadData.approvedDate).toLocaleString()}</p>
                    )}
                  </div>
                </div>
                {activeView.type === 'THREAD' && (
                  <button onClick={joinMeet} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Join Live Session
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8 flex flex-col gap-6">
                {messages.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Welcome to {activeView.name}</h3>
                    <p className="text-slate-500 text-sm max-w-sm">Direct communication channel is now active.</p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm bg-indigo-100 text-indigo-600">{msg.sender.avatarUrl ? <img src={msg.sender.avatarUrl} className="w-full h-full object-cover"/> : msg.sender.name.charAt(0)}</div>
                    <div className="flex flex-col items-start max-w-[80%]">
                      <div className="flex items-baseline gap-2 mb-1"><span className="font-bold text-slate-800 text-sm">{msg.sender.name}</span><span className="text-[10px] text-slate-400 font-medium">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                      <div className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl shadow-sm text-sm whitespace-pre-wrap">
                        {msg.content}
                        {msg.fileUrl && (
                          <div className="mt-2 pt-2 border-t border-slate-100">
                            {msg.fileType?.startsWith('image/') ? <img src={msg.fileUrl} alt="attachment" className="max-w-xs rounded-xl border border-slate-200" /> : msg.fileType?.startsWith('video/') ? <video src={msg.fileUrl} controls className="max-w-xs rounded-xl border border-slate-200" /> : <a href={msg.fileUrl} download={msg.fileName} className="flex items-center gap-2 text-blue-600 hover:underline font-bold text-xs bg-blue-50 px-3 py-2 rounded-lg border border-blue-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>{msg.fileName || "Download"}</a>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6 bg-white border-t border-slate-100 flex-shrink-0">
                {selectedFile && (
                  <div className="mb-3 flex items-center justify-between bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl">
                    <span className="text-xs font-bold text-blue-700 truncate">{selectedFile.name}</span>
                    <button onClick={() => { setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="text-blue-400 hover:text-blue-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                )}
                <div className="flex items-center gap-3 p-2 pl-4 border border-slate-200 rounded-2xl bg-[#F8FAFC]">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
                  <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Message..." className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 text-sm font-medium" />
                  <button onClick={sendMessage} className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center"><svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
