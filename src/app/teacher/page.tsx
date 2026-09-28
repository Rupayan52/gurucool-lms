import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TeacherDashboard() {
  const students = await prisma.user.findMany({ where: { role: "STUDENT" }, orderBy: { createdAt: 'desc' } });
  const doubts = await prisma.doubtTicket.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } });
  const openDoubts = doubts.filter(d => d.status === "OPEN");

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900">Faculty Resolution Center</h1>
        <p className="text-slate-500 text-lg mt-2 font-medium">Manage your students and clear pending doubts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                <Link href={`/teacher/student/${doubt.user.id}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {doubt.user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{doubt.user.name}</h4>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{doubt.subject}</span>
                  </div>
                </Link>
                <span className="text-xs text-slate-400 font-medium">{new Date(doubt.createdAt).toLocaleDateString()}</span>
              </div>
              
              <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 font-medium">
                "{doubt.question}"
              </p>

              <form action="/api/teacher/doubts" method="POST" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const answer = (form.elements.namedItem('answer') as HTMLInputElement).value;
                await fetch('/api/teacher/doubts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticketId: doubt.id, answer }) });
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

        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Registered Scholars</h2>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {students.map((student, i) => (
              <Link href={`/teacher/student/${student.id}`} key={student.id} className={`p-4 flex items-center justify-between group hover:bg-blue-50 transition-all cursor-pointer ${i !== students.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{student.name}</div>
                    <div className="text-xs text-slate-500">{student.email}</div>
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
