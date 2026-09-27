import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">User Directory</h1>
          <p className="mt-2 text-slate-500 font-medium text-lg">Platform-wide identity and access management.</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
           <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
           </div>
           <div>
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-0.5">Total Accounts</span>
             <span className="text-2xl font-black text-slate-900 leading-none">{users.length}</span>
           </div>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest">
                <th className="p-6">User Identity</th>
                <th className="p-6">Email Address</th>
                <th className="p-6">Clearance Level</th>
                <th className="p-6">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900">{u.name}</span>
                  </td>
                  <td className="p-6 font-mono text-sm text-slate-600">{u.email}</td>
                  <td className="p-6">
                    {u.role === 'ADMIN' && <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest">System Admin</span>}
                    {u.role === 'TEACHER' && <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest">Faculty</span>}
                    {u.role === 'STUDENT' && <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest">Scholar</span>}
                  </td>
                  <td className="p-6 text-sm text-slate-500 font-medium">
                    {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
