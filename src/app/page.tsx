"use client";
import React, { useState } from "react";
import Link from "next/link"; 

export default function LandingPage() {
  const [activeModalVideo, setActiveModalVideo] = useState<string | null>(null);

  const openVideo = (videoId: string, start?: number) => {
    const startParam = start ? `?start=${start}&autoplay=1` : `?autoplay=1`;
    setActiveModalVideo(`https://www.youtube.com/embed/${videoId}${startParam}`);
  };

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

          {/* THE ALIGNMENT FIX: Strictly centered flex layout with auto-sizing wrappers */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-md sm:max-w-none mx-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.25)] block">
                Register yourself
              </button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-sm block">
                Login as Student/Faculty
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= MEDIA & PLAYABLE VIDEO SECTION ================= */}
      <section className="py-24 bg-white px-4 sm:px-6 border-t border-slate-100 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">The GuruCool Inauguration</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Experience the launch of Phase 2 and see how we are transforming the educational landscape through technology.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div 
              onClick={() => openVideo("eMYCbmjyMqc")} 
              className="group cursor-pointer bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 aspect-video relative hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] transition-all transform hover:-translate-y-1 duration-300"
            >
              <img 
                src="https://img.youtube.com/vi/eMYCbmjyMqc/maxresdefault.jpg" 
                alt="GuruCool Inauguration by GnOvaTech"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-300 absolute inset-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-6">
                <span className="bg-blue-600 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full self-start shadow-md">
                  Launch Event
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <svg className="w-6 h-6 ml-1 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg sm:text-xl leading-tight">Inauguration by GnOvaTech</h3>
                    <p className="text-slate-300 text-xs sm:text-sm font-semibold">Watch the full launch & partner unveiling</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div 
              onClick={() => openVideo("eMYCbmjyMqc", 120)} 
              className="group cursor-pointer bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 aspect-video relative hover:shadow-[0_20px_50px_rgba(99,102,241,0.15)] transition-all transform hover:-translate-y-1 duration-300"
            >
              <img 
                src="https://img.youtube.com/vi/eMYCbmjyMqc/maxresdefault.jpg" 
                alt="GuruCool Platform Walkthrough"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-300 absolute inset-0 filter hue-rotate-15"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-6">
                <span className="bg-indigo-600 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full self-start shadow-md">
                  Interactive Showcase
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <svg className="w-6 h-6 ml-1 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg sm:text-xl leading-tight">GuruCool Platform Walkthrough</h3>
                    <p className="text-slate-300 text-xs sm:text-sm font-semibold">Experience the dynamic Phygital features</p>
                  </div>
                </div>
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

      {/* ================= LIGHTBOX / MODAL OVERLAY ================= */}
      {activeModalVideo && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-10 transition-all">
          <div className="w-full max-w-5xl flex justify-between items-center mb-4 z-50">
            <a 
              href={activeModalVideo.replace("embed/", "watch?v=")} 
              target="_blank" 
              rel="noreferrer" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-black text-xs sm:text-sm uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg"
            >
              Watch directly on YouTube (Failsafe)
            </a>
            <button 
              onClick={() => setActiveModalVideo(null)} 
              className="bg-red-600 hover:bg-red-700 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full font-black text-lg transition-transform hover:scale-105"
            >
              ✕
            </button>
          </div>
          
          <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-black relative z-40">
            <iframe 
              className="w-full h-full absolute inset-0"
              src={activeModalVideo} 
              title="GuruCool Video Player" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center relative z-10">
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
