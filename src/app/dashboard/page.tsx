export default function DashboardHome() {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Insights & Mastery</h1>
        <p className="mt-2 text-slate-500 font-medium text-lg">Your learning trajectory, quantified.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">⏱️</div>
           <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Study Velocity</div>
           <div className="text-4xl font-black text-slate-900">14.2<span className="text-lg text-slate-400 ml-1">hrs</span></div>
           <div className="mt-4 text-xs font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md">+12% vs last week</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">🎯</div>
           <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Assessment Accuracy</div>
           <div className="text-4xl font-black text-slate-900">92<span className="text-lg text-slate-400 ml-1">%</span></div>
           <div className="mt-4 text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded-md">Top 5% of Scholars</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl relative overflow-hidden text-white">
           <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500 blur-3xl opacity-30 rounded-full"></div>
           <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">GuruAI Suggestion</div>
           <h3 className="text-xl font-bold mt-2 leading-tight">Focus on "Optics & Light"</h3>
           <p className="text-slate-400 text-sm mt-2 font-medium">Your recent quiz scores show a 15% drop in reflection formulas. Watch Lesson 3.4.</p>
        </div>
      </div>

      <h2 className="text-xl font-black text-slate-900 mb-6">Upcoming Live Concierge Sessions</h2>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        </div>
        <h3 className="font-bold text-slate-900 text-lg">No Live Mentorships Scheduled</h3>
        <p className="text-slate-500 mt-2 font-medium">Submit a doubt in the Expert Helpdesk to trigger a 1-on-1 video breakdown.</p>
      </div>
    </div>
  );
}
