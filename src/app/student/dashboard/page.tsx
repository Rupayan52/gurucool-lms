"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentLearningPlayerCenter() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [queueModules, setQueueModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("ALL");
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [activeTopic, setActiveTopic] = useState<any | null>(null);

  useEffect(() => {
    fetchPlayerState();
    const interval = setInterval(fetchPlayerState, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchPlayerState = async () => {
    try {
      const res = await fetch("/api/live-classes?role=student");
      if (res.ok) {
        const data = await res.json();
        const sessionList = data.sessions || [];
        setCohorts(data.enrolledCohorts || []);
        setSessions(sessionList);
        setQueueModules(data.learningQueueModules || []);

        // Automatically spotlight an active LIVE broadcast or the next SCHEDULED broadcast
        if (!activeSession && !activeTopic && sessionList.length > 0) {
          const liveNow = sessionList.find((s: any) => s.status === "LIVE");
          const nextScheduled = sessionList.find((s: any) => s.status === "SCHEDULED");
          setActiveSession(liveNow || nextScheduled || sessionList[0]);
        } else if (activeSession) {
          const refreshed = sessionList.find((s: any) => s.id === activeSession.id);
          if (refreshed) setActiveSession(refreshed);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinBroadcast = async (sessionToJoin?: any) => {
    const target =
      sessionToJoin ||
      activeSession ||
      sessions.find(s => s.status === "LIVE") ||
      sessions.find(s => s.status === "SCHEDULED");

    if (target) {
      // Open FFMUC Live Room in a NEW TAB immediately so popup blockers never interfere
      window.open(target.streamUrl, "_blank", "noopener,noreferrer");

      await fetch("/api/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "JOIN_SESSION", sessionId: target.id })
      });
      await fetchPlayerState();
    } else if (cohorts.length > 0) {
      // Fallback: Open the student's subject-specific room in a new tab
      const activeSub =
        cohorts.find(c => c.subjectId === selectedSubjectId) || cohorts[0];
      const cleanName = activeSub.subjectName.replace(/[^a-zA-Z0-9]/g, "");
      const fallbackUrl = `https://meet.ffmuc.net/GuruCool_Subject_${cleanName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true`;
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("Please enroll in a subject via the Course Catalog first.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="w-9 h-9 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredSessions = sessions.filter(s =>
    selectedSubjectId === "ALL" ? true : s.subjectId === selectedSubjectId
  );
  const filteredModules = queueModules.filter(m =>
    selectedSubjectId === "ALL" ? true : m.subjectId === selectedSubjectId
  );

  const liveSessions = filteredSessions.filter(s => s.status === "LIVE");
  const scheduledSessions = filteredSessions.filter(s => s.status === "SCHEDULED");

  // Unique subjects from enrolled cohorts
  const uniqueSubjects = Array.from(
    new Map(cohorts.map(c => [c.subjectId, c])).values()
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* TOP BAR MATCHING SCREENSHOT 2 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-indigo-400">
            PHYGITAL CLASSROOM • FFMUC STREAM ENGINE
          </p>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-3xl font-black text-white tracking-tight">
              My Learning Player
            </h1>
            {liveSessions.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                {liveSessions.length} Live Broadcast Active
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-[#1C1C24] hover:bg-[#252530] border border-white/10 text-slate-200 font-bold text-xs transition-all"
          >
            ← Back to AI Insights
          </Link>
          <button
            onClick={() => handleJoinBroadcast()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all"
          >
            POP-OUT LIVE STREAM ↗
          </button>
        </div>
      </div>

      {/* SUBJECT-SPECIFIC FILTER BAR */}
      {uniqueSubjects.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap bg-[#1C1C24] p-2.5 rounded-2xl border border-white/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">
            Filter by Enrolled Subject:
          </span>
          <button
            onClick={() => setSelectedSubjectId("ALL")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedSubjectId === "ALL"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            All Enrolled Subjects
          </button>
          {uniqueSubjects.map((sub: any) => (
            <button
              key={sub.subjectId}
              onClick={() => {
                setSelectedSubjectId(sub.subjectId);
                const subLive = sessions.find(
                  s => s.subjectId === sub.subjectId && s.status === "LIVE"
                );
                const subSched = sessions.find(
                  s => s.subjectId === sub.subjectId && s.status === "SCHEDULED"
                );
                if (subLive || subSched) {
                  setActiveTopic(null);
                  setActiveSession(subLive || subSched);
                }
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSubjectId === sub.subjectId
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {sub.subjectName} (Prof. {sub.teacherName})
            </button>
          ))}
        </div>
      )}

      {/* MAIN 12-COLUMN PLAYER & ACTIVE LEARNING QUEUE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT 8 COLUMNS: PRIMARY BROADCAST & VOD STAGE */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-black rounded-[32px] border border-white/10 p-8 sm:p-12 min-h-[460px] flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-black pointer-events-none" />

            {activeTopic ? (
              /* SELECTED CURRICULUM TOPIC VIEW */
              <div className="relative z-10 max-w-xl space-y-5">
                <div className="flex items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase">
                    {activeTopic.subjectName} • {activeTopic.contentType}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {activeTopic.title}
                </h2>
                {activeTopic.bodyText && (
                  <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/10 text-left max-h-56 overflow-y-auto">
                    {activeTopic.bodyText}
                  </p>
                )}
                <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
                  {activeTopic.fileUrl && (
                    <a
                      href={activeTopic.fileUrl}
                      download={activeTopic.fileName || "lecture-material"}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg"
                    >
                      Open / Download Material ({activeTopic.fileName || activeTopic.contentType}) ↗
                    </a>
                  )}
                  <button
                    onClick={() => setActiveTopic(null)}
                    className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider"
                  >
                    Return to Live Broadcast Stage
                  </button>
                </div>
              </div>
            ) : activeSession ? (
              /* SELECTED OR ACTIVE LIVE CLASS BROADCAST STAGE */
              <div className="relative z-10 max-w-xl space-y-5">
                <button
                  onClick={() => handleJoinBroadcast(activeSession)}
                  className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-transform hover:scale-105 shadow-2xl ${
                    activeSession.status === "LIVE"
                      ? "bg-rose-600 text-white shadow-rose-600/40"
                      : "bg-indigo-600/30 border border-indigo-500/40 text-indigo-300"
                  }`}
                >
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {activeSession.status === "LIVE" ? (
                    <span className="px-3.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      LIVE BROADCAST ON AIR
                    </span>
                  ) : activeSession.status === "SCHEDULED" ? (
                    <span className="px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                      SCHEDULED • {new Date(activeSession.scheduledAt).toLocaleString()}
                    </span>
                  ) : (
                    <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-widest">
                      COMPLETED SESSION
                    </span>
                  )}

                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase">
                    {activeSession.subjectName} • Prof. {activeSession.teacherName}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {activeSession.title}
                </h2>

                {activeSession.moduleTitle && (
                  <p className="text-xs font-bold text-indigo-400">
                    Curriculum Module: {activeSession.moduleTitle}
                  </p>
                )}

                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  {activeSession.agenda ||
                    "Click 'Join Active Broadcast' below to launch the subject-specific FFMUC video classroom in a new browser tab."}
                </p>

                <div className="flex items-center justify-center gap-4 pt-3 flex-wrap">
                  <button
                    onClick={() => handleJoinBroadcast(activeSession)}
                    className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    JOIN ACTIVE BROADCAST ↗
                  </button>
                  <Link
                    href="/dashboard/curriculum"
                    className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    OPEN SUBJECT SYLLABUS
                  </Link>
                </div>
              </div>
            ) : (
              /* DEFAULT READY STATE WHEN NO SESSION IS SCHEDULED YET */
              <div className="relative z-10 max-w-md space-y-5">
                <button
                  onClick={() => handleJoinBroadcast()}
                  className="w-16 h-16 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center hover:scale-105 transition-all"
                >
                  <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Ready for Live Broadcast or Recorded VOD
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select an enrolled module from the Active Learning Queue on the right or join your subject's active faculty broadcast room in a new tab.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                  <button
                    onClick={() => handleJoinBroadcast()}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30"
                  >
                    JOIN ACTIVE BROADCAST
                  </button>
                  <Link
                    href="/dashboard/catalog"
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider"
                  >
                    BROWSE COURSE CATALOG
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* SUBJECT-SPECIFIC LIVE & SCHEDULED SESSIONS LIST */}
          <div className="bg-[#1C1C24] rounded-[28px] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">
                Course-Specific Live Classes ({filteredSessions.length})
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                Opens in New Tab • Auto-Logs Attendance
              </span>
            </div>

            {filteredSessions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">
                No live classes have been scheduled for this subject filter yet. When your faculty schedules or starts a class in their Command Center, it syncs here automatically.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSessions.map(sess => (
                  <div
                    key={sess.id}
                    onClick={() => {
                      setActiveTopic(null);
                      setActiveSession(sess);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      activeSession?.id === sess.id && !activeTopic
                        ? "bg-indigo-600/15 border-indigo-500"
                        : "bg-[#13131A] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase">
                          {sess.subjectName}
                        </span>
                        {sess.status === "LIVE" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase">
                            ● LIVE NOW
                          </span>
                        ) : sess.status === "SCHEDULED" ? (
                          <span className="text-[10px] font-bold text-amber-400">
                            {new Date(sess.scheduledAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400">
                            Completed
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-white">{sess.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Prof. {sess.teacherName} {sess.moduleTitle ? `• ${sess.moduleTitle}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-400">
                        {sess.hasJoined ? "✓ Attendance Logged" : `${sess.durationMinutes} mins`}
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleJoinBroadcast(sess);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px]"
                      >
                        Launch Tab ↗
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 4 COLUMNS: ACTIVE LEARNING QUEUE (SYNCED WITH ENROLLED COURSES) */}
        <div className="lg:col-span-4">
          <div className="bg-[#1C1C24] rounded-[32px] border border-white/10 p-6 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-white">Active Learning Queue</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Your real-time live broadcasts and subject modules synced directly with your enrolled courses.
                </p>
              </div>

              {cohorts.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#13131A] border border-white/5 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-400">
                    No enrolled courses queued yet.
                  </p>
                  <Link
                    href="/dashboard/catalog"
                    className="inline-block text-xs font-bold text-indigo-400 hover:underline"
                  >
                    Enroll via Course Catalog →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                  {/* Queued Live & Scheduled Classes */}
                  {liveSessions.concat(scheduledSessions).map(sess => (
                    <div
                      key={sess.id}
                      onClick={() => {
                        setActiveTopic(null);
                        setActiveSession(sess);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        activeSession?.id === sess.id && !activeTopic
                          ? "bg-indigo-600/20 border-indigo-500"
                          : "bg-[#13131A] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase text-indigo-400">
                          {sess.subjectName} • Prof. {sess.teacherName}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            sess.status === "LIVE"
                              ? "bg-rose-500 text-white"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {sess.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white">{sess.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(sess.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                  ))}

                  {/* Enrolled Curriculum Modules & Topics */}
                  {filteredModules.length === 0 &&
                  liveSessions.length === 0 &&
                  scheduledSessions.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-[#13131A] border border-white/5 text-center space-y-2">
                      <p className="text-xs font-bold text-slate-400">
                        No VOD modules or live classes published for this subject yet.
                      </p>
                      <Link
                        href="/dashboard/curriculum"
                        className="inline-block text-xs font-bold text-indigo-400 hover:underline"
                      >
                        Check Subject Curriculum →
                      </Link>
                    </div>
                  ) : (
                    filteredModules.map(mod => (
                      <div
                        key={mod.id}
                        className="p-4 rounded-2xl bg-[#13131A] border border-white/10 space-y-2.5"
                      >
                        <div>
                          <span className="text-[10px] font-black uppercase text-emerald-400">
                            {mod.subjectName} • Prof. {mod.teacherName}
                          </span>
                          <h4 className="text-xs font-black text-white mt-0.5">
                            {mod.title}
                          </h4>
                        </div>

                        {mod.topics?.length === 0 ? (
                          <p className="text-[11px] text-slate-500 italic">
                            No topic files uploaded yet.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {mod.topics.map((t: any) => (
                              <button
                                key={t.id}
                                onClick={() =>
                                  setActiveTopic({
                                    ...t,
                                    subjectName: mod.subjectName
                                  })
                                }
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                                  activeTopic?.id === t.id
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                                }`}
                              >
                                <span className="truncate">{t.title}</span>
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black/30 shrink-0 ml-2">
                                  {t.contentType}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link
              href="/dashboard/forum"
              className="w-full py-3.5 rounded-2xl bg-[#252532] hover:bg-[#2E2E3E] border border-white/10 text-center text-xs font-bold text-indigo-300 transition-all"
            >
              Ask a Doubt in Course Hubs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
