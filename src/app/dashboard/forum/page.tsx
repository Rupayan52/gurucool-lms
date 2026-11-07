"use client";
import React, { useEffect, useState, useRef } from "react";

export default function CourseHubs() {
  const [courses, setCourses] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<{ type: 'HUB' | 'THREAD', id: string, name: string, teacherId: string, teacherName: string, threadData?: any } | null>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Meet Request State
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [meetReason, setMeetReason] = useState("");
  const [submittingMeet, setSubmittingMeet] = useState(false);

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (activeView?.type === 'HUB') fetchMessages(); }, [activeView]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchCourses = async () => {
    const res = await fetch("/api/student/courses");
    if (res.ok) setCourses(await res.json());
  };

  const fetchMessages = async () => {
    if (!activeView) return;
    const res = await fetch(`/api/chat?subjectId=${activeView.id}&hubTeacherId=${activeView.teacherId}`);
    if (res.ok) setMessages(await res.json());
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !activeView) return;
    const payload = { content: messageText, subjectId: activeView.id, requestedTeacherId: activeView.teacherId };
    setMessageText(""); 
    
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const newMsg = await res.json();
      setMessages(prev => [...prev, newMsg]);
    }
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
    // We could refetch threads here to update UI state, keeping it simple for now
    alert("Meet request submitted successfully. The faculty member will review it shortly.");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col animate-in fade-in duration-500 relative">
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
              {courses.map((course, idx) => (
                <button key={`fac-${course.teacherId}-${idx}`} onClick={() => setActiveView({ type: 'THREAD', id: course.teacherId, name: course.teacherName, teacherId: course.teacherId, teacherName: course.teacherName })} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView?.teacherId === course.teacherId && activeView?.type === 'THREAD' ? "bg-indigo-600 text-white shadow-md" : "text-slate-700 hover:bg-slate-100"}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[9px] font-black">{course.teacherName.charAt(0)}</span>
                    {course.teacherName}
                  </div>
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
              <div className="h-[72px] flex-shrink-0 border-b border-slate-100 flex items-center justify-between px-8 bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg">#</div>
                  <div><h2 className="text-lg font-black text-slate-900">{activeView.name}</h2><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Instructed by {activeView.teacherName}</p></div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8 flex flex-col gap-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden shadow-sm bg-blue-100 text-blue-600">{msg.sender.name.charAt(0)}</div>
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
                  <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder={`Message #${activeView.name}...`} className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 text-sm font-medium" />
                  <button onClick={sendMessage} className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center"><svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-black text-4xl mb-6 shadow-inner">{activeView.teacherName.charAt(0)}</div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Private Thread with {activeView.teacherName}</h2>
              <p className="text-slate-500 max-w-md mb-8">Direct communication requires faculty approval. State your reason below to request a 1-on-1 meeting.</p>
              <button onClick={() => setShowMeetModal(true)} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Request 1-on-1 Meet
              </button>
            </div>
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
