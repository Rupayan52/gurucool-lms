"use client";
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

  // Fetch the logged-in user's details for the profile icon
  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.name) setUser({ name: data.name, role: data.role });
      })
      .catch((err) => console.error("Failed to load profile", err));
  }, []);

  const handleSignOut = async () => {
    // Clear the cookie by setting it to expire in the past, then redirect
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: "🏠" },
    { name: "My Courses", href: "/dashboard/courses", icon: "📚" },
    { name: "Assessments & Quizzes", href: "/dashboard/assessments", icon: "📝" },
    { name: "Doubt Support", href: "/dashboard/support", icon: "💬" },
    { name: "Profile", href: "/dashboard/profile", icon: "⚙️" },
  ];

  // Helper to get initials (e.g., "Rupayan Bandyopadhyay" -> "RU")
  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "ST";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col z-20">
        <div className="p-6">
          <h1 className="text-2xl font-black text-blue-600 tracking-tight">GuruCool.</h1>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
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
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navigation Bar with Profile Widget */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0 z-10">
          <div className="text-slate-500 font-medium text-sm hidden md:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>

          {/* Interactive Profile Icon */}
          <Link 
            href="/dashboard/profile" 
            className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-4 rounded-full border border-slate-100 transition-all shadow-sm hover:shadow group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold tracking-wider shadow-inner group-hover:bg-blue-700 transition-colors">
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
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
