"use client";
import React from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-200 selection:text-blue-900 font-sans">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 sm:px-6">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="text-center max-w-4xl z-10 flex flex-col items-center">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-blue-100 shadow-sm px-5 py-2 rounded-full mb-8">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
            <span className="text-xs sm:text-sm font-black text-blue-600 uppercase tracking-widest">
              Innovative Solutions by GnOvATech — Phase 2
            </span>
          </div>

          <h1 className="text-6xl sm:text-8xl font-black text-slate-900 tracking-tight leading-tight mb-2">
            Welcome to
          </h1>
          <h1 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight leading-tight mb-8 pb-2">
            GuruCOOL.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed mb-5">
            A next-generation phygital LMS bridging the gap between offline classrooms and digital learning. We go beyond textbooks to deliver strong academics, expert guidance, and future-ready skills.
          </p>
          <p className="text-sm sm:text-base text-slate-400 font-black uppercase tracking-widest mb-10">
            Learn. Explore. Grow. Lead.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.25)] flex-1 sm:flex-none">
              Register yourself
            </button>
            <button className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-sm flex-1 sm:flex-none">
              Login as Student/Faculty
            </button>
          </div>
        </div>
      </section>

      {/* ================= MEDIA & VISION SECTION ================= */}
      <section className="py-24 bg-white px-4 sm:px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">The GuruCool Inauguration</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Experience the launch of Phase 2 and see how we are transforming the educational landscape through technology.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Primary Launch Video */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 aspect-video relative group">
              <iframe 
                className="w-full h-full absolute inset-0"
                src="https://www.youtube.com/embed/eMYCbmjyMqc?si=uRz1vN-fI0Z8gA8n" 
                title="GuruCool Inauguration by GnOvaTech" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            
            {/* Platform Walkthrough / Secondary Video */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 aspect-video flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-slate-800 to-slate-950 relative">
               <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/50">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-blue-400 border-b-8 border-b-transparent ml-1"></div>
               </div>
               <h3 className="text-white font-black text-xl mb-2">Platform Tour</h3>
               <p className="text-slate-400 text-sm">Watch how our AI Doubt Engine and Native Broadcasts operate seamlessly.</p>
               <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="bg-blue-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-full">Coming Soon</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS SECTION ================= */}
      <section className="py-24 bg-slate-50 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">Student Success Stories</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Don't just take our word for it. See how the Phygital experience is changing outcomes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex text-amber-400 mb-4 text-xl">★★★★★</div>
              <p className="text-slate-700 font-medium leading-relaxed mb-6">"The Live Mission Control classes are incredible. The video never buffers, and the way the teacher handles doubts through the AI queue makes sure my questions are actually answered."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-black text-lg">A</div>
                <div>
                  <h4 className="font-black text-slate-900">Aarav Sharma</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Engineering Batch</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex text-amber-400 mb-4 text-xl">★★★★★</div>
              <p className="text-slate-700 font-medium leading-relaxed mb-6">"Having both one-to-many broadcasts and direct 1-on-1 Zoom-style doubt clearing inside a single platform is a game changer. I requested a meet for Thermodynamics and was in a call 2 minutes later."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-black text-lg">S</div>
                <div>
                  <h4 className="font-black text-slate-900">Sneha Patel</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Medical Batch</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex text-amber-400 mb-4 text-xl">★★★★★</div>
              <p className="text-slate-700 font-medium leading-relaxed mb-6">"The phygital blend is seamless. If I miss an offline class, the high-quality recordings and direct faculty access from my phone make it feel like I never missed a beat."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-black text-lg">V</div>
                <div>
                  <h4 className="font-black text-slate-900">Vikram S.</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Foundation Batch</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOUNDERS / LEADERSHIP SECTION ================= */}
      <section className="py-24 bg-white px-4 sm:px-6 border-t border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -z-10"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">The Visionaries Behind GnOvATech</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Driven by a passion to disrupt traditional learning, our leadership team merges elite technology with pedagogical excellence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Founder Card 1 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-32 h-32 bg-slate-200 rounded-full mb-6 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                <svg className="w-16 h-16 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Founding Leadership</h3>
              <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">CEO & Visionary</p>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                Spearheading the Phase 2 revolution. Dedicated to creating an ecosystem where technology operates invisibly, allowing pure, unhindered education to take center stage for every student in India.
              </p>
            </div>

            {/* Founder Card 2 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-32 h-32 bg-slate-200 rounded-full mb-6 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                <svg className="w-16 h-16 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Technical Architecture</h3>
              <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">CTO & Innovation Head</p>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                The architect behind the GuruCool infrastructure. Focused on building robust, scalable WebRTC networks, AI-prioritized doubt queues, and seamless native broadcast integrations that never fail.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-black text-white mb-2">GuruCOOL.</h2>
          <p className="text-xs font-bold uppercase tracking-widest mb-8 text-blue-500">
            Powered by the House of GnOvATech
          </p>
          <div className="flex justify-center gap-6 mb-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
          <p className="text-xs text-slate-600">© 2026 GnOvATech. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
