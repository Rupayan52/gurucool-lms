import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background accents matching the enterprise theme */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-3xl w-full text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-bold text-xs uppercase tracking-widest mb-8 border border-blue-100 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          Next-Generation Phygital LMS
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6">
          Welcome to <span className="text-blue-600">GuruCool.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
          Seamlessly bridging the gap between offline classrooms and digital learning. Manage batches, track student progress, and resolve doubts in real-time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-600/20">
            Register yourself
          </Link>
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 hover:-translate-y-0.5 transition-all shadow-sm">
            Login as Student/Faculty
          </Link>
        </div>
      </div>

      {/* Hidden Admin Backdoor */}
      <div className="absolute bottom-6 right-6 opacity-20 hover:opacity-100 transition-opacity">
        <Link href="/login?admin=true" className="text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 text-sm font-bold">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </Link>
      </div>
    </main>
  );
}
