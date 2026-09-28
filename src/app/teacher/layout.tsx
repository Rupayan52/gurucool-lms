import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Universal Faculty Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 shadow-2xl z-20 sticky top-0 h-screen">
        <div className="text-2xl font-black tracking-tighter mb-12 flex items-center gap-2">
          <span className="text-blue-500">Guru</span>Cool.
          <span className="bg-blue-600 text-[10px] px-2 py-1 rounded uppercase tracking-widest font-black">Faculty</span>
        </div>
        
        <div className="flex-grow space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Management</div>
          
          <Link href="/teacher" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-xl transition-colors font-semibold group">
            <svg className="w-5 h-5 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            Resolution Center
          </Link>
          
          <Link href="/admin/content" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-xl transition-colors font-semibold group">
            <svg className="w-5 h-5 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            Content Manager
          </Link>

          <Link href="/teacher/profile" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-xl transition-colors font-semibold group">
            <svg className="w-5 h-5 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Faculty Profile
          </Link>
        </div>
        
        <div className="pt-6 border-t border-slate-800">
          <Link href="/teacher/studio" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-xl transition-colors font-semibold group"><svg className="w-5 h-5 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>Broadcast Studio</Link>
          <Link href="/teacher/forum" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-xl transition-colors font-semibold group"><svg className="w-5 h-5 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>Course Hubs</Link>
        <LogoutButton />
        </div>
      </aside>
      
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
