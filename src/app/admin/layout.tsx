"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminInactivityTimer from "@/components/AdminInactivityTimer";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin-login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row text-slate-100">
      <AdminInactivityTimer />
      
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-black text-emerald-400 tracking-tight">GuruCool.</h1>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 block">Control Center</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/admin" className="block px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">Overview</Link>
          <Link href="/admin/users" className="block px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">Manage Users</Link>
          <div className="block px-4 py-3 rounded-xl text-slate-600 cursor-not-allowed">Content Hub</div>
          <div className="block px-4 py-3 rounded-xl text-slate-600 cursor-not-allowed">Subscriptions</div>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link href="/login" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm font-medium">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-xs">N</span> Return to App
          </Link>
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-950/30 transition-colors text-sm font-medium">
            Secure Logout
          </button>
        </div>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
