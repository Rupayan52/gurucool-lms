"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FacultyProfile() {
  const [user, setUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();

  useEffect(() => { fetch("/api/auth/profile").then(res => res.json()).then(setUser); }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPassword }) });
    if (res.ok) { alert("Key rotated."); router.push("/login"); }
  };

  if (!user) return <div className="p-10 text-slate-400 font-bold animate-pulse">Verifying Executive Clearance...</div>;

  return (
    <div className="p-10 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900">Executive Identity</h1>
        <p className="mt-2 text-slate-500 font-medium text-lg">Platform clearance and security management.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-8 relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-3xl rounded-full -z-10"></div>
          <div className="flex items-center gap-2 mb-8 opacity-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <span className="text-xs font-black uppercase tracking-widest">Verified Faculty Badge</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-5xl font-black shadow-inner shadow-black/50 border border-white/10">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-4xl font-black mb-3">{user.name}</h2>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-mono text-blue-300">{user.email}</span>
                <span className="inline-flex w-max px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-black uppercase tracking-widest border border-white/10">Clearance: {user.role}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col justify-center">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg> Key Rotation
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input type="password" required minLength={6} placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium" />
            <button type="submit" className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 shadow-md">Update Credentials</button>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center mt-2">Terminates all active sessions</p>
          </form>
        </div>
      </div>
    </div>
  );
}
