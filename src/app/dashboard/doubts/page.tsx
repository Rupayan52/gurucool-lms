"use client";
import React, { useState, useEffect, useRef } from "react";

interface CourseOption {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

// ... (Rest of DoubtTicket interface remains same)
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

  // Live Database State
  const [registeredCourses, setRegisteredCourses] = useState<CourseOption[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [studentEmail] = useState("xyz@gmail.com"); // Mocking active session

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("gurucool-theme") as "dark" | "light" | null;
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);

    // Fetch ONLY courses this specific student has clicked "Start Free Trial" for
    const fetchRegisteredCourses = async () => {
      try {
        setIsLoadingData(true);
        const res = await fetch("/api/student/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentEmail })
        });
        
        if (res.ok) {
          const data: CourseOption[] = await res.json();
          setRegisteredCourses(data);
          if (data.length > 0) setSelectedCourse(data[0].id);
        }
      } catch (error) {
        console.error("Failed to load registered courses:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchRegisteredCourses();
  }, [studentEmail]);

  const isDark = theme === "dark";
  const activeCourseData = registeredCourses.find((c) => c.id === selectedCourse);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !activeCourseData) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newTicket: DoubtTicket = {
        id: `TKT-${Math.floor(Math.random() * 10000)}`,
        title,
        description,
        course: activeCourseData.name,
        teacher: activeCourseData.teacherName,
        hasAttachment: !!attachedFile,
        status: "Pending AI Review",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setActiveDoubts([newTicket, ...activeDoubts]);
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
        <div className={`pb-5 mb-8 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <div>
            <h1 className="text-2xl font-black tracking-tight mb-2">Doubt Clearing Hub</h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Post a detailed question to trigger an AI review and receive a 1-on-1 FFMUC meeting link from your faculty.
            </p>
          </div>
          {!isComposing && (
            <button onClick={() => setIsComposing(true)} className="hidden sm:flex bg-[#5B5FC7] hover:bg-[#4E52B5] text-white px-5 py-2 rounded-lg font-bold text-sm transition-all active:scale-95 shadow flex-shrink-0">
              + New Doubt
            </button>
          )}
        </div>

        {isComposing ? (
          <div className={`rounded-xl border shadow-lg ${isDark ? "bg-[#29282E] border-white/10" : "bg-white border-slate-200"}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <h2 className="text-lg font-bold">Compose a Doubt</h2>
              <button onClick={() => setIsComposing(false)} className={`text-sm font-semibold hover:underline ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>Cancel</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* SELECT REGISTERED COURSE (DB DRIVEN) */}
                <div>
                  <label className={`block text-[10px] font-bold mb-2 uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Select Registered Course
                  </label>
                  {isLoadingData ? (
                    <div className={`w-full h-12 rounded-lg animate-pulse ${isDark ? "bg-white/10" : "bg-slate-200"}`}></div>
                  ) : registeredCourses.length === 0 ? (
                    <div className={`w-full p-3.5 rounded-lg border text-sm font-semibold ${isDark ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-600"}`}>
                      No active registrations found. Please visit Course Catalog.
                    </div>
                  ) : (
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className={`w-full p-3.5 rounded-lg border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition-colors appearance-none ${isDark ? "bg-[#1B1B1B] border-white/15 text-white" : "bg-slate-50 border-slate-300 text-slate-900"}`}
                    >
                      {registeredCourses.map(course => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* AUTO-ASSIGNED FACULTY (DB DRIVEN) */}
                <div>
                  <label className={`block text-[10px] font-bold mb-2 uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Auto-Assigned Faculty
                  </label>
                  {isLoadingData ? (
                    <div className={`w-full h-12 rounded-lg animate-pulse ${isDark ? "bg-white/10" : "bg-slate-200"}`}></div>
                  ) : !activeCourseData ? (
                    <div className={`w-full p-3.5 rounded-lg border text-sm font-semibold opacity-50 ${isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"}`}>
                      Awaiting Course Selection...
                    </div>
                  ) : (
                    <div className={`w-full p-3 rounded-lg border flex items-center gap-3 ${isDark ? "bg-[#5B5FC7]/10 border-[#7B83EB]/30 text-white" : "bg-indigo-50 border-indigo-200 text-indigo-900"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${isDark ? "bg-[#5B5FC7] text-white" : "bg-indigo-200 text-indigo-800"}`}>
                        {activeCourseData.teacherName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold leading-tight truncate">Prof. {activeCourseData.teacherName}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest truncate ${isDark ? "text-[#7B83EB]" : "text-indigo-600"}`}>
                          Ticket Routes to: {activeCourseData.teacherEmail}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Description Inputs */}
              <div>
                <label className={`block text-[10px] font-bold mb-2 uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>Question Summary</label>
                <input type="text" required disabled={isLoadingData || registeredCourses.length === 0} value={title} onChange={(e) => setTitle(e.target.value)} className={`w-full p-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition-colors disabled:opacity-50 ${isDark ? "bg-[#1B1B1B] border-white/15 text-white placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"}`} />
              </div>
              <div>
                <label className={`block text-[10px] font-bold mb-2 uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>Detailed Description</label>
                <textarea required rows={5} disabled={isLoadingData || registeredCourses.length === 0} value={description} onChange={(e) => setDescription(e.target.value)} className={`w-full p-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#7B83EB] transition-colors resize-none disabled:opacity-50 ${isDark ? "bg-[#1B1B1B] border-white/15 text-white placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"}`}></textarea>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={isSubmitting || isLoadingData || registeredCourses.length === 0} className={`bg-[#5B5FC7] hover:bg-[#4E52B5] text-white px-8 py-2.5 rounded-lg font-bold text-sm transition-all shadow ${isSubmitting || isLoadingData || registeredCourses.length === 0 ? "opacity-70 cursor-not-allowed" : "active:scale-95"}`}>
                  Submit Doubt
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
             {/* Render Active Doubts OR Empty State (Omitted for brevity, logic identical to previous) */}
             <div className={`rounded-xl p-10 text-center border ${isDark ? "bg-[#29282E] border-white/10" : "bg-slate-50 border-slate-200"}`}>
                <h2 className="text-lg font-bold mb-2">Compose Ready</h2>
                <button onClick={() => setIsComposing(true)} className="bg-[#5B5FC7] hover:bg-[#4E52B5] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 shadow">Post a New Doubt</button>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}
