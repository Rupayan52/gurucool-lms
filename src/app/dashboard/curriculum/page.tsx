"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentCurriculumPortal() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [activeCohort, setActiveCohort] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"MODULES" | "QUIZZES" | "ASSIGNMENTS" | "GRADEBOOK">("MODULES");

  // Quiz Taking State
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  // Assignment Submission State
  const [submissionInputs, setSubmissionInputs] = useState<Record<string, { text: string; file: File | null }>>({});

  useEffect(() => {
    fetchCoursework();
  }, []);

  const fetchCoursework = async (subjectId?: string, teacherId?: string) => {
    setLoading(true);
    try {
      const query = subjectId && teacherId ? `?subjectId=${subjectId}&teacherId=${teacherId}` : "";
      const res = await fetch(`/api/student/curriculum${query}`);
      if (res.ok) {
        const data = await res.json();
        setCohorts(data.cohorts || []);
        setActiveCohort(data.activeCohort || null);
        setModules(data.modules || []);
        setQuizzes(data.quizzes || []);
        setAssignments(data.assignments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const submitQuizAttempt = async (quiz: any) => {
    const answerArray = quiz.questions.map((_: any, idx: number) =>
      quizAnswers[idx] !== undefined ? quizAnswers[idx] : -1
    );
    if (answerArray.includes(-1)) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/student/curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SUBMIT_QUIZ", quizId: quiz.id, answers: answerArray })
    });
    if (res.ok) {
      setActiveQuizId(null);
      setQuizAnswers({});
      await fetchCoursework(activeCohort.subjectId, activeCohort.teacherId);
    }
    setSubmitting(false);
  };

  const submitAssignmentWork = async (assignmentId: string) => {
    const input = submissionInputs[assignmentId];
    if (!input || (!input.text?.trim() && !input.file)) {
      alert("Please write a response or attach your assignment file.");
      return;
    }
    setSubmitting(true);
    let fileUrl = null, fileName = null, fileType = null;
    if (input.file) {
      fileUrl = await fileToBase64(input.file);
      fileName = input.file.name;
      fileType = input.file.type;
    }

    const res = await fetch("/api/student/curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SUBMIT_ASSIGNMENT",
        assignmentId,
        responseText: input.text,
        fileUrl,
        fileName,
        fileType
      })
    });
    if (res.ok) {
      await fetchCoursework(activeCohort.subjectId, activeCohort.teacherId);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Compute Real Gradebook Totals
  const completedAttempts = quizzes.flatMap(q => q.attempts.map((a: any) => ({ ...a, quizTitle: q.title })));
  const gradedSubmissions = assignments.flatMap(a =>
    a.submissions.filter((s: any) => s.status === "GRADED").map((s: any) => ({ ...s, assignmentTitle: a.title, maxMarks: a.maxMarks }))
  );

  const quizEarned = completedAttempts.reduce((acc, a) => acc + a.score, 0);
  const quizTotal = completedAttempts.reduce((acc, a) => acc + a.maxScore, 0);
  const overallQuizPct = quizTotal > 0 ? Math.round((quizEarned / quizTotal) * 100) : null;

  const assignEarned = gradedSubmissions.reduce((acc, s) => acc + (s.awardedMarks || 0), 0);
  const assignTotal = gradedSubmissions.reduce((acc, s) => acc + s.maxMarks, 0);
  const overallAssignPct = assignTotal > 0 ? Math.round((assignEarned / assignTotal) * 100) : null;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* HEADER & QUICK NAVIGATION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Curriculum, Quizzes & Assignments</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Study topic-wise faculty materials, take auto-graded quizzes, and submit assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/forum" className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 shadow-sm">
            Course Hubs & 1-on-1 Meet
          </Link>
          <Link href="/dashboard/catalog" className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 shadow-sm">
            Course Catalog
          </Link>
        </div>
      </div>

      {cohorts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <h2 className="text-xl font-black text-slate-800 mb-2">No Enrolled Courses Found</h2>
          <p className="text-sm text-slate-500 mb-6">Enroll in a subject from the Course Catalog to access faculty curriculum and assessments.</p>
          <Link href="/dashboard/catalog" className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs">
            Explore Course Catalog
          </Link>
        </div>
      ) : (
        <>
          {/* COHORT SELECTOR & TABS */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Subject Cohort:</span>
              {cohorts.map((c, idx) => {
                const isSelected = activeCohort?.subjectId === c.subjectId && activeCohort?.teacherId === c.teacherId;
                return (
                  <button
                    key={`${c.subjectId}-${c.teacherId}-${idx}`}
                    onClick={() => fetchCoursework(c.subjectId, c.teacherId)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${isSelected ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    {c.subjectName} (Prof. {c.teacherName})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: "MODULES", label: `Topic Modules (${modules.length})` },
                { id: "QUIZZES", label: `Quizzes (${quizzes.length})` },
                { id: "ASSIGNMENTS", label: `Assignments (${assignments.length})` },
                { id: "GRADEBOOK", label: "My Gradebook" }
              ].map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === t.id ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: MODULES & TOPIC-WISE MATERIALS                     */}
          {/* ========================================================= */}
          {activeTab === "MODULES" && (
            <div className="space-y-6">
              {modules.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                  <p className="text-sm font-bold text-slate-400">Prof. {activeCohort?.teacherName} has not published modules for {activeCohort?.subjectName} yet.</p>
                </div>
              ) : (
                modules.map((mod, idx) => (
                  <div key={mod.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                    <div className="border-b border-slate-100 pb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Module {idx + 1}</span>
                      <h3 className="text-xl font-black text-slate-900">{mod.title}</h3>
                      {mod.description && <p className="text-xs text-slate-500 mt-1">{mod.description}</p>}
                    </div>

                    {mod.topics?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No topics uploaded inside this module yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mod.topics.map((t: any) => (
                          <div key={t.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
                            <div>
                              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase">
                                {t.contentType}
                              </span>
                              <h4 className="text-base font-bold text-slate-900 mt-2">{t.title}</h4>
                              {t.bodyText && <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed">{t.bodyText}</p>}
                            </div>

                            {t.fileUrl && (
                              <div className="pt-3 border-t border-slate-200">
                                {t.fileType?.startsWith("video/") ? (
                                  <video src={t.fileUrl} controls className="w-full rounded-xl border border-slate-200" />
                                ) : t.fileType?.startsWith("image/") ? (
                                  <img src={t.fileUrl} alt={t.title} className="w-full rounded-xl border border-slate-200" />
                                ) : (
                                  <a
                                    href={t.fileUrl}
                                    download={t.fileName || "lecture-material"}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm"
                                  >
                                    Download {t.fileName || t.contentType}
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: INTERACTIVE QUIZZES                                */}
          {/* ========================================================= */}
          {activeTab === "QUIZZES" && (
            <div className="space-y-6">
              {quizzes.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                  <p className="text-sm font-bold text-slate-400">No quizzes published for this cohort yet.</p>
                </div>
              ) : (
                quizzes.map(q => {
                  const existingAttempt = q.attempts?.[0];
                  const isRunning = activeQuizId === q.id;

                  return (
                    <div key={q.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-lg font-black text-slate-900">{q.title}</h3>
                          {q.description && <p className="text-xs text-slate-500 mt-0.5">{q.description}</p>}
                          <p className="text-[11px] font-bold text-slate-400 mt-1">{q.questions.length} Questions</p>
                        </div>

                        <div className="flex items-center gap-3">
                          {existingAttempt && (
                            <span className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xs">
                              Score: {existingAttempt.score} / {existingAttempt.maxScore} ({Math.round((existingAttempt.score / existingAttempt.maxScore) * 100)}%)
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setActiveQuizId(isRunning ? null : q.id);
                              setQuizAnswers({});
                            }}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                          >
                            {isRunning ? "Close Quiz" : existingAttempt ? "Retake Quiz" : "Start Quiz"}
                          </button>
                        </div>
                      </div>

                      {isRunning && (
                        <div className="space-y-6 pt-2">
                          {q.questions.map((ques: any, qIdx: number) => {
                            const opts: string[] = JSON.parse(ques.options || "[]");
                            return (
                              <div key={ques.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-black text-slate-900">Q{qIdx + 1}. {ques.questionText}</h4>
                                  <span className="text-xs font-bold text-indigo-600">{ques.points} pts</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {opts.map((optText, optIdx) => (
                                    <label
                                      key={optIdx}
                                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${quizAnswers[qIdx] === optIdx ? "bg-indigo-600 text-white border-indigo-600 font-bold" : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"}`}
                                    >
                                      <input
                                        type="radio"
                                        name={`q-${q.id}-${qIdx}`}
                                        checked={quizAnswers[qIdx] === optIdx}
                                        onChange={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                                        className="hidden"
                                      />
                                      <span className="text-xs">{optText}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                          <button
                            onClick={() => submitQuizAttempt(q)}
                            disabled={submitting}
                            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md"
                          >
                            {submitting ? "Grading Quiz..." : "Submit Answers for Instant Grading"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: ASSIGNMENTS & SUBMISSIONS                          */}
          {/* ========================================================= */}
          {activeTab === "ASSIGNMENTS" && (
            <div className="space-y-6">
              {assignments.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                  <p className="text-sm font-bold text-slate-400">No assignments posted for this cohort yet.</p>
                </div>
              ) : (
                assignments.map(a => {
                  const sub = a.submissions?.[0];
                  const currentInput = submissionInputs[a.id] || { text: sub?.responseText || "", file: null };

                  return (
                    <div key={a.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-lg font-black text-slate-900">{a.title}</h3>
                          <p className="text-xs font-bold text-indigo-600">
                            Max Marks: {a.maxMarks} {a.dueDate ? `• Due: ${new Date(a.dueDate).toLocaleDateString()}` : ""}
                          </p>
                        </div>
                        {sub ? (
                          sub.status === "GRADED" ? (
                            <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">
                              Graded: {sub.awardedMarks} / {a.maxMarks}
                            </span>
                          ) : (
                            <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-black text-xs">
                              Submitted • Awaiting Faculty Grade
                            </span>
                          )
                        ) : (
                          <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 font-black text-xs">
                            Not Submitted
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{a.instructions}</p>

                      {a.fileUrl && (
                        <div>
                          <a href={a.fileUrl} download={a.fileName || "assignment-prompt"} className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                            Download Faculty Reference File ({a.fileName || "Attachment"})
                          </a>
                        </div>
                      )}

                      {sub?.status === "GRADED" && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                          <p className="text-[10px] font-black uppercase text-emerald-700">Faculty Evaluation & Feedback</p>
                          <p className="text-sm font-black text-slate-900">Awarded Score: {sub.awardedMarks} / {a.maxMarks}</p>
                          {sub.teacherFeedback && <p className="text-xs text-slate-700 italic">"{sub.teacherFeedback}"</p>}
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <p className="text-xs font-black text-slate-800">{sub ? "Update Your Submission" : "Submit Your Assignment Work"}</p>
                        <textarea
                          value={currentInput.text}
                          onChange={e => setSubmissionInputs(prev => ({
                            ...prev,
                            [a.id]: { ...currentInput, text: e.target.value }
                          }))}
                          rows={3}
                          placeholder="Write your solution, notes, or explanation..."
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 resize-none"
                        />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <input
                            type="file"
                            onChange={e => setSubmissionInputs(prev => ({
                              ...prev,
                              [a.id]: { ...currentInput, file: e.target.files?.[0] || null }
                            }))}
                            className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600"
                          />
                          <button
                            onClick={() => submitAssignmentWork(a.id)}
                            disabled={submitting}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                          >
                            {sub ? "Resubmit Work" : "Submit Assignment"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: LIVE STUDENT GRADEBOOK                             */}
          {/* ========================================================= */}
          {activeTab === "GRADEBOOK" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Quiz Average</p>
                  <p className="text-3xl font-black text-indigo-600">{overallQuizPct !== null ? `${overallQuizPct}%` : "N/A"}</p>
                  <p className="text-xs text-slate-500 mt-1">{completedAttempts.length} of {quizzes.length} Quizzes Completed</p>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Assignment Average</p>
                  <p className="text-3xl font-black text-emerald-600">{overallAssignPct !== null ? `${overallAssignPct}%` : "N/A"}</p>
                  <p className="text-xs text-slate-500 mt-1">{gradedSubmissions.length} of {assignments.length} Assignments Graded</p>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Active Modules</p>
                  <p className="text-3xl font-black text-slate-900">{modules.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Instructed by Prof. {activeCohort?.teacherName}</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-black text-slate-900">Graded Assignments & Faculty Feedback</h3>
                {gradedSubmissions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No graded assignments recorded yet.</p>
                ) : (
                  gradedSubmissions.map((s: any) => (
                    <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{s.assignmentTitle}</h4>
                        <p className="text-xs text-slate-600 mt-1">Feedback: {s.teacherFeedback || "No written comment."}</p>
                      </div>
                      <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-black text-xs">
                        {s.awardedMarks} / {s.maxMarks}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
