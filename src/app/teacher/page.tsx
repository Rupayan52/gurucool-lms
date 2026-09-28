import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeacherDashboard() {
  const session = await verifyServerAuth();
  if (!session) redirect("/login");

  // ONLY fetch students mathematically assigned to THIS teacher via SubjectCohorts
  const students = await prisma.user.findMany({ 
    where: { 
      role: "STUDENT",
      studentCohorts: { some: { teacherId: session.userId } }
    }, 
    orderBy: { createdAt: 'desc' } 
  });
  
  const doubts = await prisma.doubtTicket.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } });
  const openDoubts = doubts.filter(d => d.status === "OPEN");

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900">Faculty Resolution Center</h1>
        <p className="text-slate-500 text-lg mt-2 font-medium">Manage your enrolled cohorts and clear pending doubts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Action Required <span className="bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-sm">{openDoubts.length} Pending</span>
          </h2>
          {openDoubts.length === 0 ? (
             <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center shadow-sm">
               <div className="text-4xl mb-4">🎉</div><h3 className="font-bold text-slate-900 text-lg">Inbox Zero!</h3><p className="text-slate-500">All student doubts have been resolved.</p>
             </div>
          ) : openDoubts.map(doubt => (
            <div key={doubt.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <Link href={`/teacher/student/${doubt.user.id}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black">{doubt.user.name.charAt(0)}</div>
                  <div><h4 className="font-bold text-slate-900 leading-tight">{doubt.user.name}</h4><span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{doubt.subject}</span></div>
                </Link>
              </div>
              <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 font-medium">"{doubt.question}"</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">My Enrolled Scholars <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{students.length}</span></h2>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {students.length === 0 ? (
               <div className="p-6 text-center text-sm text-slate-500 font-medium">No scholars are currently enrolled in your batches.</div>
            ) : students.map((student, i) => (
              <Link href={`/teacher/student/${student.id}`} key={student.id} className={`p-4 flex items-center justify-between group hover:bg-blue-50 transition-all cursor-pointer ${i !== students.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">{student.name.charAt(0)}</div>
                  <div><div className="font-bold text-slate-900 text-sm">{student.name}</div><div className="text-xs text-slate-500">{student.email}</div></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
