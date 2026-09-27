"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/student/profile").then(res => res.json()).then(setUser);
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword })
    });
    if (res.ok) {
      alert("Password updated securely. Please log in again.");
      router.push("/login");
    }
  };

  if (!user) return <div className="p-10 animate-pulse text-slate-400 font-bold">Decrypting profile data...</div>;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Profile & Security</h1>
        <p className="mt-2 text-slate-500 font-medium text-lg">Manage your identity and cryptographic keys.</p>
      </header>

      {/* Identity Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -z-10"></div>
        
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-4xl font-black shadow-inner shadow-slate-700/50">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">{user.name}</h2>
            <div className="flex gap-3">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold font-mono border border-slate-200">{user.email}</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black uppercase tracking-widest border border-blue-200">{user.role}</span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black uppercase tracking-widest border border-emerald-200">Pro Plan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Module */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          Cryptographic Access
        </h3>
        
        <form onSubmit={handlePasswordChange} className="max-w-md">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Rotate Password</label>
          <div className="flex gap-4">
            <input type="password" required minLength={6} placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="flex-1 border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium" />
            <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-md">Rotate Key</button>
          </div>
          <p className="mt-3 text-xs text-slate-400 font-medium">Rotating your password will instantly terminate all active sessions across all devices.</p>
        </form>
      </div>
    </div>
  );
}
