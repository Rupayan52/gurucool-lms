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
    const interval = setInterval(fetchPlayerState, 6000);
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

        // Prioritize whatever the Teacher has Pinned/Spotlighted or set LIVE
        const teacherPinnedLive = sessionList.find(
          (s: any) => s.isPinned && s.status === "LIVE"
        );
        const anyLive = sessionList.find((s: any) => s.status === "LIVE");
        const teacherPinnedAny = sessionList.find((s: any) => s.isPinned);
        const nextScheduled = sessionList.find((s: any) => s.status === "SCHEDULED");

        const intendedDefault =
          teacherPinnedLive || anyLive || teacherPinnedAny || nextScheduled || sessionList[0] || null;

        setActiveSession((prev: any) => {
          if (!prev) return intendedDefault;
          const updated = sessionList.find((s: any) => s.id === prev.id);
          return updated || intendedDefault;
        });
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

    if (!target) {
      alert("No active or scheduled class selected.");
      return;
    }

    if (target.isRoomLocked) {
      alert(
        `Prof. ${target.teacherName} has locked the room doors until class begins. Please wait for faculty to unlock.`
      );
      return;
    }

    const launchUrl =
      target.status === "COMPLETED" && target.vodUrl ? target.vodUrl : target.streamUrl;

    window.open(launchUrl, "_blank", "noopener,noreferrer");

    await fetch("/api/live-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "JOIN_SESSION", sessionId: target.id })
    });
    await fetchPlayerState();
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
  const uniqueSubjects = Array.from(
    new Map(cohorts.map(c => [c.subjectId, c])).values()
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-indigo-400">
            PHYGITAL CLASSROOM • FACULTY-DIRECTED STREAM ENGINE
          </p>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            My Learning Player
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-[#1C1C24] hover:bg-[#252530] border border-white/10 text-slate-200 font-bold text-xs"
          >
            ← Back to AI Insights
          </Link>
          {activeSession && !activeSession.isRoomLocked && (
            <button
              onClick={() => handleJoinBroadcast(activeSession)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30"
            >
              POP-OUT LIVE STREAM ↗
            </button>
          )}
        </div>
      </div>

      {/* COURSE FILTER BAR */}
      {uniqueSubjects.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap bg-[#1C1C24] p-2.5 rounded-2xl border border-white/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">
            Enrolled Courses:
          </span>
          <button
            onClick={() => setSelectedSubjectId("ALL")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedSubjectId === "ALL"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Courses ({sessions.length})
          </button>
          {uniqueSubjects.map((sub: any) => (
            <button
              key={sub.subjectId}
              onClick={() => {
                setSelectedSubjectId(sub.subjectId);
                const subSession = sessions.find(s => s.subjectId === sub.subjectId);
                if (subSession) {
                  setActiveTopic(null);
                  setActiveSession(subSession);
                }
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSubjectId === sub.subjectId
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {sub.subjectName} (Prof. {sub.teacherName})
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT 8 COLUMNS: FACULTY-INTENDED STAGE */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-black rounded-[32px] border border-white/10 p-8 sm:p-10 min-h-[470px] flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/25 via-transparent to-black pointer-events-none" />

            {activeTopic ? (
              <div className="relative z-10 max-w-xl space-y-5">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase">
                  {activeTopic.subjectName} • {activeTopic.contentType}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {activeTopic.title}
                </h2>
                {activeTopic.bodyText && (
                  <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap bg-white/5 p-5 rounded-2xl border border-white/10 text-left max-h-56 overflow-y-auto">
                    {activeTopic.bodyText}
                  </p>
                )}
                <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                  {activeTopic.fileUrl && (
                    <a
                      href={activeTopic.fileUrl}
                      download={activeTopic.fileName || "resource"}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-wider"
                    >
                      Download Faculty File ({activeTopic.fileName || activeTopic.contentType}) ↗
                    </a>
                  )}
                  <button
                    onClick={() => setActiveTopic(null)}
                    className="px-5 py-3.5 rounded-2xl bg-white/10 text-white font-bold text-xs"
                  >
                    Back to Live Class Stage
                  </button>
                </div>
              </div>
            ) : activeSession ? (
              <div className="relative z-10 max-w-2xl w-full space-y-5">
                {/* Badges Showing Exact Faculty Configuration */}
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
                      COMPLETED LECTURE
                    </span>
                  )}

                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase">
                    {activeSession.subjectName} • Prof. {activeSession.teacherName}
                  </span>

                  {activeSession.isMandatory && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-black uppercase">
                      Mandatory Attendance
                    </span>
                  )}

                  {activeSession.isTargetedToMeOnly && (
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase">
                      Assigned Specifically to You
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {activeSession.title}
                </h2>

                {(activeSession.moduleTitle || activeSession.topicTitle) && (
                  <p className="text-xs font-bold text-indigo-400">
                    {activeSession.moduleTitle ? `Module: ${activeSession.moduleTitle}` : ""}
                    {activeSession.topicTitle ? ` • Topic: ${activeSession.topicTitle}` : ""}
                  </p>
                )}

                {/* TEACHER DIRECTIVE BANNER */}
                {activeSession.teacherDirective && (
                  <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">
                      📌 Directive from Prof. {activeSession.teacherName}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {activeSession.teacherDirective}
                    </p>
                  </div>
                )}

                {activeSession.agenda && (
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                    {activeSession.agenda}
                  </p>
                )}

                {/* COMPLETED POST-CLASS SUMMARY NOTES */}
                {activeSession.status === "COMPLETED" && activeSession.recordingNotes && (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                      Post-Class Faculty Summary & Takeaways
                    </p>
                    <p className="text-xs text-slate-200 whitespace-pre-wrap">
                      {activeSession.recordingNotes}
                    </p>
                  </div>
                )}

                {/* ACTION BUTTONS & PRE-CLASS ATTACHMENT */}
                <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                  {activeSession.isRoomLocked && activeSession.status !== "COMPLETED" ? (
                    <div className="px-6 py-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-black text-xs uppercase tracking-wider">
                      🔒 Waiting for Prof. {activeSession.teacherName} to Unlock Room Doors
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoinBroadcast(activeSession)}
                      className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all"
                    >
                      {activeSession.status === "COMPLETED" && activeSession.vodUrl
                        ? "▶ WATCH RECORDED VOD IN NEW TAB ↗"
                        : "🔴 JOIN ACTIVE BROADCAST IN NEW TAB ↗"}
                    </button>
                  )}

                  {activeSession.attachmentUrl && (
                    <a
                      href={activeSession.attachmentUrl}
                      download={activeSession.attachmentName || "class-material"}
                      className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs"
                    >
                      📎 Download Class Material ({activeSession.attachmentName || "File"})
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative z-10 max-w-md space-y-4">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  No Live Broadcasts Assigned Yet
                </h2>
                <p className="text-xs text-slate-400">
                  As soon as your course faculty assigns or starts a live class in their Command Center, their instructions, attachments, and stream link will appear right here.
                </p>
              </div>
            )}
          </div>

          {/* COURSE-SPECIFIC ASSIGNED LIVE CLASSES LIST */}
          <div className="bg-[#1C1C24] rounded-[28px] border border-white/10 p-6 space-y-4">
            <h3 className="text-base font-black text-white">
              Assigned Live Classes ({filteredSessions.length})
            </h3>
            {filteredSessions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">
                No classes assigned for this course filter yet.
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
                            ● LIVE
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">
                            {new Date(sess.scheduledAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-white">{sess.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Prof. {sess.teacherName}{" "}
                        {sess.isMandatory ? "• Mandatory" : "• Enrichment"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-400">
                        {sess.isRoomLocked
                          ? "🔒 Locked by Faculty"
                          : sess.hasJoined
                          ? "✓ Attendance Logged"
                          : "🔓 Open"}
                      </span>
                      <span className="text-[11px] font-bold text-indigo-400">
                        View Stage →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 4 COLUMNS: COURSE SYLLABUS & LEARNING QUEUE */}
        <div className="lg:col-span-4">
          <div className="bg-[#1C1C24] rounded-[32px] border border-white/10 p-6 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-white">Course Learning Queue</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Faculty-assigned broadcasts and syllabus modules for your enrolled subjects.
                </p>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredModules.map(mod => (
                  <div
                    key={mod.id}
                    className="p-4 rounded-2xl bg-[#13131A] border border-white/10 space-y-2"
                  >
                    <span className="text-[10px] font-black uppercase text-emerald-400">
                      {mod.subjectName} • Prof. {mod.teacherName}
                    </span>
                    <h4 className="text-xs font-black text-white">{mod.title}</h4>
                    <div className="space-y-1.5 pt-1">
                      {(mod.topics || []).map((t: any) => (
                        <button
                          key={t.id}
                          onClick={() =>
                            setActiveTopic({ ...t, subjectName: mod.subjectName })
                          }
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                            activeTopic?.id === t.id
                              ? "bg-indigo-600 text-white"
                              : "bg-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          <span className="truncate">{t.title}</span>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black/30">
                            {t.contentType}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/dashboard/doubts"
              className="w-full py-3.5 rounded-2xl bg-[#252532] hover:bg-[#2E2E3E] border border-white/10 text-center text-xs font-bold text-indigo-300 transition-all"
            >
              Ask Faculty a Doubt
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
