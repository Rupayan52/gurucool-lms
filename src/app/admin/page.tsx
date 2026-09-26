"use client";

import { useEffect, useState } from "react";

type Metrics = {
  totalStudents: number;
  activePaid: number;
  offlineBatches: number;
  pendingDoubts: number;
};

type Signup = {
  id: string;
  name: string;
  email: string;
  plan: string;
  date: string;
};

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics>({ totalStudents: 0, activePaid: 0, offlineBatches: 0, pendingDoubts: 0 });
  const [recentSignups, setRecentSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch("/api/admin/metrics");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
          setRecentSignups(data.recentSignups);
        }
      } catch (error) {
        console.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return <div className="text-slate-400 p-8 animate-pulse font-medium">Loading live system metrics...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
        <p className="mt-2 text-slate-400">Live platform metrics and subscription health.</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Students</h3>
          <p className="mt-2 text-3xl font-black text-white">{metrics.totalStudents}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Paid Subs</h3>
          <p className="mt-2 text-3xl font-black text-emerald-400">{metrics.activePaid}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Phygital Syncs</h3>
          <p className="mt-2 text-3xl font-black text-blue-400">{metrics.offlineBatches}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Pending Doubts</h3>
          <p className="mt-2 text-3xl font-black text-orange-400">{metrics.pendingDoubts}</p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Registrations</h2>
        </div>
        
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700">
                <th className="p-4 font-semibold text-sm text-slate-400">Name</th>
                <th className="p-4 font-semibold text-sm text-slate-400">Email</th>
                <th className="p-4 font-semibold text-sm text-slate-400">Subscription</th>
                <th className="p-4 font-semibold text-sm text-slate-400 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {recentSignups.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-slate-500 text-center text-sm">No recent signups.</td></tr>
              ) : (
                recentSignups.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-white">{user.name}</td>
                    <td className="p-4 text-slate-400 text-sm">{user.email}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        user.plan === 'PAID_DIGITAL' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' :
                        user.plan === 'OFFLINE_BATCH' ? 'bg-blue-900/50 text-blue-400 border border-blue-800' :
                        'bg-slate-700 text-slate-300 border border-slate-600'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="p-4 text-right text-slate-400 text-sm">{user.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
