"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type ScoreRecord = {
  id: string;
  quizTitle: string;
  subjectName: string;
  rawScore: number;
  totalQuestions: number;
  date: string;
};

export default function AssessmentsPage() {
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quiz/scores")
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setScores(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assessments & Quizzes</h1>
        <p className="mt-2 text-slate-500">Test your knowledge and track your performance.</p>
      </header>

      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-lg text-sm">🔥</span>
          <h2 className="text-xl font-bold text-slate-900">Pending Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              Due Today
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-2">Light & Optics Concept Check</h3>
            <p className="text-blue-500 text-sm font-medium mb-4">Physics</p>
            <div className="flex items-center gap-4 text-slate-500 text-sm mb-6">
              <span className="flex items-center gap-1">⏱️ 20 mins</span>
              <span className="flex items-center gap-1">📝 15 Questions</span>
            </div>
            <Link href="/dashboard/quiz" className="block w-full text-center bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">
              Start Quiz
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              Due Tomorrow
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-2">Cellular Energy & ATP</h3>
            <p className="text-blue-500 text-sm font-medium mb-4">Biology</p>
            <div className="flex items-center gap-4 text-slate-500 text-sm mb-6">
              <span className="flex items-center gap-1">⏱️ 10 mins</span>
              <span className="flex items-center gap-1">📝 3 Questions</span>
            </div>
            <Link href="/dashboard/quiz" className="block w-full text-center bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">
              Start Quiz
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Scores</h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-[150px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-sm text-slate-600">Test Name</th>
                <th className="p-4 font-semibold text-sm text-slate-600">Subject</th>
                <th className="p-4 font-semibold text-sm text-slate-600">Date</th>
                <th className="p-4 font-semibold text-sm text-slate-600 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400 animate-pulse">Loading scores...</td></tr>
              ) : scores.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">No quizzes completed yet.</td></tr>
              ) : (
                scores.map((score) => {
                  const percentage = Math.round((score.rawScore / score.totalQuestions) * 100);
                  return (
                    <tr key={score.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-900 font-medium">{score.quizTitle}</td>
                      <td className="p-4 text-slate-500 text-sm">{score.subjectName}</td>
                      <td className="p-4 text-slate-500 text-sm">{score.date}</td>
                      <td className="p-4 text-right font-bold text-emerald-600">{percentage}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
