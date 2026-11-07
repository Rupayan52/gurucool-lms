"use client";
import React, { useEffect, useState, useRef } from "react";

export default function CourseHubs() {
  const [courses, setCourses] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<{ type: 'HUB' | 'THREAD', id: string, name: string, teacherId: string, teacherName: string } | null>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (activeView) fetchMessages(); }, [activeView]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchCourses = async () => {
    const res = await fetch("/api/student/courses");
    if (res.ok) setCourses(await res.json());
  };

  const fetchMessages = async () => {
    if (!activeView) return;
    const query = activeView.type === 'HUB' 
      ? `?subjectId=${activeView.id}&hubTeacherId=${activeView.teacherId}` 
      : `?threadId=${activeView.id}`;
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
          : { threadId: activeView.id }) 
    };
    
    setMessageText(""); setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
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
                <button key={`${course.id}-${idx}`} onClick={() => setActiveView({ type: 'HUB', id: course.id, name: course.name, teacherId: course.teacherId, teacherName: course.teacherName })} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView?.id === course.id && activeView?.teacherId === course.teacherId ? "bg-indigo-600 text-white shadow-md" : "text-slate-700 hover:bg-slate-100"}`}>
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black ${activeView?.id === course.id && activeView?.teacherId === course.teacherId ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"}`}>#</span>{course.name} ({course.teacherName})
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
          {!activeView ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400 mb-6 shadow-inner"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg></div>
            </div>
          ) : (
            <>
              <div className="h-[72px] flex-shrink-0 border-b border-slate-100 flex items-center justify-between px-8 bg-white z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg">#</div>
                  <div><h2 className="text-lg font-black text-slate-900">{activeView.name}</h2></div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8 flex flex-col gap-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 overflow-hidden shadow-sm bg-blue-100 text-blue-600">
                      {msg.sender.avatarUrl ? <img src={msg.sender.avatarUrl} className="w-full h-full object-cover"/> : msg.sender.name.charAt(0)}
                    </div>
                    <div className="flex flex-col items-start max-w-[80%]">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm">{msg.sender.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm text-sm whitespace-pre-wrap">
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
                <div className="flex items-center gap-3 p-2 pl-4 border border-slate-200 rounded-2xl bg-[#F8FAFC] focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  </button>
                  <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type message..." className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 text-sm font-medium" />
                  <button onClick={sendMessage} className="w-9 h-9 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/20 transition-all active:scale-95 flex-shrink-0">
                    <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
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
