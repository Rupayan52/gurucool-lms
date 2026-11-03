"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!token) {
    return (
      <div className="text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 font-medium">Invalid or missing reset token.</div>
        <Link href="/forgot-password" className="text-blue-600 font-bold hover:underline">Request a new link</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Password Updated</h2>
        <p className="text-slate-500">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "error" && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">{errorMsg}</div>}
      <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-600" />
      <button type="submit" disabled={status === "loading"} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-70">
        {status === "loading" ? "Updating..." : "Save New Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900 mb-6 text-center">Set New Password</h1>
        <Suspense fallback={<div className="text-center text-slate-500">Loading secure portal...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
