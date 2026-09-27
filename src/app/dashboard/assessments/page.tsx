import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Dynamic color generator based on subject matter
const getSubjectStyles = (subjectName: string) => {
  const name = subjectName.toLowerCase();
  if (name.includes('bio')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (name.includes('phy') || name.includes('sci')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (name.includes('chem')) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (name.includes('math')) return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

export default async function AssessmentsList() {
  const quizzes = await prisma.quiz.findMany({
    include: { chapter: { include: { subject: true } } }
  });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Assessments</h1>
          <p className="text-slate-500 font-medium text-lg">Evaluate your mastery of completed modules.</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-0.5">Total Available</span>
            <span className="text-2xl font-black text-slate-900 leading-none">{quizzes.length}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {quizzes.length === 0 ? (
          <div className="col-span-full p-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
            <div className="text-5xl mb-4 opacity-50">📭</div>
            <h3 className="text-xl font-bold text-slate-700">No assessments unlocked</h3>
            <p className="mt-2">Check back after completing more video lectures.</p>
          </div>
        ) : quizzes.map(quiz => {
          const questions = quiz.questions as any[];
          const questionCount = questions?.length || 0;
          const estimatedTime = questionCount * 2;
          const subjectColor = getSubjectStyles(quiz.chapter.subject.name);

          return (
            <Link key={quiz.id} href={`/dashboard/assessments/${quiz.id}`} className="group relative bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer">
              
              {/* Top Accent Bar */}
              <div className="h-2 w-full bg-gradient-to-r from-slate-800 to-slate-600 group-hover:from-blue-600 group-hover:to-cyan-500 transition-all duration-500"></div>
              
              <div className="p-8 flex flex-col h-full relative bg-white">
                {/* Header Metrics */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border ${subjectColor}`}>
                    {quiz.chapter.subject.name}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold border border-slate-200 shadow-sm">
                    {questionCount} Questions
                  </span>
                </div>

                {/* Core Content */}
                <div className="relative z-10 flex-grow">
                  <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Module</span>
                    {quiz.chapter.name}
                  </p>
                </div>

                {/* Action Footer */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Est. Time</span>
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      ~{estimatedTime} mins
                    </span>
                  </div>
                  <div className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold group-hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md">
                    Begin <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
