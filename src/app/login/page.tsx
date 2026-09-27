"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdminLogin = searchParams.get("admin") === "true";
  
  const [role, setRole] = useState(isAdminLogin ? "ADMIN" : "STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (res.ok) {
      if (data.role === "TEACHER") router.push("/teacher");
      else if (data.role === "ADMIN") router.push("/admin/content");
      else router.push("/dashboard");
    } else {
      setError(data.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="text-3xl font-black tracking-tighter mb-2">
            <span className="text-blue-600">Guru</span>Cool.
          </div>
          <p className="text-slate-500 font-medium">
            {isAdminLogin ? "System Administrator Access" : "Welcome back to your workspace."}
          </p>
        </div>

        {!isAdminLogin && (
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button onClick={() => setRole("STUDENT")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === "STUDENT" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Student</button>
            <button onClick={() => setRole("TEACHER")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === "TEACHER" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Faculty</button>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold mb-6 border border-red-100 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium" />
          </div>
          <button type="submit" className={`w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md ${isAdminLogin ? 'bg-slate-900 hover:bg-slate-800' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5'}`}>
            Secure Login
          </button>
        </form>

        {!isAdminLogin && (
          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            New to GuruCool? <Link href="/register" className="text-blue-600 font-bold hover:underline">Apply for an account</Link>
          </div>
        )}
      </div>

      {/* The Hidden Admin Backdoor */}
      <div className="absolute bottom-6 right-6 opacity-20 hover:opacity-100 transition-opacity">
        <Link href="/login?admin=true" className="text-slate-900 hover:text-blue-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </Link>
      </div>
    </div>
  );
}
