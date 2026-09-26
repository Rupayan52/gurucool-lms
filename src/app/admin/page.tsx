"use client";

export default function AdminPage() {
  const recentSignups = [
    { id: 1, name: "Rahul Das", email: "rahul@example.com", plan: "PAID_DIGITAL", date: "Today" },
    { id: 2, name: "Priya Sharma", email: "priya@example.com", plan: "FREE", date: "Yesterday" },
    { id: 3, name: "Amit Kumar", email: "amit@example.com", plan: "OFFLINE_BATCH", date: "Sep 24, 2026" }
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
        <p className="mt-2 text-slate-400">Monitor platform metrics and subscription health.</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Students</h3>
          <p className="mt-2 text-3xl font-black text-white">1,248</p>
          <p className="text-xs text-emerald-400 font-medium mt-2">↑ 12% this month</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Paid Subs</h3>
          <p className="mt-2 text-3xl font-black text-emerald-400">892</p>
          <p className="text-xs text-slate-500 font-medium mt-2">71% conversion rate</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Phygital Syncs</h3>
          <p className="mt-2 text-3xl font-black text-blue-400">356</p>
          <p className="text-xs text-slate-500 font-medium mt-2">Active offline batches</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Pending Doubts</h3>
          <p className="mt-2 text-3xl font-black text-orange-400">14</p>
          <p className="text-xs text-slate-500 font-medium mt-2">Needs teacher review</p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Student Registrations</h2>
          <button className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">View All Users →</button>
        </div>
        
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700">
                <th className="p-4 font-semibold text-sm text-slate-400">Name</th>
                <th className="p-4 font-semibold text-sm text-slate-400">Email</th>
                <th className="p-4 font-semibold text-sm text-slate-400">Subscription Plan</th>
                <th className="p-4 font-semibold text-sm text-slate-400 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {recentSignups.map((user) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
