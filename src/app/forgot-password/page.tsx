"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });
    setStatus(res.ok ? "success" : "error");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#111A2C] via-[#0B0F19] to-[#05070A] flex flex-col items-center justify-center p-4 font-sans selection:bg-blue-500/30">
      <div className="w-full max-w-[420px] bg-[#161B26]/80 backdrop-blur-xl border border-white/[0.05] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-8 sm:p-10 relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">Reset Password</h1>
        </div>

        {status === "success" ? (
          <div className="text-center animate-in fade-in duration-500">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-6 text-sm">
              If an account matches that email or username, a reset link has been dispatched to your inbox.
            </div>
            <Link href="/login" className="text-blue-500 font-bold hover:text-white transition-colors text-sm">Return to Login</Link>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <p className="text-slate-400 text-xs text-center mb-6 leading-relaxed">Enter your registered email address or username to receive a secure recovery link.</p>
            {status === "error" && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center mb-4">Error processing request.</div>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Identity Target</label>
                <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email or Username" className="w-full bg-[#0F131C] border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600" />
              </div>
              <button type="submit" disabled={status === "loading"} className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold rounded-lg px-4 py-3.5 text-sm transition-all active:scale-[0.98] disabled:opacity-50">
                {status === "loading" ? "Dispatching..." : "Send Reset Link"}
              </button>
            </form>
            <div className="mt-6 text-center text-sm">
              <Link href="/login" className="text-slate-500 font-semibold hover:text-white transition-colors flex items-center justify-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back to Login</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
