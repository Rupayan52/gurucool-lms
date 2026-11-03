"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Teacher {
  id: string;
  name: string | null;
  email: string;
}

interface Subject {
  id: string;
  name: string;
  description: string;
  teacher: Teacher | null;
}

export default function CatalogPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // In a real app, this comes from your NextAuth/JWT session. 
  // For this integration test, we use a mock student email that exists in your DB.
  const [studentEmail, setStudentEmail] = useState("xyz@gmail.com"); 
  
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("gurucool-theme") as "dark" | "light" | null;
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    
    const fetchCatalog = async () => {
      try {
        const res = await fetch("/api/student/catalog");
        if (res.ok) setSubjects(await res.json());
      } catch (e) {
        console.error("Catalog fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const isDark = theme === "dark";

  const handleStartTrial = async (subjectId: string) => {
    setRegisteringId(subjectId);
    try {
      const res = await fetch("/api/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentEmail, subjectId })
      });
      
      if (res.ok) {
        setConfirmedId(subjectId);
        setTimeout(() => setConfirmedId(null), 3500); // Clear confirmation after 3.5s
      }
    } catch (e) {
      console.error("Registration error:", e);
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className={`min-h-full p-8 ${isDark ? "bg-[#1F1F23] text-[#E1DFDD]" : "bg-white text-slate-900"}`}>
      <div className="max-w-6xl mx-auto">
        <div className={`flex items-center justify-between mb-8 pb-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <div>
            <h1 className="text-[28px] font-black tracking-tight mb-1">Course Catalog</h1>
            <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Activate your free trials and select your mentors.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`h-[250px] rounded-2xl animate-pulse ${isDark ? "bg-[#29282E]" : "bg-slate-100"}`}></div>
            <div className={`h-[250px] rounded-2xl animate-pulse ${isDark ? "bg-[#29282E]" : "bg-slate-100"}`}></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map(subject => {
              const isConfirmed = confirmedId === subject.id;
              const isRegistering = registeringId === subject.id;
              
              return (
                <div key={subject.id} className={`rounded-2xl p-6 border shadow-sm flex flex-col justify-between transition-all ${isDark ? "bg-[#29282E] border-white/10 hover:border-white/20" : "bg-white border-slate-200 hover:shadow-md"}`}>
                  
                  {isConfirmed ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-6 animate-in zoom-in-95 duration-300">
                      <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h3 className="text-lg font-bold mb-1">Trial Activated!</h3>
                      <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>You are now registered for {subject.name}.</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${isDark ? "bg-[#5B5FC7]/20 text-[#7B83EB]" : "bg-indigo-50 text-indigo-600"}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{subject.name}</h3>
                        <p className={`text-xs mb-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{subject.description}</p>
                        
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Assigned Mentor</label>
                        <div className={`w-full p-2.5 rounded-lg border text-sm font-semibold mb-6 ${isDark ? "bg-[#1B1B1B] border-white/10" : "bg-slate-50 border-slate-200"}`}>
                          Prof. {subject.teacher?.name || subject.teacher?.email || "Pending"}
                        </div>
                      </div>

                      <button 
                        onClick={() => handleStartTrial(subject.id)}
                        disabled={isRegistering}
                        className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow ${
                          isDark 
                            ? "bg-[#141021] hover:bg-[#1A1629] border border-white/10 text-white" 
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                        }`}
                      >
                        {isRegistering ? "Activating..." : "START FREE TRIAL"}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
