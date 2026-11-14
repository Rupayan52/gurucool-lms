import React from "react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 mb-8"
        >
          ← Back to GuruCool Home
        </Link>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8">
          <div className="border-b border-slate-800 pb-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 mb-2">
              House of GnOvATech • Academic Code & Terms
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-white">Terms of Service</h1>
            <p className="text-xs text-slate-400 mt-2">
              Last Updated: November 2026 • Applicable to Students, Faculty & Partner Institutions
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Academic Integrity & Conduct</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Users participating in Course Hubs, Live Mission Control classes, and 1-on-1 Faculty
              Threads agree to uphold respectful academic discourse. Harassment, unauthorized sharing
              of live broadcast links, or misuse of the Doubt Clearing Desk may result in account
              suspension.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Intellectual Property</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              All curriculum modules, recorded lectures, AI Mastery evaluations, and platform
              architecture are the proprietary intellectual property of the House of GnOvATech and its
              faculty educators.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. 1-on-1 Mentorship Governance</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every 1-on-1 student-faculty workspace requires an explicit academic reason to initiate
              and a documented resolution summary upon closure for transparency and institutional
              quality assurance.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
