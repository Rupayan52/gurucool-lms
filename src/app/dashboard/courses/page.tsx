import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const classes = await prisma.courseClass.findMany({
    include: {
      subjects: {
        include: {
          chapters: {
            include: { lessons: true }
          }
        }
      }
    }
  });

  return (
    <div className="max-w-6xl animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Courses</h1>
        <p className="mt-2 text-slate-500">Access your enrolled subjects and learning materials.</p>
      </header>

      <div className="space-y-12">
        {classes.map(courseClass => (
          <div key={courseClass.id} className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 border-b border-slate-200 pb-2">{courseClass.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseClass.subjects.map(subject => (
                <div key={subject.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4">📚</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{subject.name}</h3>
                  <div className="text-sm text-slate-500 mb-6">{subject.chapters.length} Chapters structured for you.</div>
                  <div className="space-y-2">
                    {subject.chapters.map(chapter => (
                      <div key={chapter.id} className="text-sm">
                        <div className="font-bold text-slate-700 mb-1">{chapter.name}</div>
                        <ul className="pl-4 space-y-1 border-l-2 border-slate-100 mt-1">
                          {chapter.lessons.map(lesson => (
                            <li key={lesson.id} className="py-0.5">
                              <Link href={`/dashboard/courses/${courseClass.id}/lesson/${lesson.id}`} className="text-blue-600 hover:underline">
                                {lesson.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
