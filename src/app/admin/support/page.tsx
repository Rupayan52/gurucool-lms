"use client";
import { useEffect, useState } from "react";

export default function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchTickets = async () => {
    const res = await fetch("/api/admin/doubts");
    if (res.ok) setTickets(await res.json());
  };

  useEffect(() => { fetchTickets(); }, []);

  const resolveTicket = async (ticketId: string) => {
    await fetch("/api/admin/doubts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, status: "RESOLVED" })
    });
    fetchTickets();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Support Helpdesk</h1>
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Student</th>
              <th className="px-6 py-4 font-medium">Subject</th>
              <th className="px-6 py-4 font-medium">Question</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{t.user.name}</div>
                  <div className="text-xs text-slate-500">{t.user.email}</div>
                </td>
                <td className="px-6 py-4 font-medium">{t.subject}</td>
                <td className="px-6 py-4 max-w-xs truncate text-slate-600">{t.question}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${t.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>{t.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  {t.status === 'PENDING' && (
                    <button onClick={() => resolveTicket(t.id)} className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-xs transition-colors">
                      Mark Resolved
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
