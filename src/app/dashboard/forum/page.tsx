"use client";
import React, { useEffect, useState, useRef } from "react";

export default function CourseHubs() {
  const [courses, setCourses] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<{ type: 'HUB' | 'THREAD', id: string, name: string, teacherId: string, teacherName: string, threadData?: any } | null>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [meetReason, setMeetReason] = useState("");
  const [submittingMeet, setSubmittingMeet] = useState(false);

  // Termination State
  const [showEndModal, setShowEndModal] = useState(false);
  const [endReason, setEndReason] = useState("");
  const [ending, setEnding] = useState(false);

  useEffect(() => { fetchCourses(); }, []);
  
  useEffect(() => { 
    if (activeView?.type === 'HUB' || (activeView?.type === 'THREAD' && activeView.threadData && !activeView.threadData.isLocked && !activeView.threadData.isClosed)) {
      fetchMessages(); 
    }
  }, [activeView]);
  
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchCourses = async () => {
    const res = await fetch("/api/student/courses");
    if (res.ok) setCourses(await res.json());
  };

  const fetchMessages = async () => {
    if (!activeView) return;
    const query = activeView.type === 'HUB' ? `?subjectId=${activeView.id}&hubTeacherId=${activeView.teacherId}` : `?threadId=${activeView.threadData.id}`;
    const res = await fetch(`/api/chat${query}`);
    if (res.ok) setMessages(await res.json());
  };

  const sendMessage = async () => {
    if ((!messageText.trim() && !selectedFile) || !activeView) return;
    let fileUrl = null, fileType = null, fileName = null;
    if (selectedFile) {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => { reader.onloadend = () => resolve(reader.result); reader.readAsDataURL(selectedFile); });
      fileUrl = await base64Promise; fileType = selectedFile.type; fileName = selectedFile.name;
    }

    const payload = { content: messageText, fileUrl, fileName, fileType, ...(activeView.type === 'HUB' ? { subjectId: activeView.id, requestedTeacherId: activeView.teacherId } : { threadId: activeView.threadData.id }) };
    setMessageText(""); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = "";
    
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { const newMsg = await res.json(); setMessages(prev => [...prev, newMsg]); }
  };

  const requestMeet = async () => {
    if (!activeView || !meetReason.trim()) return;
    setSubmittingMeet(true);
    await fetch("/api/threads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: 'REQUEST_MEET', teacherId: activeView.teacherId, reason: meetReason }) });
    setSubmittingMeet(false); setShowMeetModal(false); setMeetReason("");
    fetchCourses();
  };

  // Secure New Tab Routing
  const joinMeet = () => { 
    if(activeView?.type === 'THREAD') {
      window.open(`https://meet.ffmuc.net/GuruCool_1on1_${activeView.threadData.id}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true`, '_blank');
    }
  };

  // Inline Termination
  const terminateWorkspace = async () => {
    if (!endReason.trim() || !activeView || activeView.type !== 'THREAD') return;
    setEnding(true);
    try {
      await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'TERMINATE_MEET', threadId: activeView.threadData.id, reason: endReason })
      });
      setShowEndModal(false);
      setEndReason("");
      fetchCourses(); // Sync UI to show closed state
    } catch (e) { console.error(e); } finally { setEnding(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]); };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col animate-in fade-in duration-500 relative">
      <div className="mb-6 flex-shrink-0"><h1 className="text-3xl font-black text-slate-900 tracking-tight">Course Hubs</h1></div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-72 flex-shrink-0 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100"><h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Group Hubs</h3></div>
            <div className="p-2 space-y-1">
              {courses.map((c, idx) => (
                <button key={`hub-${c.id}-${idx}`} onClick={() => setActiveView({ type: 'HUB', id: c.id, name: c.name, teacherId: c.teacherId, teacherName: c.teacherName })} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView?.id === c.id && activeView?.type === 'HUB' ? "bg-indigo-600 text-white shadow-md" : "text-slate-700 hover:bg-slate-100"}`}>
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black ${activeView?.id === c.id && activeView?.type === 'HUB' ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"}`}>#</span>{c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100"><h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Faculty 1-on-1</h3></div>
            <div className="p-2 space-y-1">
              {courses.map((c, idx) => (
                <button key={`fac-${c.teacherId}-${idx}`} onClick={() => setActiveView({ type: 'THREAD', id: c.teacherId, name: c.teacherName, teacherId: c.teacherId, teacherName: c.teacherName, threadData: c.threadData })} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView?.teacherId === c.teacherId && activeView?.type === 'THREAD' ? "bg-indigo-600 text-white shadow-md" : "text-slate-700 hover:bg-slate-100"}`}>
                  <div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[9px] font-black">{c.teacherName.charAt(0)}</span>{c.teacherName}</div>
                  {c.threadData?.isClosed ? <div className="w-2 h-2 rounded-full bg-rose-500"></div> : c.threadData?.isLocked ? <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div> : c.threadData && !c.threadData.isLocked ? <div className="w-2 h-2 rounded-full bg-emerald-500"></div> : null}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
          {!activeView ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center"><h2 className="text-2xl font-black text-slate-800">Workspace Initialized</h2></div>
          ) : activeView.type === 'THREAD' && (!activeView.threadData || activeView.threadData.isLocked) ? (
            
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-black text-4xl mb-6 shadow-inner">{activeView.teacherName.charAt(0)}</div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Private Thread with {activeView.teacherName}</h2>
              {activeView.threadData?.isLocked ? (
                <><p className="text-slate-500 max-w-md mb-8">Pending faculty approval.</p><div className="px-6 py-3 bg-orange-50 text-orange-600 border border-orange-200 font-bold rounded-xl text-sm flex items-center gap-2">Awaiting Response</div></>
              ) : (
                <><p className="text-slate-500 max-w-md mb-8">State your reason below to request a meet.</p><button onClick={() => setShowMeetModal(true)} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-2">Request 1-on-1 Meet</button></>
              )}
            </div>

          ) : activeView.type === 'THREAD' && activeView.threadData?.isClosed ? (
            
             <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-slate-50">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Session Terminated</h2>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full mb-6 text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Termination Reason</p>
                    <p className="text-sm font-medium text-slate-700 italic border-l-4 border-rose-400 pl-4 py-1">{activeView.threadData.terminationReason}</p>
                </div>
                <button onClick={() => setShowMeetModal(true)} className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center gap-2">Request New Meet</button>
            </div>

          ) : (
             
             <>
              <div className="h-[72px] flex-shrink-0 border-b border-slate-100 flex items-center justify-between px-8 bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${activeView.type === 'HUB' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600 rounded-full'}`}>{activeView.type === 'HUB' ? '#' : activeView.name.charAt(0)}</div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{activeView.name}</h2>
                    {activeView.type === 'THREAD' && activeView.threadData?.approvedDate && <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Scheduled: {new Date(activeView.threadData.approvedDate).toLocaleString()}</p>}
                  </div>
                </div>
                {activeView.type === 'THREAD' && (
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowEndModal(true)} className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all">Terminate Workspace</button>
                    <button onClick={joinMeet} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">Join Live Session</button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8 flex flex-col gap-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm bg-blue-100 text-blue-600">{msg.sender.avatarUrl ? <img src={msg.sender.avatarUrl} className="w-full h-full object-cover"/> : msg.sender.name.charAt(0)}</div>
                    <div className="flex flex-col items-start max-w-[80%]">
                      <div className="flex items-baseline gap-2 mb-1"><span className="font-bold text-slate-800 text-sm">{msg.sender.name}</span></div>
                      <div className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl shadow-sm text-sm whitespace-pre-wrap">
                        {msg.content}
                        {msg.fileUrl && (
                          <div className="mt-2 pt-2 border-t border-slate-100">
                            {msg.fileType?.startsWith('image/') ? <img src={msg.fileUrl} className="max-w-xs rounded-xl border border-slate-200" /> : <a href={msg.fileUrl} download={msg.fileName} className="text-blue-600 hover:underline font-bold text-xs">{msg.fileName}</a>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6 bg-white border-t border-slate-100 flex-shrink-0">
                {selectedFile && <div className="mb-3 flex items-center justify-between bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl"><span className="text-xs font-bold text-indigo-700 truncate">{selectedFile.name}</span><button onClick={() => { setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="text-indigo-400 hover:text-indigo-600">x</button></div>}
                <div className="flex items-center gap-3 p-2 pl-4 border border-slate-200 rounded-2xl bg-[#F8FAFC]">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-indigo-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
                  <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Message..." className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 text-sm font-medium" />
                  <button onClick={sendMessage} className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center"><svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MEET REQUEST MODAL (CYCLIC) */}
      {showMeetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-black text-slate-900 mb-2">Request 1-on-1</h3>
            <p className="text-xs text-slate-500 mb-6">Provide an academic reason for requesting communication with {activeView?.teacherName}.</p>
            <textarea value={meetReason} onChange={e => setMeetReason(e.target.value)} rows={4} className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 resize-none mb-6" />
            <div className="flex gap-3">
              <button onClick={() => setShowMeetModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm">Cancel</button>
              <button onClick={requestMeet} disabled={submittingMeet} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-md">Submit Request</button>
            </div>
          </div>
        </div>
      )}

      {/* INLINE TERMINATION MODAL */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-black text-rose-600 mb-2">Terminate Workspace</h3>
            <p className="text-xs text-slate-500 mb-6">Closing this workspace requires a valid reason. This reason will be logged and visible to the faculty.</p>
            <textarea value={endReason} onChange={e => setEndReason(e.target.value)} rows={3} className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:border-rose-500 resize-none mb-6" placeholder="e.g., Session concluded, all doubts resolved..." />
            <div className="flex gap-3">
              <button onClick={() => setShowEndModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm">Cancel</button>
              <button onClick={terminateWorkspace} disabled={ending || !endReason.trim()} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl text-sm shadow-md disabled:opacity-50">{ending ? "Closing..." : "Confirm Close"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
