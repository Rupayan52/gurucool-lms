"use client";
import { useState } from "react";

// CRITICAL FIX: Explicitly tell TypeScript that meetUrl can be a string OR null
interface DoubtTicket {
  id: string;
  student: string;
  course: string;
  time: string;
  text: string;
  status: string;
  meetUrl: string | null;
}

// Mock database of student doubts coming from the student portal
const INITIAL_DOUBTS: DoubtTicket[] = [
  { 
    id: "TKT-8992", 
    student: "Vikram S.", 
    course: "Advanced Thermodynamics", 
    time: "10 mins ago",
    text: "I'm getting completely lost on the entropy derivation in chapter 4. The step where the variables swap doesn't make sense to me.", 
    status: "open",
    meetUrl: null
  },
  { 
    id: "TKT-8993", 
    student: "Priya M.", 
    course: "Organic Chemistry II", 
    time: "45 mins ago",
    text: "Can we go over the substitution mechanisms? I am confusing SN1 and SN2 reaction conditions.", 
    status: "open",
    meetUrl: null
  }
];

export default function ResolutionCenter() {
  const [doubts, setDoubts] = useState<DoubtTicket[]>(INITIAL_DOUBTS);
  const [activeTab, setActiveTab] = useState<"open" | "resolved">("open");

  // Instantly provisions a 1-on-1 Zoom-style room and attaches it to the ticket
  const recommendMeet = (id: string) => {
    const uniqueRoom = `GurucoolDoubt${id.replace('-', '')}${Date.now()}`;
    
    // Zoom-Style Config: Open communication, no forced mutes
    const jitsiConfig = [
      "config.prejoinPageEnabled=false",
      "config.startWithAudioMuted=false",
      "config.startWithVideoMuted=false",
      "userInfo.displayName=" + encodeURIComponent("Faculty Admin")
    ].join("&");

    const url = `https://meet.ffmuc.net/${uniqueRoom}#${jitsiConfig}`;

    setDoubts(doubts.map(d => 
      d.id === id ? { ...d, meetUrl: url, status: "meet_scheduled" } : d
    ));
  };

  const markResolved = (id: string) => {
    setDoubts(doubts.map(d => 
      d.id === id ? { ...d, status: "resolved" } : d
    ));
  };

  const launchMeetWindow = (url: string) => {
    window.open(url, "_blank");
  };

  const filteredDoubts = doubts.filter(d => activeTab === "open" ? d.status !== "resolved" : d.status === "resolved");

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-10 border-b border-slate-200 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Resolution Center</h1>
          <p className="mt-2 text-slate-500 font-medium text-sm sm:text-lg">Manage student queries and launch 1-on-1 interactive sessions.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab("open")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "open" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Active Tickets
          </button>
          <button 
            onClick={() => setActiveTab("resolved")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "resolved" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Resolved
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {filteredDoubts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-500 font-bold uppercase tracking-widest">No tickets in this queue</p>
          </div>
        ) : (
          filteredDoubts.map(doubt => (
            <div key={doubt.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 transition-all hover:border-blue-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-black text-slate-900">{doubt.student}</h2>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full font-mono">{doubt.id}</span>
                    <span className="text-slate-400 text-xs font-bold">{doubt.time}</span>
                  </div>
                  <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">{doubt.course}</p>
                </div>
                {doubt.status === "meet_scheduled" && (
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    Meet Active
                  </span>
                )}
              </div>
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
                <p className="text-slate-700 text-lg">"{doubt.text}"</p>
              </div>

              <div className="flex gap-4 border-t border-slate-100 pt-6">
                {doubt.meetUrl ? (
                  <>
                    <button 
                      onClick={() => launchMeetWindow(doubt.meetUrl!)} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
                    >
                      Join 1-on-1 Session
                    </button>
                    <button 
                      onClick={() => markResolved(doubt.id)} 
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all"
                    >
                      Close Ticket
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => recommendMeet(doubt.id)} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg"
                    >
                      Recommend 1-on-1 Meet
                    </button>
                    <button 
                      onClick={() => markResolved(doubt.id)} 
                      className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg"
                    >
                      Type Reply
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
