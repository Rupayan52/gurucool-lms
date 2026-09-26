import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      
      <div className="max-w-4xl text-center px-6 relative z-10">
        <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
          🚀 Next-Generation Phygital LMS
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">GuruCool.</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Seamlessly bridging the gap between offline classrooms and digital learning. 
          Manage batches, track student progress, and resolve doubts in real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30 text-lg"
          >
            Student Onboarding
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-lg"
          >
            Student Login
          </Link>
          <Link 
            href="/admin" 
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg text-lg"
          >
            Admin Control Center
          </Link>
        </div>
      </div>
    </div>
  );
}
