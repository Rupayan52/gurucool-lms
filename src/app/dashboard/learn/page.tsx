"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MyLearning() {
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => { fetch("/api/student/learn").then(r => r.json()).then(setSubjects); }, []);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Learning</h1>
        <p className="mt-2 text-slate-500 font-medium text-lg">Continue your enrolled courses and active live streams.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.length === 0 ? (
          <div className="col-span-full p-10 bg-white rounded-3xl border border-slate-200 text-center font-bold text-slate-500">You are not enrolled in any cohorts. Visit the Course Catalog to start a Free Trial.</div>
        ) : subjects.map(subject => (
          <Link href={`/dashboard/learn/${subject.id}`} key={subject.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col group hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{subject.name}</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Enter Cinematic Player →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
