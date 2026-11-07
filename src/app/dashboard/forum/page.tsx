"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface CourseOption {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

// State for 1-on-1 Request Tracking
type DMStatus = "locked" | "pending" | "approved";

interface DMRequestState {
  status: DMStatus;
  reason?: string;
}

export default function CourseHubs() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [registeredCourses, setRegisteredCourses] = useState<CourseOption[]>([]);
  
  // Navigation State: Determines if we are viewing a group channel or a 1-on-1 DM
  const [activeView, setActiveView] = useState<{ type: "channel" | "dm", id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  // 1-on-1 Request State Mapping (Key: teacherId, Value: DMRequestState)
  const [dmStates, setDmStates] = useState<Record<string, DMRequestState>>({});
  const [requestDraft, setRequestDraft] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  useEffect(() => {
    // 1. Theme Sync
    const savedTheme = localStorage.getItem("gurucool-theme") as "dark" | "light" | null;
    if (savedTheme) setTheme(savedTheme);
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<"dark" | "light">;
      if (customEvent.detail) setTheme(customEvent.detail);
    };
    window.addEventListener("gurucool-theme-change", handleThemeChange);

    // 2. Fetch Live Registered Channels
    const fetchChannels = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/student/courses");
        
        if (res.ok) {
          const data: CourseOption[] = await res.json();
          setRegisteredCourses(data);
          
          if (data.length > 0) {
            setActiveView({ type: "channel", id: data[0].id });
            
            // Initialize DM states to "locked" for all unique teachers
            const initialDmStates: Record<string, DMRequestState> = {};
            data.forEach(course => {
              if (course.teacherId && !initialDmStates[course.teacherId]) {
                initialDmStates[course.teacherId] = { status: "locked" };
              }
            });
            setDmStates(initialDmStates);
          }
        }
      } catch (error) {
        console.error("Failed to load channels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
    return () => window.removeEventListener("gurucool-theme-change", handleThemeChange);
  }, []);

  const isDark = theme === "dark";

  // Derive unique teachers for the Direct Message Sidebar
  const uniqueTeachers = Array.from(new Map(registeredCourses.filter(c => c.teacherId).map(c => [c.teacherId, c])).values());
  
  const activeChannel = activeView?.type === "channel" ? registeredCourses.find(c => c.id === activeView.id) : null;
  const activeTeacher = activeView?.type === "dm" ? uniqueTeachers.find(t => t.teacherId === activeView.id) : null;
  const activeDmState = activeTeacher ? dmStates[activeTeacher.teacherId] : null;

  const handleRequestSubmit = (teacherId: string) => {
    if (!requestDraft.trim()) return;
    setIsSubmittingRequest(true);
    
    // Simulate routing the written request to the Teacher's backend
    setTimeout(() => {
      setDmStates(prev => ({
        ...prev,
        [teacherId]: { status: "pending", reason: requestDraft }
      }));
      setRequestDraft("");
      setIsSubmittingRequest(false);
    }, 1000);
  };

  // Mock Developer Tool: Instantly approve a pending request to see the chat UI
  const devToolApproveRequest = (teacherId: string) => {
    setDmStates(prev => ({
      ...prev,
      [teacherId]: { ...prev[teacherId], status: "approved" }
    }));
  };

  return (
    <div className={`min-h-full flex flex-col transition-colors duration-300 ${isDark ? "bg-[#141021] text-[#E1DFDD]" : "bg-[#F0F2F5] text-slate-900"}`}>
      
      <div className={`px-8 py-6 border-b z-10 shadow-sm ${isDark ? "bg-[#1F1F23]/80 border-white/10 backdrop-blur-md" : "bg-white/80 border-slate-200 backdrop-blur-md"}`}>
        <h1 className="text-3xl font-black tracking-tight mb-1">Course Hubs</h1>
        <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Collaborate with your batch or request 1-on-1 faculty chats.
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden p-6 gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* ================= LEFT SIDEBAR (CHANNELS & DMs) ================= */}
        <div className={`w-72 flex flex-col rounded-2xl border shadow-lg overflow-hidden transition-colors ${
          isDark ? "bg-[#1F1F23] border-white/10" : "bg-white border-slate-200"
        }`}>
          
          <div className="flex-1 overflow-y-auto">
            {/* SUBJECT CHANNELS */}
            <div className={`px-5 py-3 border-b font-bold text-xs uppercase tracking-widest ${isDark ? "border-white/10 text-slate-400 bg-[#1B1B1B]" : "border-slate-200 text-slate-500 bg-slate-50"}`}>
              Group Hubs
            </div>
            <div className="p-3 space-y-1">
              {isLoading ? (
                <div className="space-y-2">
                  <div className={`h-10 rounded-xl animate-pulse ${isDark ? "bg-white/5" : "bg-slate-100"}`}></div>
                  <div className={`h-10 rounded-xl animate-pulse ${isDark ? "bg-white/5" : "bg-slate-100"}`}></div>
                </div>
              ) : registeredCourses.length === 0 ? (
                <div className="text-center p-3">
                  <p className={`text-xs font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>No courses registered.</p>
                </div>
              ) : (
                registeredCourses.map(course => {
                  const isActive = activeView?.type === "channel" && activeView.id === course.id;
                  return (
                    <button
                      key={`channel-${course.id}`}
                      onClick={() => setActiveView({ type: "channel", id: course.id })}
                      className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                        isActive 
                          ? "bg-gradient-to-r from-[#5B5FC7] to-[#4E52B5] text-white shadow-[0_4px_14px_0_rgba(91,95,199,0.39)] transform scale-[1.02]" 
                          : isDark 
                            ? "hover:bg-white/5 text-slate-300" 
                            : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <span className={`text-lg font-black ${isActive ? "text-white/70" : isDark ? "text-slate-500" : "text-slate-400"}`}>#</span>
                      <span className="font-bold text-sm truncate">{course.name}</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* FACULTY DIRECT MESSAGES */}
            <div className={`px-5 py-3 border-y font-bold text-xs uppercase tracking-widest mt-2 ${isDark ? "border-white/10 text-slate-400 bg-[#1B1B1B]" : "border-slate-200 text-slate-500 bg-slate-50"}`}>
              Faculty 1-on-1
            </div>
            <div className="p-3 space-y-1">
              {!isLoading && uniqueTeachers.map(teacher => {
                const isActive = activeView?.type === "dm" && activeView.id === teacher.teacherId;
                const status = dmStates[teacher.teacherId]?.status || "locked";
                return (
                  <button
                    key={`dm-${teacher.teacherId}`}
                    onClick={() => setActiveView({ type: "dm", id: teacher.teacherId })}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-300 ${
                      isActive 
                        ? "bg-[#2D2741] text-white border border-[#7B83EB]/50 shadow-inner" 
                        : isDark 
                          ? "hover:bg-white/5 text-slate-300 border border-transparent" 
                          : "hover:bg-slate-100 text-slate-700 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                        isActive ? "bg-[#7B83EB] text-white" : isDark ? "bg-[#5B5FC7]/30 text-[#7B83EB]" : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {teacher.teacherName.charAt(0)}
                      </div>
                      <span className="font-bold text-sm truncate">Prof. {teacher.teacherName}</span>
                    </div>

                    {/* Status Icons */}
                    {status === "locked" && <svg className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-[#9EA2FF]" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" /></svg>}
                    {status === "pending" && <svg className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-amber-400" : "text-amber-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    {status === "approved" && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANE (3D WORKSPACE) ================= */}
        <div className={`flex-1 flex flex-col rounded-2xl border shadow-xl overflow-hidden relative transition-colors ${
          isDark ? "bg-[#29282E] border-white/10" : "bg-[#F8F9FA] border-slate-200"
        }`}>
          
          {/* ======================================================= */}
          {/* VIEW: GROUP CHANNEL                                     */}
          {/* ======================================================= */}
          {activeView?.type === "channel" && activeChannel ? (
            <>
              {/* Chat Header */}
              <div className={`px-6 py-4 border-b flex items-center justify-between z-10 shadow-sm ${
                isDark ? "bg-[#1F1F23]/95 border-white/10" : "bg-white/95 border-slate-200"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner ${
                    isDark ? "bg-[#5B5FC7]/20 text-[#7B83EB]" : "bg-indigo-100 text-indigo-700"
                  }`}>#</div>
                  <div>
                    <h2 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      {activeChannel.name}
                    </h2>
                    <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Instructed by Prof. {activeChannel.teacherName} • Group Chat
                    </p>
                  </div>
                </div>

                <Link href="/dashboard/doubts" className="bg-gradient-to-r from-[#5B5FC7] to-[#4E52B5] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_4px_14px_0_rgba(91,95,199,0.39)] hover:shadow-[0_6px_20px_rgba(91,95,199,0.23)] hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Request A Meet
                </Link>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-end relative">
                <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 z-10">
                  <div className={`w-24 h-24 rounded-3xl shadow-2xl flex items-center justify-center mb-6 transform rotate-3 ${
                    isDark ? "bg-gradient-to-br from-[#5B5FC7]/40 to-[#29282E] border border-white/10" : "bg-gradient-to-br from-indigo-100 to-white border border-indigo-50"
                  }`}>
                    <span className="text-5xl font-black text-[#7B83EB]">#</span>
                  </div>
                  <h3 className={`text-2xl font-black tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                    Welcome to {activeChannel.name}
                  </h3>
                  <p className={`text-sm leading-relaxed mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Collaborate with peers. Messages sent here are visible to all students registered for this subject and Prof. {activeChannel.teacherName}.
                  </p>
                </div>
              </div>

              {/* 3D Message Composer */}
              <div className={`p-6 ${isDark ? "bg-[#1F1F23]/50" : "bg-white/50"}`}>
                <div className={`rounded-2xl border flex flex-col p-2 transition-all shadow-inner focus-within:ring-2 focus-within:ring-[#7B83EB] ${
                  isDark ? "bg-[#1B1B1B] border-white/10" : "bg-white border-slate-300 shadow-sm"
                }`}>
                  <textarea rows={1} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Message #${activeChannel.name}...`} className="w-full bg-transparent p-3 text-sm focus:outline-none resize-none" />
                  <div className="flex items-center justify-between px-2 pb-1 pt-2">
                    <div className="flex items-center gap-1">
                      <button className={`p-2 rounded-lg transition-colors ${isDark ? "text-slate-400 hover:bg-white/10 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
                    </div>
                    <button className={`p-2 rounded-xl transition-all shadow-md active:scale-95 ${message.trim() ? "bg-[#5B5FC7] text-white hover:bg-[#4E52B5]" : isDark ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
                  </div>
                </div>
              </div>
            </>
          ) : activeView?.type === "dm" && activeTeacher && activeDmState ? (
            
            /* ======================================================= */
            /* VIEW: 1-ON-1 FACULTY DIRECT MESSAGE                     */
            /* ======================================================= */
            <>
              {/* DM Header */}
              <div className={`px-6 py-4 border-b flex items-center justify-between z-10 shadow-sm ${
                isDark ? "bg-[#1F1F23]/95 border-white/10" : "bg-white/95 border-slate-200"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-inner ${
                    isDark ? "bg-[#5B5FC7]/30 text-[#9EA2FF] border border-[#7B83EB]/50" : "bg-indigo-100 text-indigo-700"
                  }`}>{activeTeacher.teacherName.charAt(0)}</div>
                  <div>
                    <h2 className={`text-xl font-black tracking-tight flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                      Prof. {activeTeacher.teacherName}
                      {activeDmState.status === "approved" && <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>}
                    </h2>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-[#7B83EB]" : "text-indigo-600"}`}>
                      Private 1-on-1 Chat
                    </p>
                  </div>
                </div>
                
                {/* Header Meet Button (Disabled if not approved) */}
                <button disabled={activeDmState.status !== "approved"} className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeDmState.status === "approved"
                    ? "bg-gradient-to-r from-[#5B5FC7] to-[#4E52B5] text-white shadow-[0_4px_14px_0_rgba(91,95,199,0.39)] hover:-translate-y-0.5 active:scale-95"
                    : isDark ? "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed" : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Request A Meet
                </button>
              </div>

              {/* DM Dynamic Body Area */}
              <div className="flex-1 overflow-y-auto p-8 relative flex flex-col justify-center items-center">
                
                {activeDmState.status === "locked" && (
                  <div className={`max-w-xl w-full p-8 rounded-3xl border shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 ${
                    isDark ? "bg-[#1F1F23]/80 border-white/10" : "bg-white border-slate-200"
                  }`}>
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-5 shadow-inner">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" /></svg>
                    </div>
                    <h3 className={`text-2xl font-black text-center mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>1-on-1 Access Locked</h3>
                    <p className={`text-sm text-center mb-6 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Direct messaging with faculty requires approval. Please submit a written description of why you need this private chat.
                    </p>
                    
                    <div className="space-y-4">
                      <textarea
                        rows={4}
                        value={requestDraft}
                        onChange={(e) => setRequestDraft(e.target.value)}
                        placeholder="Detail your request to Prof. Mathur..."
                        className={`w-full p-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition-colors resize-none ${
                          isDark ? "bg-[#1B1B1B] border-white/10 text-white placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900"
                        }`}
                      />
                      <button
                        onClick={() => handleRequestSubmit(activeTeacher.teacherId)}
                        disabled={isSubmittingRequest || !requestDraft.trim()}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                          isSubmittingRequest || !requestDraft.trim()
                            ? "opacity-50 cursor-not-allowed bg-[#5B5FC7] text-white"
                            : "bg-[#5B5FC7] hover:bg-[#4E52B5] text-white shadow-[0_4px_14px_0_rgba(91,95,199,0.39)] active:scale-95"
                        }`}
                      >
                        {isSubmittingRequest ? (
                          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Routing Request...</>
                        ) : "Submit Request to Faculty"}
                      </button>
                    </div>
                  </div>
                )}

                {activeDmState.status === "pending" && (
                  <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-6 shadow-inner relative">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="absolute top-0 right-0 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span></span>
                    </div>
                    <h3 className={`text-2xl font-black mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Request Sent</h3>
                    <p className={`text-sm mb-6 max-w-md mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Your request has been routed to Prof. {activeTeacher.teacherName}. The chat will unlock once they approve your reason.
                    </p>
                    <div className={`p-4 rounded-xl text-left border inline-block max-w-md w-full ${isDark ? "bg-[#1B1B1B] border-white/10" : "bg-slate-50 border-slate-200"}`}>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#7B83EB] mb-1">Your Submitted Reason:</span>
                      <p className={`text-sm italic ${isDark ? "text-slate-300" : "text-slate-600"}`}>"{activeDmState.reason}"</p>
                    </div>

                    {/* Developer trigger to see the approved state instantly */}
                    <button onClick={() => devToolApproveRequest(activeTeacher.teacherId)} className="block mx-auto mt-8 text-[10px] text-slate-500 underline opacity-50 hover:opacity-100">[Dev Override: Force Approve]</button>
                  </div>
                )}

                {activeDmState.status === "approved" && (
                   <div className="flex flex-col items-center justify-center h-full text-center w-full animate-in fade-in slide-in-from-bottom-4 duration-700 mt-auto">
                     <div className={`w-24 h-24 rounded-full shadow-2xl flex items-center justify-center mb-4 border ${
                       isDark ? "bg-gradient-to-br from-emerald-500/20 to-[#29282E] border-emerald-500/30 text-emerald-400" : "bg-gradient-to-br from-emerald-100 to-white border-emerald-200 text-emerald-600"
                     }`}>
                       <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <h3 className={`text-2xl font-black tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Request Approved</h3>
                     <p className={`text-sm leading-relaxed mb-6 max-w-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                       You are now connected 1-on-1 with Prof. {activeTeacher.teacherName}. You can begin messaging securely.
                     </p>
                   </div>
                )}
              </div>

              {/* 3D Message Composer (Locked vs Active) */}
              <div className={`p-6 ${isDark ? "bg-[#1F1F23]/50" : "bg-white/50"}`}>
                <div className={`rounded-2xl border flex flex-col p-2 transition-all ${
                  activeDmState.status === "approved" 
                    ? isDark ? "bg-[#1B1B1B] border-[#7B83EB]/50 shadow-[0_0_15px_rgba(123,131,235,0.15)] focus-within:ring-2 focus-within:ring-[#7B83EB]" : "bg-white border-indigo-300 shadow-md focus-within:ring-2 focus-within:ring-indigo-500"
                    : isDark ? "bg-[#1F1F23] border-white/5 opacity-50 cursor-not-allowed" : "bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed"
                }`}>
                  <textarea
                    rows={1}
                    disabled={activeDmState.status !== "approved"}
                    value={activeDmState.status === "approved" ? message : ""}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={activeDmState.status === "approved" ? `Message Prof. ${activeTeacher.teacherName}...` : "Chat locked pending approval..."}
                    className="w-full bg-transparent p-3 text-sm focus:outline-none resize-none disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center justify-between px-2 pb-1 pt-2">
                    <div className="flex items-center gap-1">
                      <button disabled={activeDmState.status !== "approved"} className={`p-2 rounded-lg transition-colors ${isDark ? "text-slate-400 hover:text-white disabled:hover:text-slate-400" : "text-slate-500 hover:text-slate-900 disabled:hover:text-slate-500"}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
                    </div>
                    <button disabled={activeDmState.status !== "approved"} className={`p-2 rounded-xl transition-all ${activeDmState.status === "approved" && message.trim() ? "bg-[#5B5FC7] text-white hover:bg-[#4E52B5] shadow-md active:scale-95" : isDark ? "bg-white/5 text-slate-500 cursor-not-allowed" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
                  </div>
                </div>
              </div>
            </>
          ) : null}

        </div>
      </div>
    </div>
  );
}
