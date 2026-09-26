"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    router.push("/login");
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Courses", href: "/dashboard/courses" },
    { name: "Assessments & Quizzes", href: "/dashboard/assessments" },
    { name: "Doubt Support", href: "/dashboard/support" },
    { name: "Profile", href: "/dashboard/profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col">
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
                className={`block px-4 py-3 rounded-xl transition-colors font-medium ${
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleSignOut}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
