"use client";

import { useEffect, useState } from "react";

// Define TypeScript interfaces for our nested data
type Lesson = { id: string; title: string; orderIndex: number };
type Chapter = { id: string; name: string; lessons: Lesson[] };
type Subject = { id: string; name: string; chapters: Chapter[] };
type CourseClass = { id: string; name: string; subjects: Subject[] };

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      // First, trigger the seed endpoint just in case the DB is empty
      await fetch("/api/seed", { method: "POST" });
      
      // Then fetch the actual curriculum data
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-500 animate-pulse font-medium">Loading curriculum...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Curriculum</h1>
        <p className="mt-2 text-gray-500">Access your chapter-wise digital study resources.</p>
      </header>

      <div className="space-y-8">
        {courses.map((courseClass) => (
          <div key={courseClass.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-black text-slate-800">{courseClass.name}</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {courseClass.subjects.map((subject) => (
                <div key={subject.id} className="space-y-4">
                  <h3 className="text-lg font-bold text-blue-600 border-b-2 border-blue-100 pb-2 inline-block">
                    {subject.name}
                  </h3>
                  
                  <div className="grid gap-4">
                    {subject.chapters.map((chapter) => (
                      <div key={chapter.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-3">{chapter.name}</h4>
                        <ul className="space-y-2">
                          {chapter.lessons.map((lesson) => (
                            <li key={lesson.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:border-blue-300 transition-colors cursor-pointer group">
                              <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 text-blue-700 font-bold rounded-md w-8 h-8 flex items-center justify-center text-sm">
                                  {lesson.orderIndex}
                                </div>
                                <span className="font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                                  {lesson.title}
                                </span>
                              </div>
                              <button className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                Start
                              </button>
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
