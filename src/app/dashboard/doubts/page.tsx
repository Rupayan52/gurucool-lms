"use client";
import { useEffect, useState } from "react";

type Doubt = { id: string; subject: string; question: string; answer: string | null; status: string; createdAt: string };

export default function StudentDoubtsPortal() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [subject, setSubject] = useState("Physics");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/student/doubts").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setDoubts(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/student/doubts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, question })
    });
    if (res.ok) {
      setQuestion("");
      const updated = await fetch("/api/student/doubts").then(r => r.json());
      setDoubts(updated);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Expert Helpdesk</h1>
        <p className="mt-2 text-slate-500 font-medium text-lg">Direct 1-on-1 access to our top faculty.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ask a Question Form (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-black text-slate-900 mb-4">Ask a Question</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Subject</label>
                <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50 font-medium">
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>Biology</option>
                  <option>Mathematics</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Your Doubt</label>
                <textarea required value={question} onChange={e => setQuestion(e.target.value)} placeholder="E.g., Can you explain the Dhungar method of calculating..." className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none h-32 font-medium"></textarea>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50">
                {loading ? "Submitting..." : "Send to Faculty"}
              </button>
            </form>
          </div>
        </div>

        {/* Your Tickets (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-black text-slate-900 mb-4">Your Ticket History</h2>
          
          {doubts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
              <div className="text-4xl mb-3">🎓</div>
              <p className="font-medium">You haven't asked any questions yet.</p>
            </div>
          ) : doubts.map(doubt => (
            <div key={doubt.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                  {doubt.subject}
                </span>
                {doubt.status === "RESOLVED" ? (
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Resolved
                  </span>
                ) : (
                  <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-lg flex items-center gap-1">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span></span>
                    Faculty Reviewing
                  </span>
                )}
              </div>
              
              <h3 className="font-bold text-slate-900 text-lg mb-4">"{doubt.question}"</h3>
              
              {doubt.answer && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2">Faculty Response</div>
                  <p className="text-slate-800 font-medium leading-relaxed">{doubt.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
