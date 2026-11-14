import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
              House of GnOvATech • Legal Governance
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-white">Privacy Policy</h1>
            <p className="text-xs text-slate-400 mt-2">
              Effective Date: November 2026 • GuruCool Phygital Learning Ecosystem
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              GuruCool by GnOvATech collects academic enrollment records, student and faculty profile
              identifiers, live classroom telemetry, assignment submissions, and AI doubt-resolution
              transcripts strictly to deliver personalized phygital education.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. How Your Data Is Used</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We use your academic data to power real-time AI Mastery insights, route subject-specific
              doubts to assigned faculty, synchronize live broadcast sessions, and maintain secure
              1-on-1 mentorship logs. We never sell student or faculty personal information to
              third-party advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Security & Encryption</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              All sessions are protected via encrypted HTTP-only authentication tokens, role-based
              access controls (RBAC), and TLS 1.3 transport security across web and mobile endpoints.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Data Retention & Student Rights</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Students, parents, and faculty may request an export or deletion of their personal
              dossier at any time through the{" "}
              <Link href="/contact-support" className="text-indigo-400 underline">
                Contact Support Desk
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
