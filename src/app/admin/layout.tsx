import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row text-slate-100">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-black text-emerald-400 tracking-tight">GuruCool.</h1>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 block">Control Center</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0">
          <Link href="/admin" className="block px-4 py-3 rounded-lg bg-emerald-900/30 text-emerald-400 font-semibold border border-emerald-800/50 transition-colors">
            Overview
          </Link>
          <Link href="/admin/users" className="block px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 font-medium transition-colors">
            Manage Users
          </Link>
          <Link href="/admin/content" className="block px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 font-medium transition-colors">
            Content Hub
          </Link>
          <Link href="/admin/subscriptions" className="block px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 font-medium transition-colors">
            Subscriptions
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <Link href="/dashboard" className="flex w-full justify-center px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700 font-medium transition-colors">
            Return to App
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-slate-900">
        {children}
      </main>
    </div>
  );
}
