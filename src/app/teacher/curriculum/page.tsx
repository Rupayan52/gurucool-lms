"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function TeacherCurriculumStudio() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string>("");
  const [modules, setModules] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"CURRICULUM" | "QUIZZES" | "ASSIGNMENTS" | "GRADING">("CURRICULUM");

  // Module Form State
  const [modTitle, setModTitle] = useState("");
  const [modDesc, setModDesc] = useState("");

  // Topic Content Form State
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [topicTitle, setTopicTitle] = useState("");
  const [topicType, setTopicType] = useState("NOTE");
  const [topicBody, setTopicBody] = useState("");
  const [topicFile, setTopicFile] = useState<File | null>(null);

  // Quiz Builder State
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDesc, setQuizDesc] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<Array<{ questionText: string; options: string[]; correctIndex: number; points: number }>>([
    { questionText: "", options: ["", "", "", ""], correctIndex: 0, points: 5 }
  ]);

  // Assignment Builder State
  const [assignTitle, setAssignTitle] = useState("");
  const [assignInstructions, setAssignInstructions] = useState("");
  const [assignMaxMarks, setAssignMaxMarks] = useState(100);
  const [assignDueDate, setAssignDueDate] = useState("");
  const [assignFile, setAssignFile] = useState<File | null>(null);

  // Grading State
  const [gradeInputs, setGradeInputs] = useState<Record<string, { marks: string; feedback: string }>>({});
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    fetchStudioData();
  }, []);

  const fetchStudioData = async (subjectIdParam?: string) => {
    setLoading(true);
    try {
      const query = subjectIdParam ? `?subjectId=${subjectIdParam}` : "";
      const res = await fetch(`/api/teacher/curriculum${query}`);
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
        setActiveSubjectId(data.activeSubjectId || "");
        setModules(data.modules || []);
        setQuizzes(data.quizzes || []);
        setAssignments(data.assignments || []);
        if (data.modules?.length > 0 && !selectedModuleId) {
          setSelectedModuleId(data.modules[0].id);
        }
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

  const createModule = async () => {
    if (!modTitle.trim() || !activeSubjectId) return;
    setSubmittingAction(true);
    const res = await fetch("/api/teacher/curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CREATE_MODULE", subjectId: activeSubjectId, title: modTitle, description: modDesc })
    });
    if (res.ok) {
      setModTitle("");
      setModDesc("");
      await fetchStudioData(activeSubjectId);
    }
    setSubmittingAction(false);
  };

  const deleteModule = async (moduleId: string) => {
    await fetch("/api/teacher/curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_MODULE", moduleId })
    });
    await fetchStudioData(activeSubjectId);
  };

  const createTopic = async () => {
    const targetModId = selectedModuleId || modules[0]?.id;
    if (!targetModId || !topicTitle.trim()) return;
    setSubmittingAction(true);

    let fileUrl = null, fileName = null, fileType = null;
    if (topicFile) {
      fileUrl = await fileToBase64(topicFile);
      fileName = topicFile.name;
      fileType = topicFile.type;
    }

    const res = await fetch("/api/teacher/curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE_TOPIC",
        moduleId: targetModId,
        title: topicTitle,
        contentType: topicType,
        bodyText: topicBody,
        fileUrl,
        fileName,
        fileType
      })
    });
    if (res.ok) {
      setTopicTitle("");
      setTopicBody("");
      setTopicFile(null);
      await fetchStudioData(activeSubjectId);
    }
    setSubmittingAction(false);
  };

  const deleteTopic = async (topicId: string) => {
    await fetch("/api/teacher/curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_TOPIC", topicId })
    });
    await fetchStudioData(activeSubjectId);
  };

  const addQuizQuestionRow = () => {
    setQuizQuestions(prev => [...prev, { questionText: "", options: ["", "", "", ""], correctIndex: 0, points: 5 }]);
  };

  const updateQuestionField = (qIdx: number, field: string, value: any) => {
    setQuizQuestions(prev => prev.map((q, idx) => idx === qIdx ? { ...q, [field]: value } : q));
  };

  const updateQuestionOption = (qIdx: number, optIdx: number, value: string) => {
    setQuizQuestions(prev => prev.map((q, idx) => {
      if (idx !== qIdx) return q;
      const updatedOpts = [...q.options];
      updatedOpts[optIdx] = value;
      return { ...q, options: updatedOpts };
    }));
  };

  const createQuiz = async () => {
    if (!quizTitle.trim() || !activeSubjectId) return;
    const validQuestions = quizQuestions.filter(q => q.questionText.trim() && q.options.every(o => o.trim()));
    if (validQuestions.length === 0) {
      alert("Please complete all question fields and options.");
      return;
    }
    setSubmittingAction(true);
    const res = await fetch("/api/teacher/curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE_QUIZ",
        subjectId: activeSubjectId,
        title: quizTitle,
        description: quizDesc,
        questions: validQuestions
      })
    });
    if (res.ok) {
      setQuizTitle("");
      setQuizDesc("");
      setQuizQuestions([{ questionText: "", options: ["", "", "", ""], correctIndex: 0, points: 5 }]);
      await fetchStudioData(activeSubjectId);
    }
    setSubmittingAction(false);
  };

  const deleteQuiz = async (quizId: string) => {
    await fetch("/api/teacher/curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_QUIZ", quizId })
    });
    await fetchStudioData(activeSubjectId);
  };

  const createAssignment = async () => {
    if (!assignTitle.trim() || !assignInstructions.trim() || !activeSubjectId) return;
    setSubmittingAction(true);

    let fileUrl = null, fileName = null, fileType = null;
    if (assignFile) {
      fileUrl = await fileToBase64(assignFile);
      fileName = assignFile.name;
      fileType = assignFile.type;
    }

    const res = await fetch("/api/teacher/curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE_ASSIGNMENT",
        subjectId: activeSubjectId,
        title: assignTitle,
        instructions: assignInstructions,
        maxMarks: assignMaxMarks,
        dueDate: assignDueDate || null,
        fileUrl,
        fileName,
        fileType
      })
    });
    if (res.ok) {
      setAssignTitle("");
      setAssignInstructions("");
      setAssignMaxMarks(100);
      setAssignDueDate("");
      setAssignFile(null);
      await fetchStudioData(activeSubjectId);
    }
    setSubmittingAction(false);
  };

  const deleteAssignment = async (assignmentId: string) => {
    await fetch("/api/teacher/curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_ASSIGNMENT", assignmentId })
    });
    await fetchStudioData(activeSubjectId);
  };

  const submitGrade = async (submissionId: string) => {
    const input = gradeInputs[submissionId];
    if (!input || input.marks === undefined || input.marks === "") return;
    setSubmittingAction(true);
    const res = await fetch("/api/teacher/curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "GRADE_SUBMISSION",
        submissionId,
        awardedMarks: Number(input.marks),
        teacherFeedback: input.feedback || ""
      })
    });
    if (res.ok) {
      await fetchStudioData(activeSubjectId);
    }
    setSubmittingAction(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F4F6F9]">
        <div className="w-8 h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] p-6 lg:p-10 font-sans">
      {/* TOP NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic & Curriculum Studio</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Design syllabus modules, upload topic content, build quizzes, and grade student submissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/teacher/resolution-center" className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 shadow-sm">
            Resolution Center
          </Link>
          <Link href="/teacher/profile" className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 shadow-sm">
            My Profile & Roster
          </Link>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="max-w-7xl mx-auto bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
          <h2 className="text-xl font-black text-slate-800 mb-2">No Active Subjects Registered</h2>
          <p className="text-sm text-slate-500 mb-6">Register for a subject in your Faculty Profile first to design its curriculum.</p>
          <Link href="/teacher/profile" className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-xs shadow-md">
            Go to Faculty Profile
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* SUBJECT SELECTOR & WORKSPACE TABS */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Active Subject:</span>
              {subjects.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => { setSelectedModuleId(""); fetchStudioData(sub.id); }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeSubjectId === sub.id ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {sub.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: "CURRICULUM", label: `1. Curriculum & Topics (${modules.length})` },
                { id: "QUIZZES", label: `2. Quizzes (${quizzes.length})` },
                { id: "ASSIGNMENTS", label: `3. Assignments (${assignments.length})` },
                { id: "GRADING", label: "4. Grading Desk" }
              ].map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === t.id ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: CURRICULUM MODULES & TOPIC-WISE CONTENT            */}
          {/* ========================================================= */}
          {activeTab === "CURRICULUM" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-6">
                {/* Create Module Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-base font-black text-slate-900 mb-4">Create Curriculum Module</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={modTitle}
                      onChange={e => setModTitle(e.target.value)}
                      placeholder="Module Title (e.g., Unit 1: Electrochemistry)"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-pink-500"
                    />
                    <textarea
                      value={modDesc}
                      onChange={e => setModDesc(e.target.value)}
                      rows={2}
                      placeholder="Module learning objectives..."
                      className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:border-pink-500 resize-none"
                    />
                    <button
                      onClick={createModule}
                      disabled={submittingAction || !modTitle.trim()}
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      + Add Module to Syllabus
                    </button>
                  </div>
                </div>

                {/* Upload Topic-Wise Content Card */}
                {modules.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-base font-black text-slate-900 mb-4">Upload Topic-Wise Content</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Target Module</label>
                        <select
                          value={selectedModuleId || modules[0]?.id}
                          onChange={e => setSelectedModuleId(e.target.value)}
                          className="w-full mt-1 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 bg-white"
                        >
                          {modules.map(m => (
                            <option key={m.id} value={m.id}>{m.title}</option>
                          ))}
                        </select>
                      </div>

                      <input
                        type="text"
                        value={topicTitle}
                        onChange={e => setTopicTitle(e.target.value)}
                        placeholder="Topic Title (e.g., Nernst Equation Derivation)"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800"
                      />

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Content Format</label>
                        <select
                          value={topicType}
                          onChange={e => setTopicType(e.target.value)}
                          className="w-full mt-1 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 bg-white"
                        >
                          <option value="NOTE">Rich Lecture Notes / Formula Sheet</option>
                          <option value="PDF">PDF Document / eBook Chapter</option>
                          <option value="PPT">Presentation Slides (PPT / Deck)</option>
                          <option value="VIDEO">Recorded Video Lecture</option>
                        </select>
                      </div>

                      <textarea
                        value={topicBody}
                        onChange={e => setTopicBody(e.target.value)}
                        rows={4}
                        placeholder="Detailed topic notes, key equations, or summary..."
                        className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-700 resize-none"
                      />

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Attach File (PDF, PPT, Video, Image)</label>
                        <input
                          type="file"
                          onChange={e => setTopicFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100"
                        />
                      </div>

                      <button
                        onClick={createTopic}
                        disabled={submittingAction || !topicTitle.trim()}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50"
                      >
                        Publish Topic Material
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Published Syllabus Tree */}
              <div className="lg:col-span-7 space-y-6">
                {modules.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                    <p className="text-sm font-bold text-slate-400">No curriculum modules created for this subject yet.</p>
                  </div>
                ) : (
                  modules.map((mod, idx) => (
                    <div key={mod.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                      <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Module {idx + 1}</span>
                          <h4 className="text-lg font-black text-slate-900">{mod.title}</h4>
                          {mod.description && <p className="text-xs text-slate-500 mt-1">{mod.description}</p>}
                        </div>
                        <button onClick={() => deleteModule(mod.id)} className="text-xs font-bold text-rose-500 hover:underline">
                          Delete Module
                        </button>
                      </div>

                      {mod.topics?.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">No topics uploaded under this module yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {mod.topics.map((t: any) => (
                            <div key={t.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase">
                                    {t.contentType}
                                  </span>
                                  <h5 className="text-sm font-bold text-slate-800">{t.title}</h5>
                                </div>
                                <button onClick={() => deleteTopic(t.id)} className="text-[11px] font-bold text-rose-500 hover:underline">
                                  Remove
                                </button>
                              </div>
                              {t.bodyText && <p className="text-xs text-slate-600 whitespace-pre-wrap">{t.bodyText}</p>}
                              {t.fileUrl && (
                                <div className="pt-2">
                                  <a href={t.fileUrl} download={t.fileName || "resource"} className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                    Attachment: {t.fileName || "Download File"}
                                  </a>
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
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: QUIZ DESIGNER & LIVE ATTEMPT RESULTS               */}
          {/* ========================================================= */}
          {activeTab === "QUIZZES" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
                <h3 className="text-base font-black text-slate-900">Design New Assessment Quiz</h3>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={e => setQuizTitle(e.target.value)}
                  placeholder="Quiz Title (e.g., Mid-Term Kinetics Quiz)"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800"
                />
                <input
                  type="text"
                  value={quizDesc}
                  onChange={e => setQuizDesc(e.target.value)}
                  placeholder="Instructions or coverage notes..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700"
                />

                <div className="space-y-6 max-h-[460px] overflow-y-auto pr-2">
                  {quizQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700">Question #{qIdx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Points:</span>
                          <input
                            type="number"
                            value={q.points}
                            onChange={e => updateQuestionField(qIdx, "points", Number(e.target.value))}
                            className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 bg-white"
                          />
                        </div>
                      </div>

                      <input
                        type="text"
                        value={q.questionText}
                        onChange={e => updateQuestionField(qIdx, "questionText", e.target.value)}
                        placeholder="Enter question prompt..."
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white text-slate-800"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctIndex === optIdx}
                              onChange={() => updateQuestionField(qIdx, "correctIndex", optIdx)}
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={e => updateQuestionOption(qIdx, optIdx, e.target.value)}
                              placeholder={`Option ${optIdx + 1}`}
                              className="w-full text-xs text-slate-800 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] font-bold text-emerald-600">Select the radio button next to the correct answer.</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={addQuizQuestionRow}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    + Add Another Question
                  </button>
                  <button
                    onClick={createQuiz}
                    disabled={submittingAction || !quizTitle.trim()}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-xs shadow-md disabled:opacity-50"
                  >
                    Publish Quiz
                  </button>
                </div>
              </div>

              {/* Right Column: Published Quizzes & Student Scores */}
              <div className="lg:col-span-6 space-y-6">
                {quizzes.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                    <p className="text-sm font-bold text-slate-400">No quizzes published for this subject yet.</p>
                  </div>
                ) : (
                  quizzes.map(q => (
                    <div key={q.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="text-lg font-black text-slate-900">{q.title}</h4>
                          <p className="text-xs text-slate-500">{q.questions.length} Questions • {q.attempts.length} Student Attempts</p>
                        </div>
                        <button onClick={() => deleteQuiz(q.id)} className="text-xs font-bold text-rose-500 hover:underline">
                          Delete
                        </button>
                      </div>

                      {q.attempts.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No students have attempted this quiz yet.</p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Student Scoreboard</p>
                          {q.attempts.map((att: any) => (
                            <div key={att.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <div>
                                <p className="text-xs font-bold text-slate-800">{att.student?.name}</p>
                                <p className="text-[10px] text-slate-400">{new Date(att.submittedAt).toLocaleString()}</p>
                              </div>
                              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">
                                {att.score} / {att.maxScore} pts ({Math.round((att.score / att.maxScore) * 100)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: ASSIGNMENTS BUILDER                                */}
          {/* ========================================================= */}
          {activeTab === "ASSIGNMENTS" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <h3 className="text-base font-black text-slate-900">Create New Assignment</h3>
                <input
                  type="text"
                  value={assignTitle}
                  onChange={e => setAssignTitle(e.target.value)}
                  placeholder="Assignment Title"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800"
                />
                <textarea
                  value={assignInstructions}
                  onChange={e => setAssignInstructions(e.target.value)}
                  rows={4}
                  placeholder="Detailed instructions, rubric, and submission requirements..."
                  className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-700 resize-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Max Marks</label>
                    <input
                      type="number"
                      value={assignMaxMarks}
                      onChange={e => setAssignMaxMarks(Number(e.target.value))}
                      className="w-full mt-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Due Date</label>
                    <input
                      type="date"
                      value={assignDueDate}
                      onChange={e => setAssignDueDate(e.target.value)}
                      className="w-full mt-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Reference Problem Set / Attachment (Optional)</label>
                  <input
                    type="file"
                    onChange={e => setAssignFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600"
                  />
                </div>
                <button
                  onClick={createAssignment}
                  disabled={submittingAction || !assignTitle.trim() || !assignInstructions.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50"
                >
                  Publish Assignment
                </button>
              </div>

              <div className="lg:col-span-7 space-y-6">
                {assignments.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                    <p className="text-sm font-bold text-slate-400">No assignments created for this subject yet.</p>
                  </div>
                ) : (
                  assignments.map(a => (
                    <div key={a.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-black text-slate-900">{a.title}</h4>
                          <p className="text-xs font-bold text-pink-500">
                            Max Marks: {a.maxMarks} {a.dueDate ? `• Due: ${new Date(a.dueDate).toLocaleDateString()}` : ""}
                          </p>
                        </div>
                        <button onClick={() => deleteAssignment(a.id)} className="text-xs font-bold text-rose-500 hover:underline">
                          Delete
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 whitespace-pre-wrap">{a.instructions}</p>
                      {a.fileUrl && (
                        <a href={a.fileUrl} download={a.fileName || "assignment"} className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                          Reference File: {a.fileName || "Download"}
                        </a>
                      )}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-500">{a.submissions.length} Submissions Received</span>
                        <button onClick={() => setActiveTab("GRADING")} className="text-xs font-bold text-indigo-600 hover:underline">
                          Open in Grading Desk →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: GRADING & SUBMISSIONS DESK                         */}
          {/* ========================================================= */}
          {activeTab === "GRADING" && (
            <div className="space-y-6">
              {assignments.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                  <p className="text-sm font-bold text-slate-400">No assignments available to grade.</p>
                </div>
              ) : (
                assignments.map(a => (
                  <div key={a.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{a.title}</h3>
                        <p className="text-xs text-slate-500">Maximum Marks: {a.maxMarks}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                        {a.submissions.length} Submissions
                      </span>
                    </div>

                    {a.submissions.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-4">No student submissions yet for this assignment.</p>
                    ) : (
                      <div className="space-y-4">
                        {a.submissions.map((sub: any) => {
                          const currentInput = gradeInputs[sub.id] || {
                            marks: sub.awardedMarks !== null && sub.awardedMarks !== undefined ? String(sub.awardedMarks) : "",
                            feedback: sub.teacherFeedback || ""
                          };

                          return (
                            <div key={sub.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <h4 className="text-sm font-black text-slate-900">{sub.student?.name}</h4>
                                  <p className="text-[11px] text-slate-500">{sub.student?.email} • Submitted {new Date(sub.submittedAt).toLocaleString()}</p>
                                </div>
                                {sub.status === "GRADED" ? (
                                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">
                                    Graded: {sub.awardedMarks} / {a.maxMarks}
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-black text-xs">
                                    Pending Grade
                                  </span>
                                )}
                              </div>

                              {sub.responseText && (
                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Student Written Response</p>
                                  <p className="text-xs text-slate-700 whitespace-pre-wrap">{sub.responseText}</p>
                                </div>
                              )}

                              {sub.fileUrl && (
                                <div>
                                  <a href={sub.fileUrl} download={sub.fileName || "submission"} className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                                    Download Student File: {sub.fileName || "Attachment"}
                                  </a>
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-200">
                                <div className="md:col-span-3">
                                  <label className="text-[10px] font-bold uppercase text-slate-500">Marks (out of {a.maxMarks})</label>
                                  <input
                                    type="number"
                                    max={a.maxMarks}
                                    min={0}
                                    value={currentInput.marks}
                                    onChange={e => setGradeInputs(prev => ({
                                      ...prev,
                                      [sub.id]: { ...currentInput, marks: e.target.value }
                                    }))}
                                    className="w-full mt-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900"
                                  />
                                </div>
                                <div className="md:col-span-6">
                                  <label className="text-[10px] font-bold uppercase text-slate-500">Faculty Evaluation Feedback</label>
                                  <input
                                    type="text"
                                    value={currentInput.feedback}
                                    onChange={e => setGradeInputs(prev => ({
                                      ...prev,
                                      [sub.id]: { ...currentInput, feedback: e.target.value }
                                    }))}
                                    placeholder="Write constructive feedback for the student..."
                                    className="w-full mt-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
                                  />
                                </div>
                                <div className="md:col-span-3 flex items-end">
                                  <button
                                    onClick={() => submitGrade(sub.id)}
                                    disabled={submittingAction}
                                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                                  >
                                    {sub.status === "GRADED" ? "Update Grade" : "Publish Grade"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
