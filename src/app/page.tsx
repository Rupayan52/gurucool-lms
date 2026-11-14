"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [activeVideo, setActiveVideo] = useState<null | "INAUGURATION" | "WALKTHROUGH">(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* SUBTLE, EXECUTIVE TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/gurucool-logo.svg"
              alt="GuruCool by GnOvATech"
              className="w-9 h-9 rounded-full shadow-sm border border-slate-200"
            />
            <div>
              <span className="text-base font-black tracking-tight text-slate-900">
                GuruCool
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                House of GnOvATech
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600">
            <a href="#ecosystem" className="hover:text-indigo-600 transition-colors">
              Ecosystem
            </a>
            <a href="#inauguration" className="hover:text-indigo-600 transition-colors">
              Inauguration
            </a>
            <a href="#outcomes" className="hover:text-indigo-600 transition-colors">
              Outcomes
            </a>
            <a href="#leadership" className="hover:text-indigo-600 transition-colors">
              Leadership
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold tracking-tight transition-colors shadow-sm"
            >
              Portal Sign In →
            </Link>
          </div>
        </div>
      </header>

      {/* EDITORIAL HERO SECTION (CLEAN, PROFESSIONAL, NOT SHOUTING LOGIN/REGISTER) */}
      <section
        id="ecosystem"
        className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 px-5 sm:px-8 bg-gradient-to-b from-white via-slate-50/70 to-[#F8FAFC]"
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-extrabold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Phase 2 Phygital Learning Architecture • Made in India
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.08] mb-6">
            Where Elite Pedagogy Meets{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              Real-Time AI Mastery.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            GuruCool by GnOvATech unifies low-latency live classroom broadcasts, AI-prioritized doubt
            queues, and direct 1-on-1 faculty mentorship into a single distraction-free academic
            workspace.
          </p>

          {/* Subtle, informative navigation pills instead of aggressive Login/Register walls */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14">
            <a
              href="#inauguration"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-slate-900/10 transition-all"
            >
              Explore Phase 2 Showcase
            </a>
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              Enter Academic Workspace →
            </Link>
          </div>

          {/* 3 Architectural Pillars */}
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 text-left max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm mb-3">
                01
              </div>
              <h3 className="text-sm font-black text-slate-900 mb-1">
                Live Mission Control
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zero-buffer interactive broadcasts with synchronized digital whiteboards and instant
                student telemetry.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm mb-3">
                02
              </div>
              <h3 className="text-sm font-black text-slate-900 mb-1">
                AI Doubt Resolution Desk
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Intelligent triage queues student questions by topic urgency so no academic doubt goes
                unanswered.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm mb-3">
                03
              </div>
              <h3 className="text-sm font-black text-slate-900 mb-1">
                1-on-1 Faculty Chambers
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                On-demand private mentorship threads and live video consultations directly with
                subject professors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE GURUCOOL INAUGURATION SECTION (CLEAN SEPARATION OF ARTWORK & TEXT) */}
      <section id="inauguration" className="py-16 md:py-24 px-5 sm:px-8 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
              The GuruCool Inauguration
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              Experience the launch of Phase 2 and see how we are transforming the educational
              landscape through technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Card 1: Launch Event */}
            <div className="group bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">
              <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                <img
                  src="/gurucool-logo.svg"
                  alt="Inauguration by GnOvATech"
                  className="w-28 h-28 sm:w-36 sm:h-36 object-contain transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">
                  Launch Event
                </span>
                <button
                  type="button"
                  onClick={() => setActiveVideo("INAUGURATION")}
                  className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform"
                  aria-label="Play Inauguration Video"
                >
                  ▶
                </button>
              </div>
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between bg-slate-950 text-white">
                <div>
                  <h3 className="text-lg sm:text-xl font-black mb-1">
                    Inauguration by GnOvATech
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Watch the full launch & partner unveiling ceremony for Bachhon Ki Nayi Udaan.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Interactive Showcase */}
            <div className="group bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">
              <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                <img
                  src="/gnovatech-logo.svg"
                  alt="GuruCool Platform Walkthrough"
                  className="w-28 h-28 sm:w-36 sm:h-36 object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest">
                  Interactive Showcase
                </span>
                <button
                  type="button"
                  onClick={() => setActiveVideo("WALKTHROUGH")}
                  className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-transform"
                  aria-label="Play Platform Walkthrough"
                >
                  ▶
                </button>
              </div>
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between bg-slate-950 text-white">
                <div>
                  <h3 className="text-lg sm:text-xl font-black mb-1">
                    GuruCool Platform Walkthrough
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Experience the dynamic Phygital features, AI Mastery analytics, and Live Studio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STUDENT SUCCESS STORIES */}
      <section id="outcomes" className="py-16 md:py-24 px-5 sm:px-8 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Student Success Stories
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              Don&apos;t just take our word for it. See how the Phygital experience is changing
              outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-amber-400 text-lg tracking-widest mb-4">★★★★★</div>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6">
                  &ldquo;The Live Mission Control classes are incredible. The video never buffers,
                  and the way the teacher handles doubts through the AI queue makes sure my
                  questions are actually answered.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm">
                  A
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Aarav Sharma</h4>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Engineering Batch
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-amber-400 text-lg tracking-widest mb-4">★★★★★</div>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6">
                  &ldquo;Having both one-to-many broadcasts and direct 1-on-1 Zoom-style doubt
                  clearing inside a single platform is a game changer. I requested a meet for
                  Thermodynamics and was in a call 2 minutes later.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-sm">
                  S
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Sneha Patel</h4>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Medical Batch
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE VISIONARIES BEHIND GNOVATECH */}
      <section id="leadership" className="py-16 md:py-24 px-5 sm:px-8 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
              The Visionaries Behind GnOvATech
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              Driven by a passion to disrupt traditional learning, our leadership team merges elite
              technology with pedagogical excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-[#F8FAFC] p-8 sm:p-10 rounded-3xl border border-slate-200/80 text-center">
              <div className="w-24 h-14 rounded-full bg-slate-200/80 border-2 border-white shadow-inner mx-auto mb-6 flex items-center justify-center text-slate-500">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">Founding Leadership</h3>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 mb-4">
                CEO &amp; Visionary
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Spearheading the Phase 2 revolution. Dedicated to creating an ecosystem where
                technology operates invisibly, allowing pure, unhindered education to take center
                stage for every student in India.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-8 sm:p-10 rounded-3xl border border-slate-200/80 text-center">
              <div className="w-24 h-14 rounded-full bg-slate-200/80 border-2 border-white shadow-inner mx-auto mb-6 flex items-center justify-center text-slate-500">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">Technical Architecture</h3>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 mb-4">
                CTO &amp; Innovation Head
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The architect behind the GuruCool infrastructure. Focused on building robust,
                scalable WebRTC networks, AI-prioritized doubt queues, and seamless native broadcast
                integrations that never fail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WORKING FOOTER WITH FUNCTIONAL PRIVACY POLICY, TERMS OF SERVICE & CONTACT SUPPORT */}
      <footer className="bg-[#0B1120] text-white py-14 px-5 sm:px-8 mt-auto">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div>
            <h2 className="text-2xl font-black tracking-tight">GuruCOOL.</h2>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-400 mt-1">
              Powered by the House of GnOvATech
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-semibold text-slate-300 pt-2">
            <Link
              href="/privacy-policy"
              className="hover:text-white underline-offset-4 hover:underline transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-white underline-offset-4 hover:underline transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact-support"
              className="hover:text-white underline-offset-4 hover:underline transition-colors"
            >
              Contact Support
            </Link>
          </div>

          <p className="text-[11px] text-slate-500 pt-4">
            © 2026 GnOvATech. All rights reserved.
          </p>
        </div>
      </footer>

      {/* INTERACTIVE SHOWCASE MODAL WHEN PLAY BUTTON IS CLICKED */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white shadow-2xl space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-600">
                {activeVideo === "INAUGURATION" ? "Launch Keynote" : "Platform Walkthrough"}
              </span>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold"
              >
                ✕
              </button>
            </div>
            <h3 className="text-xl font-black">
              {activeVideo === "INAUGURATION"
                ? "GuruCool Phase 2 Inauguration by GnOvATech"
                : "Interactive Phygital Architecture Walkthrough"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeVideo === "INAUGURATION"
                ? "Welcome to Bachhon Ki Nayi Udaan. GuruCool unites classroom discipline with AI-driven mastery tracking, real-time doubt resolution, and dedicated faculty mentorship."
                : "Students and faculty collaborate through live WebRTC classrooms, structured curriculum modules, and 1-on-1 audited resolution chambers."}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-bold"
              >
                Close Preview
              </button>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold"
              >
                Open Live Portal →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
