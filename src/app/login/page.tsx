"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.role === "TEACHER" || data.role === "FACULTY") {
        router.push("/teacher/resolution-center");
      } else if (data.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#111A2C] via-[#0B0F19] to-[#05070A] flex flex-col items-center justify-center p-4 font-sans selection:bg-blue-500/30">
      <div className="w-full max-w-[420px] bg-[#161B26]/80 backdrop-blur-xl border border-white/[0.05] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-8 sm:p-10 relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight mb-2"><span className="text-[#3B82F6]">Guru</span><span className="text-white">Cool.</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Unified Access Gateway</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center mb-6">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="name@gurucool.com" className="w-full bg-[#0F131C] border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Secure Password</label>
              <Link href="/forgot-password" className="text-[11px] font-bold text-blue-500 hover:text-blue-400 hover:underline transition-colors">Forgot password?</Link>
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#0F131C] border border-white/10 text-white rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600 font-mono tracking-widest" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 focus:outline-none">
                {showPassword ? (
                  <svg className="w-5 h-5 text-blue-400 hover:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-500 hover:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 015.058-5.058m1.28-1.28A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-1.28 1.28m-1.42 1.42a3 3 0 01-4.242-4.242M3 3l18 18" /></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-lg px-4 py-3.5 text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] active:scale-[0.98] disabled:opacity-50">
            {loading ? "Authenticating..." : "Authenticate Identity"}
          </button>
        </form>

        <div className="pt-6 mt-6 border-t border-white/5 text-center">
          <p className="text-xs font-medium text-slate-400">Unregistered? <Link href="/register" className="text-blue-500 hover:text-blue-400 font-bold hover:underline">Apply for an account</Link></p>
        </div>
      </div>
    </div>
  );
}
