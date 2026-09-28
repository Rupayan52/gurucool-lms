"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";

export default function EnterpriseCinematicPlayer() {
  const { subjectId } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [liveToken, setLiveToken] = useState("");

  useEffect(() => {
    fetch(`/api/student/learn?subjectId=${subjectId}`).then(r => r.json()).then(d => {
      setData(d);
      if (d.lessons?.length > 0) setActiveLesson(d.lessons[0]);
    });
  }, [subjectId]);

  useEffect(() => {
    // If the selected lesson is a Native WebRTC broadcast, fetch the view-only token
    if (activeLesson?.broadcastType === "NATIVE_WEBRTC") {
      fetch(`/api/livekit?room=${activeLesson.id}`)
        .then(r => r.json())
        .then(d => { if (!d.error) setLiveToken(d.token); });
    } else {
      setLiveToken("");
    }
  }, [activeLesson]);

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-white animate-pulse font-bold tracking-widest uppercase text-sm">Decrypting Enterprise Media...</div>;

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-950 text-white overflow-hidden -m-8">
      <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto shrink-0 z-10">
        <div className="p-6 border-b border-slate-800">
          <button onClick={() => router.push("/dashboard/learn")} className="text-xs text-slate-400 font-bold uppercase tracking-widest hover:text-white mb-4 flex items-center gap-2">← Exit Player</button>
          <h2 className="text-xl font-black">{data.subject?.name}</h2>
        </div>
        <div className="flex-1 p-4 space-y-6">
          {data.chapters?.map((chapter: any, idx: number) => {
            const chapterLessons = data.lessons?.filter((l: any) => l.chapterId === chapter.id) || [];
            return (
              <div key={chapter.id}>
                <h3 className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Chapter {idx + 1}: {chapter.name}</h3>
                <div className="space-y-2">
                  {chapterLessons.map((lesson: any) => (
                    <button key={lesson.id} onClick={() => setActiveLesson(lesson)} className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 ${activeLesson?.id === lesson.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm truncate pr-2">{lesson.title}</span>
                        {lesson.broadcastType === "NATIVE_WEBRTC" && <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded font-black uppercase shadow-[0_0_8px_rgba(239,68,68,0.6)]">Live</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full bg-black relative">
        <div className="w-full aspect-video bg-slate-950 flex items-center justify-center relative border-b border-slate-800">
          
          {/* WEBRTC SFU RENDERER */}
          {activeLesson?.broadcastType === "NATIVE_WEBRTC" ? (
            liveToken && process.env.NEXT_PUBLIC_LIVEKIT_URL ? (
              <LiveKitRoom video={false} audio={false} token={liveToken} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} data-lk-theme="default" style={{ height: '100%', width: '100%' }}>
                <VideoConference />
                <RoomAudioRenderer />
              </LiveKitRoom>
            ) : (
              <div className="text-slate-500 font-bold animate-pulse text-sm uppercase tracking-widest">Awaiting LiveKit Transmission Tokens...</div>
            )
          ) : (
            /* STANDARD VOD RENDERER */
            activeLesson?.videoUrl ? (
              <iframe src={activeLesson.videoUrl} className="w-full h-full absolute inset-0" allowFullScreen allow="autoplay; fullscreen; picture-in-picture"></iframe>
            ) : (
              <div className="text-slate-600 font-bold flex flex-col items-center gap-4">
                <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                <span>No media attached to this lesson yet.</span>
              </div>
            )
          )}
        </div>
        
        {activeLesson && (
          <div className="p-8 max-w-4xl overflow-y-auto">
            <h1 className="text-3xl font-black mb-2">{activeLesson.title}</h1>
            <p className="text-slate-400 font-medium mb-6">Cinematic 1080p Engine Active.</p>
            {activeLesson.pdfUrl && (
              <a href={activeLesson.pdfUrl} target="_blank" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                Download Handout
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
