"use client";
import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col justify-center items-center relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[100px]"></div>
      </div>

      <div className="text-center max-w-4xl px-4 sm:px-6 z-10 flex flex-col items-center">
        
        {/* Narrative Badge */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-blue-100 shadow-sm px-5 py-2 rounded-full mb-8">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
          <span className="text-xs sm:text-sm font-black text-blue-600 uppercase tracking-widest">
            Innovative Solutions by GnOvATech — Phase 2
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl sm:text-8xl font-black text-slate-900 tracking-tight leading-tight mb-2">
          Welcome to
        </h1>
        <h1 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight leading-tight mb-8 pb-2">
          GuruCOOL.
        </h1>

        {/* Elevated Subheading */}
        <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed mb-5">
          A next-generation phygital LMS bridging the gap between offline classrooms and digital learning. We go beyond textbooks to deliver strong academics, expert guidance, and future-ready skills.
        </p>
        <p className="text-sm sm:text-base text-slate-400 font-black uppercase tracking-widest mb-10">
          Learn. Explore. Grow. Lead.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.25)] flex-1 sm:flex-none">
            Register yourself
          </button>
          <button className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-sm flex-1 sm:flex-none">
            Login as Student/Faculty
          </button>
        </div>
      </div>

      {/* Corporate Footer Branding */}
      <div className="absolute bottom-8 w-full text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Powered by the House of GnOvATech
        </p>
      </div>
    </div>
  );
}
