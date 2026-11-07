"use client";
import React, { useEffect, useState, useRef } from "react";

export default function CourseHubs() {
  const [courses, setCourses] = useState<any[]>([]);
  // We added threadData to the student view so they can see if it's locked or approved
  const [activeView, setActiveView] = useState<{ type: 'HUB' | 'THREAD', id: string, name: string, teacherId: string, teacherName: string, threadData?: any } | null>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [meetReason, setMeetReason] = useState("");
  const [submittingMeet, setSubmittingMeet] = useState(false);

  useEffect(() => { fetchCourses(); }, []);
  
  useEffect(() => { 
    if (activeView?.type === 'HUB' || (activeView?.type === 'THREAD' && activeView.threadData && !activeView.threadData.isLocked)) {
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
    // For students fetching a thread, the thread ID is literally the mentor's teacherId 
    // because the backend api handles fetching the exact student-teacher combination.
    const query = activeView.type === 'HUB' 
      ? `?subjectId=${activeView.id}&hubTeacherId=${activeView.teacherId}` 
      : `?threadId=${activeView.threadData.id}`;
    const res = await fetch(`/api/chat${query}`);
    if (res.ok) setMessages(await res.json());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
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
      ...(activeView.type === 'HUB' 
          ? { subjectId: activeView.id, requestedTeacherId: activeView.teacherId } 
          : { threadId: activeView.threadData.id }) 
    };
    
    setMessageText(""); setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { const newMsg = await res.json(); setMessages(prev => [...prev, newMsg]); }
  };

  const requestMeet = async () => {
    if (!activeView || !meetReason.trim()) return;
    setSubmittingMeet(true);
    await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: 'REQUEST_MEET', teacherId: activeView.teacherId, reason: meetReason })
    });
    setSubmittingMeet(false);
    setShowMeetModal(false);
    setMeetReason("");
    fetchCourses(); // Instantly syncs UI to show locked status
  };

  const joinMeet = () => {
    if(activeView?.type === 'THREAD') window.location.href = "/live-session/" + activeView.threadData.id;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col animate-in fade-in duration-500">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Course Hubs</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Collaborate with your batch or request 1-on-1 faculty chats.</p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-72 flex-shrink-0 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100"><h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Group Hubs</h3></div>
            <div className="p-2 space-y-1">
              {courses.map((course, idx) => (
                <button key={`hub-${course.id}-${idx}`} onClick={() => setActiveView({ type: 'HUB', id: course.id, name: course.name, teacherId: course.teacherId, teacherName: course.teacherName })} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView?.id === course.id && activeView?.type === 'HUB' ? "bg-indigo-600 text-white shadow-md" : "text-slate-700 hover:bg-slate-100"}`}>
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black ${activeView?.id === course.id && activeView?.type === 'HUB' ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"}`}>#</span>{course.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100"><h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Faculty 1-on-1</h3></div>
            <div className="p-2 space-y-1">
              {courses.map((course, idx) => {
                // Determine if a thread exists with this teacher by looking at the backend response
                const thread = course.threadData; 
                
                return (
                  <button key={`fac-${course.teacherId}-${idx}`} onClick={() => setActiveView({ type: 'THREAD', id: course.teacherId, name: course.teacherName, teacherId: course.teacherId, teacherName: course.teacherName, threadData: thread })} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView?.teacherId === course.teacherId && activeView?.type === 'THREAD' ? "bg-indigo-600 text-white shadow-md" : "text-slate-700 hover:bg-slate-100"}`}>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[9px] font-black">{course.teacherName.charAt(0)}</span>
                      {course.teacherName}
                    </div>
                    {/* Visual Indicator of Thread State */}
                    {thread && thread.isLocked ? (
                       <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div> // Pending
                    ) : thread && !thread.isLocked ? (
                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div> // Approved/Unlocked
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
          
          {!activeView ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center"><h2 className="text-2xl font-black text-slate-800">Workspace Initialized</h2></div>
          ) : activeView.type === 'THREAD' && (!activeView.threadData || activeView.threadData.isLocked) ? (
            
            /* PENDING REQUEST OR NEW REQUEST UI */
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-black text-4xl mb-6 shadow-inner">{activeView.teacherName.charAt(0)}</div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Private Thread with {activeView.teacherName}</h2>
              
              {activeView.threadData?.isLocked ? (
                <>
                  <p className="text-slate-500 max-w-md mb-8">Your request has been submitted and is currently pending faculty approval.</p>
                  <div className="px-6 py-3 bg-orange-50 text-orange-600 border border-orange-200 font-bold rounded-xl text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div> Awaiting Response
                  </div>
                </>
              ) : (
                <>
                  <p className="text-slate-500 max-w-md mb-8">Direct communication requires faculty approval. State your reason below to request a 1-on-1 meeting.</p>
                  <button onClick={() => setShowMeetModal(true)} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Request 1-on-1 Meet
                  </button>
                </>
              )}
            </div>

          ) : (
             /* UNLOCKED CHAT FEED */

  {activeView.type === 'THREAD' && activeView.threadData?.isClosed ? (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-slate-50">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Session Terminated</h2>
          <p className="text-slate-500 max-w-md mb-8">This 1-on-1 communication channel has been formally closed.</p>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full mb-6 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Termination Reason</p>
              <p className="text-sm font-medium text-slate-700 italic border-l-4 border-rose-400 pl-4 py-1">{activeView.threadData.terminationReason}</p>
          </div>
          
          <div className="flex items-center gap-4">
              {activeView.threadData.recordingUrl && (
                 <a href={activeView.threadData.recordingUrl} className="px-6 py-3.5 bg-blue-50 hover:bg-blue-100 transition-colors text-blue-600 font-bold rounded-xl text-sm border border-blue-100 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    View Recording
                 </a>
              )}
              <button onClick={() => setShowMeetModal(true)} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                 Request New Meet
              </button>
          </div>
      </div>
  ) : (
  
             <>
              <div className="h-[72px] flex-shrink-0 border-b border-slate-100 flex items-center justify-between px-8 bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${activeView.type === 'HUB' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600 rounded-full'}`}>{activeView.type === 'HUB' ? '#' : activeView.name.charAt(0)}</div>
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
                {messages.map((msg, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm bg-blue-100 text-blue-600">{msg.sender.avatarUrl ? <img src={msg.sender.avatarUrl} className="w-full h-full object-cover"/> : msg.sender.name.charAt(0)}</div>
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
                  <div className="mb-3 flex items-center justify-between bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
                    <span className="text-xs font-bold text-indigo-700 truncate">{selectedFile.name}</span>
                    <button onClick={() => { setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="text-indigo-400 hover:text-indigo-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                )}
                <div className="flex items-center gap-3 p-2 pl-4 border border-slate-200 rounded-2xl bg-[#F8FAFC]">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
                  <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Message..." className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 text-sm font-medium" />
                  <button onClick={sendMessage} className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center"><svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
                </div>
              </div>
            </> )}
 )}
        </div>
      </div>

      {/* MEET REQUEST MODAL */}
      {showMeetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h3 className="text-xl font-black text-slate-900 mb-2">Request 1-on-1</h3>
            <p className="text-xs text-slate-500 mb-6">Please provide a valid academic reason for requesting direct communication with {activeView?.teacherName}.</p>
            <textarea value={meetReason} onChange={e => setMeetReason(e.target.value)} rows={4} className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 resize-none mb-6" placeholder="e.g., I need help understanding the latest module..." />
            <div className="flex gap-3">
              <button onClick={() => setShowMeetModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm">Cancel</button>
              <button onClick={requestMeet} disabled={submittingMeet} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-md">{submittingMeet ? "Submitting..." : "Submit Request"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
