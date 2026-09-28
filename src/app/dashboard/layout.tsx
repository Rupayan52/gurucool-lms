"use client";
import LogoutButton from "@/components/LogoutButton";
import AutoLogout from "@/components/AutoLogout";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserBasic = {
  name: string;
  role: string;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserBasic | null>(null);
  
  // Initialize sidebar as CLOSED by default for all screen sizes
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.name) setUser({ name: data.name, role: data.role });
      })
      .catch((err) => console.error("Failed to load profile", err));
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: "🏠" },
    { name: "My Courses", href: "/dashboard/courses", icon: "📚" },
    { name: "Assessments & Quizzes", href: "/dashboard/assessments", icon: "📝" },
    { name: "Doubt Support", href: "/dashboard/support", icon: "💬" },
    { name: "Profile", href: "/dashboard/profile", icon: "⚙️" },
  ];

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "ST";
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      <AutoLogout timeoutMinutes={15} />
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Collapsible Sidebar */}
      <aside 
        className={`fixed md:relative z-30 h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isSidebarOpen ? "w-64" : "w-0"
        }`}
      >
        <div className="w-64 flex flex-col h-full">
          <div className="p-6 flex justify-between items-center border-b border-slate-50">
            <h1 className="text-2xl font-black text-blue-600 tracking-tight">Menu</h1>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"
            >
              ✕
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    isActive 
                      ? "bg-blue-50 text-blue-700 shadow-sm" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className={isActive ? "opacity-100" : "opacity-70"}>{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-200">
            <button 
              onClick={handleSignOut}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors text-sm font-bold flex items-center justify-center gap-2"
            >
              <span>🚪</span> Sign Out
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 bg-slate-50">
        
        {/* Top Navigation Bar with Branding */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex justify-between items-center shrink-0 z-10">
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-colors shadow-sm"
              aria-label="Toggle Sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* GnOvaTech & GuruCool Branding */}
            <div className="flex items-center gap-3 md:gap-4 border-l border-slate-200 pl-4 md:pl-6">
              <div className="flex -space-x-3">
                <img src="/image_c1607e.jpg" alt="GnOvaTech" className="w-10 h-10 md:w-11 md:h-11 rounded-full border-2 border-white shadow-md object-cover relative z-10" />
                <img src="/image_c16028.jpg" alt="GuruCool" className="w-10 h-10 md:w-11 md:h-11 rounded-full border-2 border-white shadow-md object-cover relative z-20" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-black text-blue-700 leading-none tracking-tight mb-0.5">GuruCool.</span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase leading-none">by GnOvaTech</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-slate-500 font-medium text-sm hidden lg:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>

            
          <Link href="/dashboard/forum" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
            <span>Course Hubs</span>
          </Link>
          <Link 
              href="/dashboard/profile" 
              className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-4 rounded-full border border-slate-100 transition-all shadow-sm hover:shadow group"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold tracking-wider shadow-inner group-hover:bg-blue-700 transition-colors">
                {user ? getInitials(user.name) : "..."}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-bold text-slate-900 leading-none mb-1">
                  {user ? user.name : "Loading..."}
                </div>
                <div className="text-xs text-slate-500 font-medium leading-none">
                  {user ? user.role : "Student"}
                </div>
              </div>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
