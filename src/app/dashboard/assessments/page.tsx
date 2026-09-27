import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AssessmentsList() {
  const quizzes = await prisma.quiz.findMany({
    include: { chapter: { include: { subject: true } } }
  });

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assessments & Quizzes</h1>
        <p className="mt-2 text-slate-500">Test your knowledge on completed chapters.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">No assessments available right now.</div>
        ) : quizzes.map(quiz => (
          <Link key={quiz.id} href={`/dashboard/assessments/${quiz.id}`} className="group block bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition-all">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">{quiz.chapter.subject.name}</div>
            <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">{quiz.title}</h3>
            <div className="text-sm text-slate-500">{quiz.chapter.name}</div>
            <div className="mt-4 inline-flex items-center text-sm font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
              Start Assessment →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
