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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900 mb-2 text-center">Reset Password</h1>
        
        {status === "success" ? (
          <div className="text-center">
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 font-medium">
              If an account matches that email or username, a reset link has been sent to your inbox.
            </div>
            <Link href="/login" className="text-blue-600 font-bold hover:underline">Return to Login</Link>
          </div>
        ) : (
          <>
            <p className="text-slate-500 text-sm text-center mb-6">Enter your email or username to receive a secure reset link.</p>
            {status === "error" && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-4">An error occurred. Please try again.</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Email or Username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-600" />
              <button type="submit" disabled={status === "loading"} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-70">
                {status === "loading" ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <div className="mt-6 text-center text-sm">
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">&larr; Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
