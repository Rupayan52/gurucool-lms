"use client";
import React from "react";

export default function ResolutionCenterPage() {
  return (
    <div className="p-10 max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resolution Center</h1>
        <p className="text-slate-500 font-medium mt-1">Manage pending 1-on-1 student requests and active doubt threads.</p>
      </header>

      <div className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center bg-white flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-inner">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Workspace Initialized</h2>
        <p className="text-slate-500 max-w-md">Your communication channels are currently being routed. This interface will display your student chat requests shortly.</p>
      </div>
    </div>
  );
}
