"use client";

import { useState } from "react";

export default function SupportPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Doubt Support</h1>
        <p className="mt-2 text-gray-500">Stuck on a concept? Ask our faculty directly.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket Submission Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Raise a New Query</h2>
          
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
              <h3 className="text-lg font-bold text-green-800">Doubt Submitted!</h3>
              <p className="text-green-600 mt-2 text-sm">A teacher will respond to your query within 24 hours.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm font-semibold text-green-700 bg-green-100 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
              >
                Ask Another Question
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                    <option>Physics</option>
                    <option>Biology</option>
                    <option>Mathematics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chapter/Topic</label>
                  <input type="text" placeholder="e.g., Optics" required className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Question</label>
                <textarea 
                  rows={4} 
                  required
                  placeholder="Describe exactly what you are struggling to understand..." 
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {loading ? "Submitting..." : "Submit Doubt"}
              </button>
            </form>
          )}
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-gray-800">Recent Queries</h3>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Physics</span>
              <span className="text-xs font-semibold text-green-600 flex items-center">● Resolved</span>
            </div>
            <p className="text-sm font-medium text-gray-800 line-clamp-2">How does Snell's Law apply to non-parallel mediums?</p>
            <p className="text-xs text-gray-500 mt-3">Answered by Mr. Sharma • 2 days ago</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Biology</span>
              <span className="text-xs font-semibold text-amber-500 flex items-center">● Pending</span>
            </div>
            <p className="text-sm font-medium text-gray-800 line-clamp-2">Difference between xylem and phloem structure?</p>
            <p className="text-xs text-gray-500 mt-3">Submitted • 4 hours ago</p>
          </div>
        </div>

      </div>
    </div>
  );
}
