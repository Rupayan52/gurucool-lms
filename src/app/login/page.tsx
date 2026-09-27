"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginGateway() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdminLogin = searchParams.get("admin") === "true";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      // The Database dictates the routing automatically
      if (data.role === "TEACHER") {
        router.push("/teacher");
      } else if (data.role === "ADMIN") {
        router.push("/admin/content");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError(data.error || "Authentication failed. Check credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 p-4 relative overflow-hidden">
      {/* High-End Enterprise Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 relative z-10">
        <div className="text-center mb-10">
          <div className="text-4xl font-black tracking-tighter mb-2 text-white">
            <span className="text-blue-500">Guru</span>Cool.
          </div>
          <p className="text-slate-400 font-medium text-sm uppercase tracking-widest">
            {isAdminLogin ? "System Administrator Access" : "Unified Access Gateway"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm font-bold mb-6 border border-red-500/20 text-center flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl p-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 font-medium transition-all" placeholder="name@domain.com" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Secure Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl p-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 font-medium transition-all" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 hover:bg-blue-500 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>Authenticate Identity <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></>
            )}
          </button>
        </form>

        {!isAdminLogin && (
          <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm font-medium text-slate-400">
            Unregistered? <Link href="/register" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Apply for an account</Link>
          </div>
        )}
      </div>

    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900"><div className="text-blue-500 font-bold animate-pulse tracking-widest uppercase">Initializing Gateway...</div></div>}>
      <LoginGateway />
    </Suspense>
  );
}
