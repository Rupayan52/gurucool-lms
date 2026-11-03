"use client";
import React, { useState, useEffect, useRef } from "react";

// Mock data representing the student's enrolled courses and teachers
const ENROLLED_COURSES = [
  { id: "c1", name: "Physics: Thermodynamics", teacher: "Prof. Saptaswa" },
  { id: "c2", name: "Mathematics: Calculus", teacher: "Prof. Abc" },
  { id: "c3", name: "Chemistry: Organic", teacher: "Prof. Debdeep" },
];

interface DoubtTicket {
  id: string;
  title: string;
  description: string;
  course: string;
  teacher: string;
  hasAttachment: boolean;
  status: "Pending AI Review" | "Faculty Assigned" | "Resolved";
  timestamp: string;
}

export default function DoubtClearingHub() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isComposing, setIsComposing] = useState(false);
  const [activeDoubts, setActiveDoubts] = useState<DoubtTicket[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(ENROLLED_COURSES[0].id);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("gurucool-theme") as "dark" | "light" | null;
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<"dark" | "light">;
      if (customEvent.detail) setTheme(customEvent.detail);
    };
    window.addEventListener("gurucool-theme-change", handleThemeChange);
    return () => window.removeEventListener("gurucool-theme-change", handleThemeChange);
  }, []);

  const isDark = theme === "dark";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API routing to the Teacher Resolution Center
    setTimeout(() => {
      const courseObj = ENROLLED_COURSES.find(c => c.id === selectedCourse);
      const newTicket: DoubtTicket = {
        id: `TKT-${Math.floor(Math.random() * 10000)}`,
        title,
        description,
        course: courseObj?.name || "General",
        teacher: courseObj?.teacher || "Faculty",
        hasAttachment: !!attachedFile,
        status: "Pending AI Review",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setActiveDoubts([newTicket, ...activeDoubts]);
      
      // Reset Form
      setTitle("");
      setDescription("");
      setAttachedFile(null);
      setIsSubmitting(false);
      setIsComposing(false);
    }, 1200);
  };

  return (
    <div className={`min-h-full p-6 sm:p-8 ${isDark ? "bg-[#1F1F23] text-white" : "bg-white text-slate-900"}`}>
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className={`pb-5 mb-8 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <div>
            <h1 className="text-2xl font-black tracking-tight mb-2">Doubt Clearing Hub</h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Post a detailed question to trigger an AI review and receive a 1-on-1 FFMUC meeting link from your faculty.
            </p>
          </div>
          {!isComposing && (
            <button 
              onClick={() => setIsComposing(true)}
              className="hidden sm:flex bg-[#5B5FC7] hover:bg-[#4E52B5] text-white px-5 py-2 rounded-lg font-bold text-sm transition-all active:scale-95 shadow flex-shrink-0"
            >
              + New Doubt
            </button>
          )}
        </div>

        {/* ================= COMPOSER VIEW ================= */}
        {isComposing ? (
          <div className={`rounded-xl border shadow-lg ${isDark ? "bg-[#29282E] border-white/10" : "bg-white border-slate-200"}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <h2 className="text-lg font-bold">Compose a Doubt</h2>
              <button 
                onClick={() => setIsComposing(false)}
                className={`text-sm font-semibold hover:underline ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Context Routing: Course/Teacher Selection */}
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Route to Faculty
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className={`w-full p-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition-colors appearance-none ${
                    isDark ? "bg-[#1B1B1B] border-white/15 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  {ENROLLED_COURSES.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} (Instructed by {course.teacher})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title Input */}
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Question Summary
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Confused about calculating torque in Lesson 4"
                  className={`w-full p-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition-colors ${
                    isDark ? "bg-[#1B1B1B] border-white/15 text-white placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>

              {/* Description Input */}
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain exactly where you are stuck. Mention timestamps if referring to a VOD."
                  className={`w-full p-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition-colors resize-none ${
                    isDark ? "bg-[#1B1B1B] border-white/15 text-white placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                  }`}
                ></textarea>
              </div>

              {/* File Attachment Area */}
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Attachments (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-xs font-semibold transition-colors active:scale-95 ${
                      isDark ? "bg-[#1B1B1B] border-white/15 text-slate-300 hover:text-white hover:border-white/30" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    Attach Picture or Video
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*,video/*,.pdf"
                  />
                  
                  {/* File Name Display / Remove Button */}
                  {attachedFile && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-medium max-w-xs ${isDark ? "bg-[#1B1B1B] border-[#7B83EB]/40 text-[#9EA2FF]" : "bg-indigo-50 border-indigo-200 text-indigo-700"}`}>
                      <span className="truncate">{attachedFile.name}</span>
                      <button type="button" onClick={() => setAttachedFile(null)} className="hover:text-rose-500 transition-colors">✕</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-[#5B5FC7] hover:bg-[#4E52B5] text-white px-8 py-2.5 rounded-lg font-bold text-sm transition-all shadow flex items-center gap-2 ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : "active:scale-95"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Routing to Faculty...
                    </>
                  ) : (
                    "Submit Doubt"
                  )}
                </button>
              </div>
            </form>
          </div>

        ) : (
          /* ================= ACTIVE TICKETS VIEW ================= */
          <div className="space-y-4">
            {activeDoubts.length > 0 ? (
              activeDoubts.map(ticket => (
                <div key={ticket.id} className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all hover:shadow-md ${isDark ? "bg-[#29282E] border-white/10 hover:border-white/20" : "bg-white border-slate-200"}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#7B83EB]">{ticket.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isDark ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold mb-1">{ticket.title}</h3>
                    <p className={`text-xs mb-3 line-clamp-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{ticket.description}</p>
                    <div className={`flex flex-wrap items-center gap-3 text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        {ticket.course}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {ticket.teacher}
                      </span>
                      {ticket.hasAttachment && (
                        <span className="flex items-center gap-1.5 text-[#7B83EB]">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          Has Attachment
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between h-full min-h-[90px]">
                    <span className={`text-[10px] font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>Submitted {ticket.timestamp}</span>
                    <button disabled className={`text-xs font-bold px-4 py-2 rounded-lg border transition-colors ${isDark ? "bg-[#1F1F23] border-white/10 text-slate-500 cursor-not-allowed" : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"}`}>
                      Awaiting Meeting Link
                    </button>
                  </div>
                </div>
              ))
            ) : (
              /* Original Empty State (if no tickets exist) */
              <div className={`rounded-xl p-10 text-center border ${isDark ? "bg-[#29282E] border-white/10" : "bg-slate-50 border-slate-200"}`}>
                <div className="w-14 h-14 bg-[#5B5FC7]/15 border border-[#7B83EB]/30 rounded-full flex items-center justify-center text-[#7B83EB] mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <h2 className="text-lg font-bold mb-2">No Active Doubts</h2>
                <p className={`text-sm mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Start a new thread to get help from your instructors.</p>
                <button 
                  onClick={() => setIsComposing(true)}
                  className="bg-[#5B5FC7] hover:bg-[#4E52B5] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 shadow"
                >
                  Post a New Doubt
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
