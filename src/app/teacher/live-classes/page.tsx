"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function FacultyLiveClassesCommandStudio() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubjectId, setFilterSubjectId] = useState<string>("ALL");

  // Assignment & Broadcast Builder State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [agenda, setAgenda] = useState("");
  const [teacherDirective, setTeacherDirective] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [isMandatory, setIsMandatory] = useState<boolean>(true);
  const [isPinned, setIsPinned] = useState<boolean>(true);
  const [isRoomLocked, setIsRoomLocked] = useState<boolean>(false);
  const [assignMode, setAssignMode] = useState<"ALL_COHORT" | "SPECIFIC_STUDENTS">("ALL_COHORT");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Active Modals for Granular Session Controls
  const [attendanceModalSession, setAttendanceModalSession] = useState<any | null>(null);
  const [concludeModalSession, setConcludeModalSession] = useState<any | null>(null);
  const [vodUrlInput, setVodUrlInput] = useState("");
  const [recordingNotesInput, setRecordingNotesInput] = useState("");
  const [directiveDrafts, setDirectiveDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDirectorState();
    const timer = setInterval(fetchDirectorState, 8000);
    return () => clearInterval(timer);
  }, []);

  const fetchDirectorState = async () => {
    try {
      const res = await fetch("/api/live-classes?role=teacher");
      if (res.ok) {
        const data = await res.json();
        const subList = data.subjects || [];
        setSubjects(subList);
        setModules(data.modules || []);
        setSessions(data.sessions || []);
        if (subList.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(subList[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const activeSubjectObj =
    subjects.find(s => s.id === (selectedSubjectId || subjects[0]?.id)) || null;
  const subjectModules = modules.filter(m => m.subjectId === activeSubjectObj?.id);
  const selectedModuleObj = subjectModules.find(m => m.id === selectedModuleId) || null;
  const moduleTopics = selectedModuleObj?.topics || [];

  const toggleStudentSelection = (stId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(stId) ? prev.filter(x => x !== stId) : [...prev, stId]
    );
  };

  const handleCreateOrLaunchClass = async (startImmediately: boolean) => {
    if (!activeSubjectObj || !title.trim()) {
      alert("Please select a course/subject and enter a class title.");
      return;
    }
    if (!startImmediately && !scheduledAt) {
      alert("Please pick a scheduled date & time, or click 'Go Live Now'.");
      return;
    }

    setSubmitting(true);
    try {
      let attachmentUrl = null,
        attachmentName = null,
        attachmentType = null;
      if (attachmentFile) {
        attachmentUrl = await fileToBase64(attachmentFile);
        attachmentName = attachmentFile.name;
        attachmentType = attachmentFile.type;
      }

      const res = await fetch("/api/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_SESSION",
          subjectId: activeSubjectObj.id,
          moduleId: selectedModuleId || null,
          topicId: selectedTopicId || null,
          title,
          agenda,
          teacherDirective,
          targetStudentIds: assignMode === "SPECIFIC_STUDENTS" ? selectedStudentIds : [],
          isMandatory,
          isPinned,
          isRoomLocked,
          attachmentUrl,
          attachmentName,
          attachmentType,
          scheduledAt: scheduledAt || new Date().toISOString(),
          durationMinutes,
          startImmediately
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTitle("");
        setAgenda("");
        setTeacherDirective("");
        setScheduledAt("");
        setAttachmentFile(null);
        setSelectedStudentIds([]);
        await fetchDirectorState();

        if (startImmediately && data.session?.streamUrl) {
          window.open(data.session.streamUrl, "_blank", "noopener,noreferrer");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleControl = async (
    sessionId: string,
    payload: Record<string, any>
  ) => {
    await fetch("/api/live-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE_CONTROLS",
        sessionId,
        ...payload
      })
    });
    await fetchDirectorState();
  };

  const handleStartBroadcast = async (sess: any) => {
    window.open(sess.streamUrl, "_blank", "noopener,noreferrer");
    await fetch("/api/live-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "START_LIVE", sessionId: sess.id })
    });
    await fetchDirectorState();
  };

  const handleConcludeSubmit = async () => {
    if (!concludeModalSession) return;
    await fetch("/api/live-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "END_SESSION",
        sessionId: concludeModalSession.id,
        vodUrl: vodUrlInput.trim() || null,
        recordingNotes: recordingNotesInput.trim() || null
      })
    });
    setConcludeModalSession(null);
    setVodUrlInput("");
    setRecordingNotesInput("");
    await fetchDirectorState();
  };

  const handleDeleteSession = async (sessionId: string) => {
    await fetch("/api/live-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_SESSION", sessionId })
    });
    await fetchDirectorState();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[450px]">
        <div className="w-8 h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredSessions = sessions.filter(s =>
    filterSubjectId === "ALL" ? true : s.subjectId === filterSubjectId
  );
  const liveSessions = filteredSessions.filter(s => s.status === "LIVE");
  const scheduledSessions = filteredSessions.filter(s => s.status === "SCHEDULED");
  const completedSessions = filteredSessions.filter(s => s.status === "COMPLETED");

  return (
    <div className="relative min-h-full p-6 lg:p-10 overflow-hidden z-0">
      <div className="absolute top-16 right-8 w-80 h-80 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl rotate-45 blur-[110px] opacity-25 -z-10 pointer-events-none"></div>
      <div className="absolute -bottom-24 right-28 w-96 h-96 bg-gradient-to-br from-orange-400 to-pink-600 rounded-full blur-[120px] opacity-30 -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER & COURSE FILTER BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Faculty Live Class Director
              </h1>
              {liveSessions.length > 0 && (
                <span className="px-3.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  {liveSessions.length} Live Broadcast Active
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Assign course-specific live classes, control what students see on their Learning Player stage, lock/unlock room doors, and track attendance.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterSubjectId("ALL")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filterSubjectId === "ALL"
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              All Courses ({sessions.length})
            </button>
            {subjects.map(sub => (
              <button
                key={sub.id}
                onClick={() => setFilterSubjectId(sub.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  filterSubjectId === sub.id
                    ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {sub.name} ({sub.enrolledCount})
              </button>
            ))}
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-800 mb-2">
              No Registered Courses Found
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Register for the subjects you teach in your Faculty Profile to assign and control live classes.
            </p>
            <Link
              href="/teacher/profile"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-xs shadow-md"
            >
              Assign Subjects in My Profile →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ============================================================= */}
            {/* LEFT 5 COLUMNS: ASSIGN & CONFIGURE LIVE CLASS STUDIO          */}
            {/* ============================================================= */}
            <div className="lg:col-span-5 bg-white rounded-[32px] p-7 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">
                  Course & Student Stage Controller
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  Assign & Set Up Live Class
                </h2>
              </div>

              {/* 1. Course / Subject Selection */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  1. Course / Subject You Are Teaching
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={e => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedModuleId("");
                    setSelectedTopicId("");
                    setSelectedStudentIds([]);
                  }}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 bg-slate-50/70 focus:outline-none focus:border-pink-500"
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.enrolledCount} Enrolled Students)
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Syllabus Module & Topic Binding */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    2. Syllabus Module
                  </label>
                  <select
                    value={selectedModuleId}
                    onChange={e => {
                      setSelectedModuleId(e.target.value);
                      setSelectedTopicId("");
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/70"
                  >
                    <option value="">General Course Session</option>
                    {subjectModules.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Specific Topic
                  </label>
                  <select
                    value={selectedTopicId}
                    onChange={e => setSelectedTopicId(e.target.value)}
                    disabled={!selectedModuleId}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/70 disabled:opacity-50"
                  >
                    <option value="">All Module Topics</option>
                    {moduleTopics.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Cohort vs Specific Student Targeting */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    3. Assign To Students
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAssignMode("ALL_COHORT")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        assignMode === "ALL_COHORT"
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      Entire Cohort ({activeSubjectObj?.enrolledCount || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignMode("SPECIFIC_STUDENTS")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        assignMode === "SPECIFIC_STUDENTS"
                          ? "bg-pink-600 text-white"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      Select Students
                    </button>
                  </div>
                </div>

                {assignMode === "SPECIFIC_STUDENTS" && (
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pt-1">
                    {!activeSubjectObj?.students || activeSubjectObj.students.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        No students enrolled in this course yet.
                      </p>
                    ) : (
                      activeSubjectObj.students.map((st: any) => (
                        <label
                          key={st.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                        >
                          <span>
                            {st.name} <span className="text-slate-400 font-normal">({st.email})</span>
                          </span>
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(st.id)}
                            onChange={() => toggleStudentSelection(st.id)}
                            className="rounded text-pink-600"
                          />
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* 4. Class Title, Agenda & Student Stage Directive */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  4. Live Class Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Lecture 04: Electrochemistry Numericals & Doubt Clinic"
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  5. Student Stage Directive Banner (Displayed on Student Player)
                </label>
                <input
                  type="text"
                  value={teacherDirective}
                  onChange={e => setTeacherDirective(e.target.value)}
                  placeholder="e.g., Download the attached formula sheet before joining at 6:00 PM!"
                  className="w-full border border-indigo-200 bg-indigo-50/40 rounded-2xl px-4 py-2.5 text-xs font-bold text-indigo-950 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Detailed Lecture Agenda & Learning Outcomes
                </label>
                <textarea
                  value={agenda}
                  onChange={e => setAgenda(e.target.value)}
                  rows={2}
                  placeholder="Key derivations, problem sets, and concepts to be covered..."
                  className="w-full border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-700 focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              {/* 6. Schedule & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={240}
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700"
                  />
                </div>
              </div>

              {/* 7. Pre-Class Reference Material Upload */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Attach Pre-Class Slides / Problem Sheet for Students (Optional)
                </label>
                <input
                  type="file"
                  onChange={e => setAttachmentFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-pink-50 file:text-pink-600"
                />
              </div>

              {/* 8. Teacher Stage & Room Control Switches */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Teacher Broadcast Controls
                </p>

                <label className="flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer">
                  <span>📌 Spotlight on Student Player Main Stage</span>
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={e => setIsPinned(e.target.checked)}
                    className="rounded text-pink-600"
                  />
                </label>

                <label className="flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer">
                  <span>⚠️ Mark Attendance as Mandatory for Course</span>
                  <input
                    type="checkbox"
                    checked={isMandatory}
                    onChange={e => setIsMandatory(e.target.checked)}
                    className="rounded text-pink-600"
                  />
                </label>

                <label className="flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer">
                  <span>🔒 Keep Room Doors Locked Until I Start Broadcast</span>
                  <input
                    type="checkbox"
                    checked={isRoomLocked}
                    onChange={e => setIsRoomLocked(e.target.checked)}
                    className="rounded text-pink-600"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={() => handleCreateOrLaunchClass(true)}
                  disabled={submitting || !title.trim()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-[0_10px_25px_rgba(244,63,94,0.3)] transition-all disabled:opacity-50"
                >
                  🔴 Assign & Go Live Now (Opens New Tab) ↗
                </button>
                <button
                  onClick={() => handleCreateOrLaunchClass(false)}
                  disabled={submitting || !title.trim()}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  📅 Assign & Schedule Class to Student Queue
                </button>
              </div>
            </div>

            {/* ============================================================= */}
            {/* RIGHT 7 COLUMNS: LIVE CONTROL DECK FOR ASSIGNED CLASSES       */}
            {/* ============================================================= */}
            <div className="lg:col-span-7 space-y-6">
              {filteredSessions.length === 0 ? (
                <div className="bg-white rounded-[32px] p-12 text-center shadow-sm border border-slate-100">
                  <h3 className="text-lg font-black text-slate-800">
                    No Live Classes Assigned Yet
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Use the Course & Student Stage Controller on the left to assign a scheduled class or launch an immediate broadcast.
                  </p>
                </div>
              ) : (
                filteredSessions.map(sess => {
                  const isLive = sess.status === "LIVE";
                  const isCompleted = sess.status === "COMPLETED";
                  const currentDirective =
                    directiveDrafts[sess.id] !== undefined
                      ? directiveDrafts[sess.id]
                      : sess.teacherDirective || "";

                  return (
                    <div
                      key={sess.id}
                      className={`rounded-[32px] p-7 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border transition-all space-y-5 ${
                        isLive
                          ? "bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border-rose-500/50"
                          : "bg-white text-slate-900 border-slate-100"
                      }`}
                    >
                      {/* Top Status & Badges Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/20 pb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isLive ? (
                            <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                              LIVE ON AIR
                            </span>
                          ) : isCompleted ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                              ✓ COMPLETED
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest">
                              ⏳ SCHEDULED
                            </span>
                          )}

                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              isLive
                                ? "bg-white/10 text-pink-300"
                                : "bg-pink-50 text-pink-600"
                            }`}
                          >
                            {sess.subjectName}
                          </span>

                          {sess.isMandatory && (
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                isLive
                                  ? "bg-amber-400/20 text-amber-300"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              Mandatory
                            </span>
                          )}

                          {sess.isPinned && (
                            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500 text-white text-[9px] font-black uppercase">
                              📌 Spotlighted on Student Stage
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setAttendanceModalSession(sess)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                              isLive
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            👥 {sess.attendances?.length || 0} /{" "}
                            {sess.targetStudentIdsList?.length > 0
                              ? sess.targetStudentIdsList.length
                              : sess.enrolledStudents?.length || 0}{" "}
                            Joined
                          </button>

                          <button
                            onClick={() => handleDeleteSession(sess.id)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10"
                            title="Delete Session"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Title, Syllabus Context & Schedule */}
                      <div>
                        <h3 className="text-xl font-black">{sess.title}</h3>
                        <p
                          className={`text-xs font-semibold mt-1 ${
                            isLive ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          📅 {new Date(sess.scheduledAt).toLocaleString()} ({sess.durationMinutes}{" "}
                          mins)
                          {sess.moduleTitle ? ` • Module: ${sess.moduleTitle}` : ""}
                          {sess.topicTitle ? ` • Topic: ${sess.topicTitle}` : ""}
                          {sess.targetStudentIdsList?.length > 0
                            ? ` • Assigned to ${sess.targetStudentIdsList.length} Specific Student(s)`
                            : " • Assigned to Entire Enrolled Course"}
                        </p>
                        {sess.agenda && (
                          <p
                            className={`text-xs mt-2 ${
                              isLive ? "text-slate-300" : "text-slate-600"
                            }`}
                          >
                            {sess.agenda}
                          </p>
                        )}
                      </div>

                      {/* Live Teacher Directive Editor (Updates what students see immediately) */}
                      {!isCompleted && (
                        <div
                          className={`p-4 rounded-2xl border space-y-2 ${
                            isLive
                              ? "bg-white/5 border-white/10"
                              : "bg-slate-50 border-slate-200/80"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                              Live Student Stage Directive (Synced to Student Player)
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleToggleControl(sess.id, { isPinned: !sess.isPinned })
                                }
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                  sess.isPinned
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {sess.isPinned ? "📌 Spotlight Active" : "Pin to Student Stage"}
                              </button>

                              <button
                                onClick={() =>
                                  handleToggleControl(sess.id, {
                                    isRoomLocked: !sess.isRoomLocked
                                  })
                                }
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                  sess.isRoomLocked
                                    ? "bg-rose-600 text-white"
                                    : "bg-emerald-600 text-white"
                                }`}
                              >
                                {sess.isRoomLocked ? "🔒 Room Locked" : "🔓 Room Unlocked"}
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={currentDirective}
                              onChange={e =>
                                setDirectiveDrafts(prev => ({
                                  ...prev,
                                  [sess.id]: e.target.value
                                }))
                              }
                              placeholder="Write instructions that students will see on their player stage..."
                              className={`flex-1 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none ${
                                isLive
                                  ? "bg-black/40 border border-white/10 text-white"
                                  : "bg-white border border-slate-200 text-slate-800"
                              }`}
                            />
                            <button
                              onClick={() =>
                                handleToggleControl(sess.id, {
                                  teacherDirective: currentDirective
                                })
                              }
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                            >
                              Push to Students
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Primary Broadcast Action Bar */}
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {!isCompleted ? (
                          <>
                            <button
                              onClick={() => handleStartBroadcast(sess)}
                              className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-md"
                            >
                              {isLive
                                ? "🎥 Re-Open Live Broadcast Tab (FFMUC) ↗"
                                : "🔴 Start Live Broadcast & Unlock Student Stage ↗"}
                            </button>

                            <button
                              onClick={() => {
                                setConcludeModalSession(sess);
                                setVodUrlInput(sess.vodUrl || "");
                                setRecordingNotesInput(sess.recordingNotes || "");
                              }}
                              className={`px-5 py-3.5 rounded-2xl font-bold text-xs ${
                                isLive
                                  ? "bg-rose-500/20 border border-rose-500/40 text-rose-200"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              Conclude & Publish VOD
                            </button>
                          </>
                        ) : (
                          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                            <div className="text-xs text-slate-600">
                              <span className="font-bold text-slate-800">Post-Class Summary: </span>
                              {sess.recordingNotes || "Class marked completed."}
                            </div>
                            <button
                              onClick={() => {
                                setConcludeModalSession(sess);
                                setVodUrlInput(sess.vodUrl || "");
                                setRecordingNotesInput(sess.recordingNotes || "");
                              }}
                              className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs shrink-0"
                            >
                              Edit VOD / Summary
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: LIVE ROLL-CALL & ABSENTEE TRACKER */}
      {attendanceModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Live Attendance Roll-Call • {attendanceModalSession.subjectName}
                </h3>
                <p className="text-xs text-slate-500">{attendanceModalSession.title}</p>
              </div>
              <button
                onClick={() => setAttendanceModalSession(null)}
                className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-2">
                  Joined Live Broadcast ({attendanceModalSession.attendances?.length || 0})
                </p>
                {attendanceModalSession.attendances?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No students have clicked join yet.</p>
                ) : (
                  <div className="space-y-2">
                    {attendanceModalSession.attendances.map((a: any) => (
                      <div
                        key={a.id}
                        className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-800">
                          {a.student?.name} ({a.student?.email})
                        </span>
                        <span className="text-emerald-700 font-semibold">
                          Joined {new Date(a.joinedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-rose-500 mb-2">
                  Enrolled Roster Not Yet Joined
                </p>
                {(() => {
                  const joinedIds = new Set(
                    (attendanceModalSession.attendances || []).map((a: any) => a.studentId)
                  );
                  const absent = (attendanceModalSession.enrolledStudents || []).filter(
                    (st: any) => !joinedIds.has(st.id)
                  );
                  return absent.length === 0 ? (
                    <p className="text-xs text-emerald-600 font-bold">
                      100% of enrolled students in this subject have joined!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {absent.map((st: any) => (
                        <div
                          key={st.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-slate-700">
                            {st.name} ({st.email})
                          </span>
                          <span className="text-rose-500 font-bold">Awaiting Join</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONCLUDE CLASS & PUBLISH VOD / SUMMARY NOTES FOR STUDENTS */}
      {concludeModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-8 space-y-5">
            <h3 className="text-xl font-black text-slate-900">
              Conclude Broadcast & Publish Student VOD
            </h3>
            <p className="text-xs text-slate-500">
              What you enter below will immediately appear in your students' Learning Player for{" "}
              <strong>{concludeModalSession.title}</strong>.
            </p>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Recorded Video / VOD Link (Optional)
              </label>
              <input
                type="url"
                value={vodUrlInput}
                onChange={e => setVodUrlInput(e.target.value)}
                placeholder="https://..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Key Takeaways & Post-Class Instructions for Students
              </label>
              <textarea
                value={recordingNotesInput}
                onChange={e => setRecordingNotesInput(e.target.value)}
                rows={4}
                placeholder="Summarize what was covered and what homework or quiz students should complete next..."
                className="w-full border border-slate-200 rounded-xl p-4 text-xs text-slate-700 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConcludeModalSession(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConcludeSubmit}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md"
              >
                Save & Publish to Student Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
