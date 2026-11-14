"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentAIInsightsAndMastery() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    "DIAGNOSTICS" | "FACULTY_ADVISOR" | "COHORT_CLUSTERS" | "STRATEGIES"
  >("DIAGNOSTICS");

  useEffect(() => {
    fetchMLInsights();
  }, []);

  const fetchMLInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/ml-insights");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[500px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
          Running Bayesian Knowledge Tracing (BKT), IRT θ & Ebbinghaus Retention Models...
        </p>
      </div>
    );
  }

  const ml = data?.ml;
  const studentVec = ml?.studentVector;
  const primaryFocus = ml?.primaryFocusSubject;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* TOP COMMAND HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-500/30">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black text-white tracking-tight">
                AI Insights & Mastery Engine
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                BKT + IRT θ + Ebbinghaus Decay
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                🛡️ OWASP Protected
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Bayesian Knowledge Tracing mastery probabilities, Ebbinghaus memory retention curves, faculty escalation triggers, and cohort clustering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/dashboard/curriculum"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all"
          >
            Curriculum, Quizzes & Assignments →
          </Link>
          <Link
            href="/dashboard/player"
            className="px-4 py-2.5 rounded-xl bg-[#1C1C24] hover:bg-[#252530] text-slate-200 border border-white/10 font-bold text-xs"
          >
            Live Learning Player ({data?.liveClassTelemetry?.attendedClasses || 0}/
            {data?.liveClassTelemetry?.totalAssignedClasses || 0})
          </Link>
          <Link
            href="/dashboard/doubts"
            className="px-4 py-2.5 rounded-xl bg-[#1C1C24] hover:bg-[#252530] text-slate-200 border border-white/10 font-bold text-xs"
          >
            Doubt Hub ({data?.openDoubtsCount || 0} Open)
          </Link>
        </div>
      </div>

      {/* ================================================================= */}
      {/* TOP ML TELEMETRY BANNER: BKT + IRT CLUSTER & PRIORITY REGRESSOR   */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Student Learning Speed & Psychometric Vector Card */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#1E1B3A] via-[#171722] to-[#14141D] rounded-3xl border border-indigo-500/30 p-7 flex flex-col justify-between shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                Psychometric Learning-Speed Classification
              </p>
              <h2 className="text-2xl font-black text-white mt-1">
                {studentVec?.clusterLabel || "Calibrating Profile"}
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-black">
                IRT Ability θ: {studentVec?.irtTheta >= 0 ? `+${studentVec?.irtTheta}` : studentVec?.irtTheta}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black">
                Composite: {studentVec?.compositeIndex || 0}/100
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black">
                Top {100 - (ml?.percentile || 100) + 1}% Cohort
              </span>
            </div>
          </div>

          {/* 4D Feature Vector Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] font-bold uppercase text-slate-400">BKT Mastery P(Lt)</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {studentVec?.bktMasteryPct || 45}%
              </p>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${studentVec?.bktMasteryPct || 45}%` }}
                />
              </div>
            </div>

            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] font-bold uppercase text-slate-400">Raw Accuracy</p>
              <p className="text-2xl font-black text-cyan-400 mt-1">
                {studentVec?.totalActivities > 0 ? `${studentVec.accuracy}%` : "N/A"}
              </p>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${studentVec?.accuracy || 0}%` }}
                />
              </div>
            </div>

            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] font-bold uppercase text-slate-400">Completion Rate</p>
              <p className="text-2xl font-black text-indigo-400 mt-1">
                {studentVec?.completionRate || 0}%
              </p>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full"
                  style={{ width: `${studentVec?.completionRate || 0}%` }}
                />
              </div>
            </div>

            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] font-bold uppercase text-slate-400">Learning Velocity</p>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {studentVec?.totalActivities > 0 ? `${studentVec.velocityScore}%` : "N/A"}
              </p>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${studentVec?.velocityScore || 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
            <span>
              Trained on <strong>{data?.quizzesCompleted || 0}/{data?.totalQuizzes || 0}</strong> Quizzes,{" "}
              <strong>{data?.assignmentsSubmitted || 0}/{data?.totalAssignments || 0}</strong> Assignments &{" "}
              <strong>{data?.liveClassTelemetry?.attendedClasses || 0}</strong> Live Classes
            </span>
            <button
              onClick={fetchMLInsights}
              className="text-indigo-400 hover:text-indigo-300 font-bold underline"
            >
              Re-compute BKT & IRT Model ↻
            </button>
          </div>
        </div>

        {/* Primary Subject Focus Recommendation Card */}
        <div className="lg:col-span-5 bg-[#1C1C24] rounded-3xl border border-white/10 p-7 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Priority Subject Focus Regressor
              </span>
              {primaryFocus && (
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    primaryFocus.focusPriorityScore >= 50
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : primaryFocus.focusPriorityScore > 0
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  Focus Index: {primaryFocus.focusPriorityScore}/100
                </span>
              )}
            </div>

            {!primaryFocus ? (
              <div className="py-6">
                <h3 className="text-lg font-black text-white">No Enrolled Subjects Yet</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enroll in a course from the Course Catalog to activate subject-level BKT & IRT ranking.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black text-white capitalize">
                  {primaryFocus.focusPriorityScore > 0
                    ? `Focus More On: ${primaryFocus.subjectName}`
                    : `Strongest Mastery: ${primaryFocus.subjectName}`}
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-0.5">
                  Prof. {primaryFocus.teacherName} • BKT Mastery: {primaryFocus.bktMasteryPct}% • Allocate{" "}
                  <span className="text-indigo-400">{primaryFocus.recommendedDailyHours} hrs/day</span>
                </p>

                <div className="mt-4 p-4 rounded-2xl bg-[#13131A] border border-white/5 space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400">
                    Psychometric & Retention Telemetry
                  </p>
                  {primaryFocus.focusReasons.length > 0 ? (
                    <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                      {primaryFocus.focusReasons.map((r: string, i: number) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-400 font-semibold">
                      100% of published assessments completed! Predicted next quiz score:{" "}
                      {primaryFocus.predictedNextScorePct}%.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <Link
              href="/dashboard/curriculum"
              className="flex-1 text-center py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
            >
              Open Subject Coursework
            </Link>
            <Link
              href="/dashboard/doubts"
              className="flex-1 text-center py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
            >
              Ask Faculty a Doubt
            </Link>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* INTERACTIVE ML NAVIGATION TABS                                    */}
      {/* ================================================================= */}
      <div className="flex items-center gap-2 flex-wrap bg-[#1C1C24] p-2 rounded-2xl border border-white/10">
        {[
          { id: "DIAGNOSTICS", label: "1. BKT Mastery, Retention & Strengths/Weaknesses" },
          { id: "FACULTY_ADVISOR", label: "2. When to Approach Faculty (Topic Triggers)" },
          {
            id: "COHORT_CLUSTERS",
            label: `3. Cohort Learning-Speed Segregation (${ml?.cohortSegregation?.totalStudentsAnalyzed || 0} Students)`
          },
          { id: "STRATEGIES", label: "4. Personalized Study Strategies & Daily Allocation" }
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === tab.id
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================================================================= */}
      {/* TAB 1: STRENGTHS, WEAKNESSES & BKT/RETENTION MATRIX               */}
      {/* ================================================================= */}
      {activeSection === "DIAGNOSTICS" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Verified Strengths */}
            <div className="bg-[#1C1C24] rounded-3xl border border-emerald-500/20 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Positive Signal Extraction
                  </span>
                  <h3 className="text-lg font-black text-white">Verified Academic Strengths</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-black">
                  {ml?.strengths?.length || 0} Detected
                </span>
              </div>

              {!ml?.strengths || ml.strengths.length === 0 ? (
                <p className="text-xs text-slate-400 py-6">
                  Complete a quiz or graded assignment in your enrolled subjects to populate verified question-level strengths.
                </p>
              ) : (
                <div className="space-y-3">
                  {ml.strengths.map((st: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#13131A] border border-emerald-500/20 flex items-start justify-between gap-3"
                    >
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-400">
                          {st.subjectName}
                        </span>
                        <p className="text-xs text-slate-200 mt-1">{st.detail}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-black shrink-0">
                        {st.metric}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pinpointed Weaknesses & Knowledge Gaps */}
            <div className="bg-[#1C1C24] rounded-3xl border border-rose-500/20 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                    Deficit & Bottleneck Detection
                  </span>
                  <h3 className="text-lg font-black text-white">
                    Pinpointed Weaknesses & Pending Gaps
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 text-xs font-black">
                  {ml?.weaknesses?.length || 0} Detected
                </span>
              </div>

              {!ml?.weaknesses || ml.weaknesses.length === 0 ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-sm font-black text-emerald-400">
                    Zero Missed Questions or Overdue Gaps Detected!
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    You have answered 100% of attempted questions accurately with no unsubmitted coursework bottlenecks.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ml.weaknesses.map((wk: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#13131A] border border-rose-500/20 flex items-start justify-between gap-3"
                    >
                      <div>
                        <span className="text-[10px] font-black uppercase text-rose-400">
                          {wk.subjectName}
                        </span>
                        <p className="text-xs text-slate-200 mt-1">{wk.detail}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-[10px] font-black shrink-0">
                        {wk.metric}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Per-Subject BKT, IRT & Retention Matrix */}
          <div className="bg-[#1C1C24] rounded-3xl border border-white/10 p-6 space-y-4">
            <h3 className="text-lg font-black text-white">
              Subject-Wise BKT Mastery, Ebbinghaus Retention & Study Allocation
            </h3>
            {!ml?.subjectDiagnostics || ml.subjectDiagnostics.length === 0 ? (
              <p className="text-xs text-slate-400">No subjects enrolled.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">Subject & Faculty</th>
                      <th className="py-3 px-4">BKT Mastery P(Lt)</th>
                      <th className="py-3 px-4">Next-Test Forecast</th>
                      <th className="py-3 px-4">Memory Retention</th>
                      <th className="py-3 px-4">Recommended Study</th>
                      <th className="py-3 px-4">Focus Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {ml.subjectDiagnostics.map((sd: any) => (
                      <tr key={sd.subjectId} className="hover:bg-white/5">
                        <td className="py-3.5 px-4 font-bold text-white">
                          {sd.subjectName}
                          <span className="block text-[10px] font-normal text-slate-400">
                            Prof. {sd.teacherName} • IRT θ = {sd.irtTheta}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-400">
                          {sd.bktMasteryPct}%
                        </td>
                        <td className="py-3.5 px-4 font-bold text-indigo-300">
                          {sd.predictedNextScorePct}%
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {sd.retentionPct > 0 ? `${sd.retentionPct}%` : "Baseline"}
                          <span className="block text-[10px] text-slate-400">
                            {sd.optimalReviewWindow}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-300">
                          {sd.recommendedDailyHours} hrs/day
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black ${
                              sd.focusPriorityScore >= 50
                                ? "bg-rose-500/20 text-rose-300"
                                : sd.focusPriorityScore > 0
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            {sd.focusPriorityScore}/100
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: WHEN TO APPROACH FACULTY WITH A SPECIFIC TOPIC             */}
      {/* ================================================================= */}
      {activeSection === "FACULTY_ADVISOR" && (
        <div className="space-y-6">
          <div className="bg-[#1C1C24] rounded-3xl border border-white/10 p-6 space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                Automated Intervention Classifier
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                When & Why to Approach Your Faculty Mentors
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Calculated from your BKT posterior mastery, missed quiz questions, and unsubmitted assignments.
              </p>
            </div>

            {!ml?.subjectDiagnostics || ml.subjectDiagnostics.length === 0 ? (
              <p className="text-xs text-slate-400">Enroll in a subject to receive faculty approach advisories.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ml.subjectDiagnostics.map((sd: any) => {
                  const trig = sd.facultyTrigger;
                  const badgeStyle =
                    trig.urgency === "IMMEDIATE"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : trig.urgency === "RECOMMENDED"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

                  return (
                    <div
                      key={sd.subjectId}
                      className="p-6 rounded-2xl bg-[#13131A] border border-white/10 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-indigo-400">
                            {sd.subjectName} • Prof. {trig.teacherName}
                          </span>
                          <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase ${badgeStyle}`}>
                            {trig.urgency}
                          </span>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-500">
                            Recommended Topic to Discuss
                          </p>
                          <h4 className="text-base font-black text-white mt-0.5">
                            {trig.topicToDiscuss}
                          </h4>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-500">
                            Optimal Timing
                          </p>
                          <p className="text-xs font-bold text-amber-300 mt-0.5">
                            {trig.whenToApproach}
                          </p>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {trig.actionReason}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex gap-3">
                        <Link
                          href="/dashboard/doubts"
                          className="flex-1 text-center py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                        >
                          Post Topic Doubt
                        </Link>
                        <Link
                          href="/dashboard/forum"
                          className="flex-1 text-center py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                        >
                          Request 1-on-1 Meet
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: COHORT LEARNING-SPEED SEGREGATION                          */}
      {/* ================================================================= */}
      {activeSection === "COHORT_CLUSTERS" && (
        <div className="space-y-6">
          <div className="bg-[#1C1C24] rounded-3xl border border-white/10 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  Unsupervised Multi-Student Clustering
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  Cohort Learning-Speed Segregation ({ml?.cohortSegregation?.totalStudentsAnalyzed || 0} Students)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Segregates all students in PostgreSQL into learning velocity and BKT mastery tiers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ml?.cohortSegregation?.tiers?.map((tier: any) => (
                <div
                  key={tier.id}
                  className="p-5 rounded-2xl bg-[#13131A] border border-white/10 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-black text-white">{tier.label}</h4>
                      <p className="text-xs text-slate-400 mt-1">{tier.description}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black shrink-0">
                      {tier.students.length} Student(s)
                    </span>
                  </div>

                  {tier.students.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">
                      No students currently mapped to this centroid.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {tier.students.map((st: any) => {
                        const isMe = st.studentId === studentVec?.studentId;
                        return (
                          <div
                            key={st.studentId}
                            className={`flex items-center justify-between p-3 rounded-xl border ${
                              isMe
                                ? "bg-indigo-600/20 border-indigo-500/50"
                                : "bg-white/5 border-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center font-black text-xs">
                                {st.studentName?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">
                                  {st.studentName} {isMe && <span className="text-indigo-400">(You)</span>}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  BKT: {st.bktMasteryPct}% • IRT θ: {st.irtTheta} • Velocity: {st.velocityScore}%
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-black text-emerald-400">
                              Index {st.compositeIndex}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 4: STUDYING STRATEGIES, TACTICS & RECOMMENDATIONS             */}
      {/* ================================================================= */}
      {activeSection === "STRATEGIES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ml?.strategies?.map((strat: any, idx: number) => (
            <div
              key={idx}
              className="bg-[#1C1C24] rounded-3xl border border-white/10 p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                    {strat.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-black">
                    {strat.impactMetric}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">{strat.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{strat.tactic}</p>
              </div>
              <div className="pt-3 border-t border-white/10">
                <Link
                  href="/dashboard/curriculum"
                  className="inline-block text-xs font-bold text-indigo-400 hover:underline"
                >
                  Apply Tactic in Coursework Portal →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
