"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    setLoading(true);
    const res = await fetch("/api/student/upgrade", { method: "POST" });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/profile"), 2000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-emerald-50 p-8 rounded-2xl border border-emerald-200 text-center animate-in zoom-in duration-500">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-black text-emerald-900 mb-2">Welcome to Premium!</h2>
        <p className="text-emerald-700">Your account has been successfully upgraded. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Plans & Billing</h1>
        <p className="mt-2 text-slate-500">Upgrade to GuruCool Premium for unlimited access.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Tier */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm opacity-70">
          <h3 className="text-xl font-bold text-slate-900">Basic Tier</h3>
          <div className="text-4xl font-black text-slate-900 my-4">Free</div>
          <ul className="space-y-3 mb-8 text-sm text-slate-600 font-medium">
            <li className="flex items-center gap-2"><span>✅</span> Access to standard lessons</li>
            <li className="flex items-center gap-2"><span>✅</span> Basic quizzes</li>
            <li className="flex items-center gap-2"><span>❌</span> No direct mentor support</li>
            <li className="flex items-center gap-2"><span>❌</span> No PDF downloads</li>
          </ul>
          <div className="w-full text-center py-3 rounded-xl bg-slate-100 text-slate-500 font-bold text-sm">
            Current Plan
          </div>
        </div>

        {/* Premium Tier */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">POPULAR</div>
          <h3 className="text-xl font-bold text-white">Premium Tier</h3>
          <div className="text-4xl font-black text-white my-4">₹999<span className="text-lg text-slate-400 font-medium">/yr</span></div>
          <ul className="space-y-3 mb-8 text-sm text-slate-300 font-medium">
            <li className="flex items-center gap-2"><span>🚀</span> Unlimited Phygital Lessons</li>
            <li className="flex items-center gap-2"><span>📈</span> Advanced Analytics & Quizzes</li>
            <li className="flex items-center gap-2"><span>💬</span> Priority Doubt Support Helpdesk</li>
            <li className="flex items-center gap-2"><span>📄</span> Offline PDF Downloads</li>
          </ul>
          <button 
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full text-center py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {loading ? "Processing Secure Checkout..." : "Upgrade to Premium"}
          </button>
          <p className="text-center text-xs text-slate-500 mt-4 font-mono">* Simulated for portfolio demonstration</p>
        </div>
      </div>
    </div>
  );
}
