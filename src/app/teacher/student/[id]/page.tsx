import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StudentDossier(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  const student = await prisma.user.findUnique({
    where: { id: params.id, role: "STUDENT" },
    include: { doubtTickets: { orderBy: { createdAt: 'desc' } } }
  });

  if (!student) notFound();

  const openDoubts = student.doubtTickets.filter(d => d.status === "OPEN").length;
  const resolvedDoubts = student.doubtTickets.filter(d => d.status === "RESOLVED").length;

  return (
    <div className="p-10 max-w-5xl mx-auto animate-in fade-in duration-500">
      <Link href="/teacher" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Resolution Center
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-4xl font-black shadow-inner shadow-slate-700/50">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-slate-900">{student.name}</h1>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold font-mono border border-slate-200">{student.email}</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold border border-slate-200">
                Joined: {new Date(student.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
           <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Queries</div>
           <div className="text-4xl font-black text-slate-900">{student.doubtTickets.length}</div>
        </div>
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 shadow-sm flex flex-col justify-center">
           <div className="text-xs font-black text-amber-700 uppercase tracking-widest mb-1">Needs Resolution</div>
           <div className="text-4xl font-black text-amber-600">{openDoubts}</div>
        </div>
        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-200 shadow-sm flex flex-col justify-center">
           <div className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-1">Resolved</div>
           <div className="text-4xl font-black text-emerald-600">{resolvedDoubts}</div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-6">Historical Interaction Log</h2>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {student.doubtTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">This scholar has not submitted any doubts yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {student.doubtTickets.map(ticket => (
              <div key={ticket.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{ticket.subject}</span>
                  <span className="text-xs text-slate-400 font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-900 font-medium mb-3">"{ticket.question}"</p>
                {ticket.status === "RESOLVED" ? (
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm font-medium border border-emerald-100">
                    <span className="font-black uppercase tracking-widest text-[10px] text-emerald-600 block mb-1">Faculty Response</span>
                    {ticket.answer}
                  </div>
                ) : (
                  <span className="inline-flex px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    Awaiting Response
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
