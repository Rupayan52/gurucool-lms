"use client";
import React, { useState } from "react";

export function AiDoubtTriageWidget() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/doubt-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 my-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-500">
            Phase 3 Intelligence
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            AI Mastery & Instant Doubt Triage
          </h2>
        </div>
        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-xl">
          Online • 0ms Latency
        </span>
      </div>

      <form onSubmit={handleAsk} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Ask Any Academic Concept or Doubt
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g., Explain the Nernst equation in biological systems..."
              className="flex-1 px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all flex-shrink-0"
            >
              {loading ? "Analyzing..." : "Ask AI ⚡"}
            </button>
          </div>
        </div>
      </form>

      {result && (
        <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
              {result.status === "RESOLVED_BY_AI" ? "✨ AI Instant Resolution" : "📬 Escalated to Faculty Resolution Center"}
            </span>
            <span className="text-[10px] text-slate-400">GuruCool Engine v3.1</span>
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            {result.aiAnswer}
          </p>
        </div>
      )}
    </div>
  );
}
