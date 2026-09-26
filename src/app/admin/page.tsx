"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/metrics").then(res => res.json()).then(data => setStats(data));
    fetch("/api/admin/deletion-requests").then(res => res.json()).then(data => {
      if (Array.isArray(data)) setDeletionRequests(data);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
          <p className="mt-2 text-slate-400">Live platform metrics and account deletion requests.</p>
        </div>
        <Link 
          href="/" 
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg text-sm flex items-center gap-2"
        >
          <span>🌐</span> Go to Main Site
        </Link>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Users</div>
          <div className="text-4xl font-black text-white">{stats?.metrics?.totalStudents || 0}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active Paid Subs</div>
          <div className="text-4xl font-black text-emerald-400">{stats?.metrics?.activePaid || 0}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Phygital Syncs</div>
          <div className="text-4xl font-black text-blue-400">{stats?.metrics?.offlineBatches || 0}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Pending Doubts</div>
          <div className="text-4xl font-black text-orange-400">{stats?.metrics?.pendingDoubts || 0}</div>
        </div>
      </div>

      {/* Deletion Requests Card */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Pending Account Deletion Requests</h2>
        {deletionRequests.length === 0 ? (
          <p className="text-slate-400 text-sm">No pending deletion requests.</p>
        ) : (
          <div className="space-y-4">
            {deletionRequests.map((req) => (
              <div key={req.id} className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-700">
                <div>
                  <div className="font-bold text-white">{req.user.name} ({req.user.email})</div>
                  <div className="text-xs text-slate-400">Requested on: {new Date(req.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-red-950/80 border border-red-800 text-red-400 font-mono text-lg font-bold px-4 py-2 rounded-lg tracking-widest">
                    PIN: {req.pin}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
