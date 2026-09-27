import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TeacherDashboard() {
  // Fetch all students and all doubts
  const students = await prisma.user.findMany({ where: { role: "STUDENT" } });
  const doubts = await prisma.doubtTicket.findMany({ 
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  const openDoubts = doubts.filter(d => d.status === "OPEN");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Teacher Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 shadow-2xl z-10">
        <div className="text-2xl font-black tracking-tighter mb-12 flex items-center gap-2">
          <span className="text-blue-500">Guru</span>Cool.
          <span className="bg-blue-600 text-[10px] px-2 py-1 rounded uppercase tracking-widest">Faculty</span>
        </div>
        <div className="flex-grow">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Management</div>
          <div className="space-y-2">
             <div className="bg-slate-800 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-between">
                Doubts Desk <span className="bg-blue-500 px-2 py-0.5 rounded-md text-xs">{openDoubts.length}</span>
             </div>
             <Link href="/admin/content" className="block text-slate-400 hover:text-white px-4 py-3 rounded-xl transition-colors font-semibold">Content Manager</Link>
          </div>
        </div>
        <LogoutButton />
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900">Faculty Resolution Center</h1>
          <p className="text-slate-500 text-lg mt-2 font-medium">Manage your students and clear pending doubts.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Doubts Column (Takes up 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Action Required
              <span className="bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-sm">{openDoubts.length} Pending</span>
            </h2>
            
            {openDoubts.length === 0 ? (
               <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center shadow-sm">
                 <div className="text-4xl mb-4">🎉</div>
                 <h3 className="font-bold text-slate-900 text-lg">Inbox Zero!</h3>
                 <p className="text-slate-500">All student doubts have been resolved.</p>
               </div>
            ) : openDoubts.map(doubt => (
              <div key={doubt.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                      {doubt.user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight">{doubt.user.name}</h4>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{doubt.subject}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{new Date(doubt.createdAt).toLocaleDateString()}</span>
                </div>
                
                <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 font-medium">
                  "{doubt.question}"
                </p>

                {/* Client-side form for Teacher Reply */}
                <form action="/api/teacher/doubts" method="POST" onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const answer = (form.elements.namedItem('answer') as HTMLInputElement).value;
                  await fetch('/api/teacher/doubts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ticketId: doubt.id, answer })
                  });
                  window.location.reload();
                }}>
                  <textarea name="answer" required placeholder="Type your expert resolution here..." className="w-full bg-white border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none h-24 mb-3 transition-all"></textarea>
                  <div className="flex justify-end">
                    <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-md">
                      Resolve & Notify Student
                    </button>
                  </div>
                </form>
              </div>
            ))}
          </div>

          {/* Student Roster Column (Takes up 1/3) */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Registered Scholars</h2>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {students.map((student, i) => (
                <div key={student.id} className={`p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors ${i !== students.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                    <div className="text-xs text-slate-500">{student.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
