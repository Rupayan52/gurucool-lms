"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!token) {
    return (
      <div className="text-center">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-4 font-medium text-sm">Invalid or missing token.</div>
        <Link href="/forgot-password" className="text-blue-500 font-bold hover:underline text-sm">Request new link</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please ensure both fields are identical.");
      setStatus("error");
      return;
    }
    
    setStatus("loading");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    if (res.ok) {
      setStatus("success");
      setTimeout(() => router.push("/login"), 2500);
    } else {
      const data = await res.json();
      setErrorMsg(data.error || "Failed to reset password");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Password Updated</h2>
        <p className="text-sm text-slate-400">Redirecting to login portal...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === "error" && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">{errorMsg}</div>}
      
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Enter New Password</label>
        <div className="relative">
          <input type={showNewPassword ? "text" : "password"} required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Type new password" className="w-full bg-[#0F131C] border border-white/10 text-white rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600 font-mono tracking-widest" />
          <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 focus:outline-none">
            {showNewPassword ? (
              <svg className="w-5 h-5 text-blue-400 hover:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            ) : (
              <svg className="w-5 h-5 text-slate-500 hover:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 015.058-5.058m1.28-1.28A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-1.28 1.28m-1.42 1.42a3 3 0 01-4.242-4.242M3 3l18 18" /></svg>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Confirm Password (Hidden)</label>
        <input type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#0F131C] border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600 font-mono tracking-widest" />
      </div>

      <button type="submit" disabled={status === "loading"} className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold rounded-lg px-4 py-3.5 text-sm transition-all active:scale-[0.98] disabled:opacity-50">
        {status === "loading" ? "Updating Security..." : "Save New Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#111A2C] via-[#0B0F19] to-[#05070A] flex flex-col items-center justify-center p-4 font-sans selection:bg-blue-500/30">
      <div className="w-full max-w-[420px] bg-[#161B26]/80 backdrop-blur-xl border border-white/[0.05] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden p-8 sm:p-10 relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">Set New Password</h1>
          <p className="text-xs text-slate-400">Secure your GuruCool identity</p>
        </div>
        <Suspense fallback={<div className="text-center text-slate-500 text-sm">Loading security module...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
