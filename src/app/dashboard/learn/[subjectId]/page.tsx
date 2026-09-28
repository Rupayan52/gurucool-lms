"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CinematicPlayer() {
  const { subjectId } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/student/learn?subjectId=${subjectId}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        if (d.lessons?.length > 0) setActiveLesson(d.lessons[0]);
      });
  }, [subjectId]);

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-white animate-pulse">Decrypting Media Stream...</div>;

  const currentMediaUrl = activeLesson?.isLive ? activeLesson.liveUrl : activeLesson?.videoUrl;

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-950 text-white overflow-hidden -m-8">
      {/* 1. Left Sidebar: Curriculum Navigation */}
      <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto shrink-0">
        <div className="p-6 border-b border-slate-800">
          <button onClick={() => router.push("/dashboard/learn")} className="text-xs text-slate-400 font-bold uppercase tracking-widest hover:text-white mb-4 flex items-center gap-2">← Back to Dashboard</button>
          <h2 className="text-2xl font-black">{data.subject?.name}</h2>
        </div>
        <div className="flex-1 p-4 space-y-6">
          {data.chapters?.map((chapter: any, idx: number) => {
            const chapterLessons = data.lessons?.filter((l: any) => l.chapterId === chapter.id) || [];
            return (
              <div key={chapter.id}>
                <h3 className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Chapter {idx + 1}: {chapter.name}</h3>
                <div className="space-y-2">
                  {chapterLessons.map((lesson: any) => (
                    <button 
                      key={lesson.id} 
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 ${activeLesson?.id === lesson.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{lesson.title}</span>
                        {lesson.isLive && <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded font-black uppercase animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]">Live</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main Player Area */}
      <div className="flex-1 flex flex-col h-full bg-black relative">
        <div className="w-full aspect-video bg-slate-950 flex items-center justify-center relative border-b border-slate-800">
          {activeLesson ? (
            currentMediaUrl ? (
              <iframe src={currentMediaUrl} className="w-full h-full absolute inset-0" allowFullScreen allow="autoplay; fullscreen; picture-in-picture"></iframe>
            ) : (
              <div className="text-slate-600 font-bold flex flex-col items-center gap-4">
                <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                <span>No media attached to this lesson yet.</span>
              </div>
            )
          ) : (
             <div className="text-slate-500 font-bold">Select a lesson to begin.</div>
          )}
          {activeLesson?.isLive && <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1.5 text-xs font-black tracking-widest uppercase rounded-lg shadow-lg flex items-center gap-2 animate-pulse"><div className="w-2 h-2 bg-white rounded-full"></div> LIVE BROADCAST</div>}
        </div>
        
        {activeLesson && (
          <div className="p-8 max-w-4xl">
            <h1 className="text-3xl font-black mb-2">{activeLesson.title}</h1>
            <p className="text-slate-400 font-medium mb-6">Explore the materials below or join the Course Hub to discuss this topic.</p>
            {activeLesson.pdfUrl && (
              <a href={activeLesson.pdfUrl} target="_blank" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Download PDF Handout
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
