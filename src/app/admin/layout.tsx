import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 shadow-2xl z-20 sticky top-0 h-screen">
        <div className="text-2xl font-black tracking-tighter mb-12 flex items-center gap-2">
          <span className="text-blue-500">Guru</span>Cool.
          <span className="bg-red-600 text-[10px] px-2 py-1 rounded uppercase tracking-widest font-black shadow-sm">Admin</span>
        </div>
        
        <div className="flex-grow space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 mt-4">Command Center</div>
          
          <Link href="/admin/content" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-xl transition-colors font-semibold group">
            <svg className="w-5 h-5 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            Content Manager
          </Link>
          
          <Link href="/admin/batches" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-xl transition-colors font-semibold group"><svg className="w-5 h-5 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>Batch Matrix</Link>
          <Link href="/admin/users" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-xl transition-colors font-semibold group">
            <svg className="w-5 h-5 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            User Directory
          </Link>
        </div>
        
        <div className="pt-6 border-t border-slate-800">
          <LogoutButton />
        </div>
      </aside>
      
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
