import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-black text-blue-600 tracking-tight">GuruCool.</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0">
          <Link href="/dashboard" className="block px-4 py-3 rounded-lg bg-blue-50 text-blue-700 font-semibold transition-colors">
            Dashboard
          </Link>
          <Link href="/dashboard/courses" className="block px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors">
            My Courses
          </Link>
          <Link href="/dashboard/assessments" className="block px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors">
            Assessments & Quizzes
          </Link>
          <Link href="/dashboard/support" className="block px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors">
            Doubt Support
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 mt-auto">
          <Link href="/login" className="flex w-full justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
