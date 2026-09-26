import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function LessonViewer({ params }: { params: { lessonId: string } }) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: { chapter: { include: { subject: true } } }
  });

  if (!lesson) notFound();

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6">
        <Link href="/dashboard/courses" className="text-sm text-blue-600 font-semibold hover:underline">← Back to Courses</Link>
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>{lesson.chapter.subject.name}</span>
          <span>•</span>
          <span>{lesson.chapter.name}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2">{lesson.title}</h1>
      </div>

      <div className="bg-slate-900 rounded-2xl aspect-video w-full flex items-center justify-center shadow-xl border border-slate-800 mb-8 overflow-hidden relative">
        {lesson.videoUrl ? (
          <div className="text-center">
             <div className="text-6xl mb-4">▶️</div>
             <p className="text-slate-400 font-medium">Video Player Placeholder</p>
             <p className="text-xs text-slate-500 mt-2">Source: {lesson.videoUrl}</p>
          </div>
        ) : (
          <p className="text-slate-400 font-medium">No video content for this lesson.</p>
        )}
      </div>

      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900">Study Materials</h3>
          <p className="text-sm text-slate-500">Download the PDF notes for offline studying.</p>
        </div>
        <button 
          disabled={!lesson.pdfUrl}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${
            lesson.pdfUrl ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-slate-50 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>📄</span> {lesson.pdfUrl ? "Download PDF" : "No PDF Attached"}
        </button>
      </div>
    </div>
  );
}
