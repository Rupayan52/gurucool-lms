import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AssessmentsList() {
  const quizzes = await prisma.quiz.findMany({
    include: { chapter: { include: { subject: true } } }
  });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assessments & Quizzes</h1>
          <p className="mt-2 text-slate-500 font-medium">Evaluate your mastery of completed modules.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Available</span>
              <span className="text-xl font-black text-slate-900">{quizzes.length}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-bold text-slate-900">No assessments yet</h3>
            <p>Check back after completing more chapters.</p>
          </div>
        ) : quizzes.map(quiz => {
          // Dynamically extract the question count from the JSON payload
          const questions = quiz.questions as any[];
          const questionCount = questions?.length || 0;
          const estimatedTime = questionCount * 2; // Estimate: 2 mins per question

          return (
            <Link key={quiz.id} href={`/dashboard/assessments/${quiz.id}`} className="group relative bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col h-full overflow-hidden">
              
              {/* Decorative background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full -z-10 opacity-60 group-hover:scale-110 transition-transform"></div>

              <div className="flex justify-between items-start mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  {quiz.chapter.subject.name}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                  {questionCount} Qs
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {quiz.title}
              </h3>
              
              <p className="text-sm text-slate-500 font-medium mb-8 flex-grow flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span className="truncate">{quiz.chapter.name}</span>
              </p>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  ~{estimatedTime} mins
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                  Start <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
