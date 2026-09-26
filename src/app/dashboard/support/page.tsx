"use client";
import { useState, useEffect } from "react";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    const res = await fetch("/api/student/doubts");
    if (res.ok) setTickets(await res.json());
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/student/doubts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, question })
    });
    setSubject("");
    setQuestion("");
    fetchTickets();
    setLoading(false);
  };

  return (
    <div className="max-w-4xl animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doubt Support</h1>
        <p className="mt-2 text-slate-500">Submit questions to your mentors and track their resolution status.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Ask a Question</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject / Topic</label>
              <input type="text" required value={subject} onChange={e => setSubject(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., Physics - Optics" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Doubt</label>
              <textarea required value={question} onChange={e => setQuestion(e.target.value)} rows={4} className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Describe where you are stuck..." />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-6 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">Your Tickets</h2>
          </div>
          <div className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-medium">Subject</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No active doubts. Great job!</td></tr>
                ) : tickets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{t.subject}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${t.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>{t.status}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
