export interface StudentRawTelemetry {
  studentId: string;
  studentName: string;
  enrolledSubjects: Array<{
    subjectId: string;
    subjectName: string;
    enrolledAt: Date;
    teachers: Array<{ id: string; name: string; email: string }>;
  }>;
  subjectMaterials: Array<{
    subjectId: string;
    modulesCount: number;
    topicsCount: number;
    latestTopicTitle: string | null;
  }>;
  quizzes: Array<{
    id: string;
    subjectId: string;
    subjectName: string;
    teacherName: string;
    title: string;
    createdAt: Date;
    questions: Array<{
      id: string;
      questionText: string;
      options: string;
      correctIndex: number;
      points: number;
    }>;
    attempt: {
      score: number;
      maxScore: number;
      answers: string;
      submittedAt: Date;
    } | null;
  }>;
  assignments: Array<{
    id: string;
    subjectId: string;
    subjectName: string;
    teacherName: string;
    title: string;
    maxMarks: number;
    dueDate: Date | null;
    createdAt: Date;
    submission: {
      status: string;
      awardedMarks: number | null;
      teacherFeedback: string | null;
      submittedAt: Date;
    } | null;
  }>;
  doubts: Array<{
    id: string;
    subjectId: string;
    subjectName: string;
    teacherName: string;
    title: string;
    status: string;
    createdAt: Date;
    resolvedAt: Date | null;
  }>;
}

export interface CohortPeerVector {
  studentId: string;
  studentName: string;
  accuracy: number;       // 0..100
  completionRate: number; // 0..100
  velocityScore: number;  // 0..100
  autonomyScore: number;  // 0..100
  compositeIndex: number; // 0..100
  totalActivities: number;
  clusterId: "ACCELERATED" | "ANALYTICAL" | "EXPLORER" | "FOUNDATIONAL" | "CALIBRATING";
  clusterLabel: string;
}

const CENTROIDS: Record<
  "ACCELERATED" | "ANALYTICAL" | "EXPLORER" | "FOUNDATIONAL",
  { acc: number; comp: number; vel: number; label: string; badgeColor: string }
> = {
  ACCELERATED: {
    acc: 88,
    comp: 85,
    vel: 85,
    label: "Accelerated Synthesizer",
    badgeColor: "emerald"
  },
  ANALYTICAL: {
    acc: 85,
    comp: 70,
    vel: 55,
    label: "Deep Analytical Pacer",
    badgeColor: "indigo"
  },
  EXPLORER: {
    acc: 60,
    comp: 80,
    vel: 82,
    label: "Rapid Concept Explorer",
    badgeColor: "amber"
  },
  FOUNDATIONAL: {
    acc: 45,
    comp: 40,
    vel: 40,
    label: "Foundational Guided Builder",
    badgeColor: "rose"
  }
};

function euclideanDistance3D(
  a: { acc: number; comp: number; vel: number },
  b: { acc: number; comp: number; vel: number }
): number {
  return Math.sqrt(
    Math.pow(a.acc - b.acc, 2) +
    Math.pow(a.comp - b.comp, 2) +
    Math.pow(a.vel - b.vel, 2)
  );
}

export function classifyPeerVector(
  accuracy: number,
  completionRate: number,
  velocityScore: number,
  autonomyScore: number,
  totalActivities: number
): {
  clusterId: CohortPeerVector["clusterId"];
  clusterLabel: string;
  compositeIndex: number;
} {
  if (totalActivities === 0) {
    return {
      clusterId: "CALIBRATING",
      clusterLabel: "Cold-Start Calibration (Awaiting Assessment Data)",
      compositeIndex: 0
    };
  }

  const point = { acc: accuracy, comp: completionRate, vel: velocityScore };
  let bestKey: "ACCELERATED" | "ANALYTICAL" | "EXPLORER" | "FOUNDATIONAL" = "FOUNDATIONAL";
  let minDistance = Infinity;

  (Object.keys(CENTROIDS) as Array<keyof typeof CENTROIDS>).forEach(key => {
    const dist = euclideanDistance3D(point, CENTROIDS[key]);
    if (dist < minDistance) {
      minDistance = dist;
      bestKey = key;
    }
  });

  const compositeIndex = Math.round(
    accuracy * 0.45 + completionRate * 0.30 + velocityScore * 0.15 + autonomyScore * 0.10
  );

  return {
    clusterId: bestKey,
    clusterLabel: CENTROIDS[bestKey].label,
    compositeIndex
  };
}

export function runPersonalMLPipeline(
  telemetry: StudentRawTelemetry,
  cohortVectors: CohortPeerVector[]
) {
  // 1. Per-Subject Feature Engineering & Diagnostic Matrix
  const subjectDiagnostics = telemetry.enrolledSubjects.map(sub => {
    const subQuizzes = telemetry.quizzes.filter(q => q.subjectId === sub.subjectId);
    const subAssignments = telemetry.assignments.filter(a => a.subjectId === sub.subjectId);
    const subDoubts = telemetry.doubts.filter(d => d.subjectId === sub.subjectId);
    const subMat = telemetry.subjectMaterials.find(m => m.subjectId === sub.subjectId);

    const attemptedQuizzes = subQuizzes.filter(q => q.attempt !== null);
    const submittedAssignments = subAssignments.filter(a => a.submission !== null);
    const gradedAssignments = subAssignments.filter(
      a => a.submission?.status === "GRADED" && a.submission.awardedMarks !== null
    );

    let earnedPts = 0;
    let maxPts = 0;

    attemptedQuizzes.forEach(q => {
      if (q.attempt) {
        earnedPts += q.attempt.score;
        maxPts += q.attempt.maxScore;
      }
    });

    gradedAssignments.forEach(a => {
      if (a.submission && a.submission.awardedMarks !== null) {
        earnedPts += a.submission.awardedMarks;
        maxPts += a.maxMarks;
      }
    });

    const rawAccuracy = maxPts > 0 ? Math.round((earnedPts / maxPts) * 100) : null;
    const totalAssignedItems = subQuizzes.length + subAssignments.length;
    const completedItems = attemptedQuizzes.length + submittedAssignments.length;
    const completionRate =
      totalAssignedItems > 0 ? Math.round((completedItems / totalAssignedItems) * 100) : 0;

    // Question-level inspection inside this subject
    const correctConcepts: string[] = [];
    const missedConcepts: Array<{
      quizTitle: string;
      questionText: string;
      correctOption: string;
      studentOption: string;
      points: number;
    }> = [];

    attemptedQuizzes.forEach(q => {
      let parsedAnswers: number[] = [];
      try {
        parsedAnswers = JSON.parse(q.attempt?.answers || "[]");
      } catch {
        parsedAnswers = [];
      }

      q.questions.forEach((ques, idx) => {
        let opts: string[] = [];
        try {
          opts = JSON.parse(ques.options || "[]");
        } catch {
          opts = [];
        }
        const chosenIdx = parsedAnswers[idx];
        if (Number(chosenIdx) === ques.correctIndex) {
          correctConcepts.push(`${q.title}: "${ques.questionText}"`);
        } else {
          missedConcepts.push({
            quizTitle: q.title,
            questionText: ques.questionText,
            correctOption: opts[ques.correctIndex] || `Option ${ques.correctIndex + 1}`,
            studentOption:
              chosenIdx !== undefined && chosenIdx >= 0
                ? opts[chosenIdx] || `Option ${chosenIdx + 1}`
                : "Unanswered",
            points: ques.points
          });
        }
      });
    });

    const openDoubts = subDoubts.filter(d => d.status === "OPEN");
    const resolvedDoubts = subDoubts.filter(d => d.status === "RESOLVED");

    const unattemptedQuizzes = subQuizzes.filter(q => !q.attempt);
    const pendingAssignments = subAssignments.filter(a => !a.submission);

    // Priority Focus Score (0..100): higher means the student MUST focus more on this subject
    let focusPriorityScore = 0;
    const focusReasons: string[] = [];

    if (rawAccuracy !== null && rawAccuracy < 75) {
      focusPriorityScore += Math.round((100 - rawAccuracy) * 0.65);
      focusReasons.push(`Assessment accuracy is ${rawAccuracy}% (below 75% mastery threshold)`);
    } else if (rawAccuracy === null && totalAssignedItems > 0) {
      focusPriorityScore += 55;
      focusReasons.push(`${totalAssignedItems} pending assessment(s) not yet attempted`);
    }

    if (missedConcepts.length > 0) {
      focusPriorityScore += Math.min(25, missedConcepts.length * 8);
      focusReasons.push(`${missedConcepts.length} specific quiz question(s) answered incorrectly`);
    }

    if (pendingAssignments.length > 0) {
      focusPriorityScore += Math.min(20, pendingAssignments.length * 10);
      focusReasons.push(`${pendingAssignments.length} unsubmitted assignment(s)`);
    }

    if (openDoubts.length > 0) {
      focusPriorityScore += Math.min(15, openDoubts.length * 7);
      focusReasons.push(`${openDoubts.length} unresolved doubt ticket(s)`);
    }

    focusPriorityScore = Math.min(100, focusPriorityScore);

    const primaryTeacher = sub.teachers[0] || { id: "", name: "Assigned Faculty", email: "" };

    // Determine exact Faculty Approach Recommendation
    let facultyTrigger: {
      urgency: "IMMEDIATE" | "RECOMMENDED" | "ENRICHMENT" | "NONE";
      whenToApproach: string;
      topicToDiscuss: string;
      actionReason: string;
      teacherId: string;
      teacherName: string;
      subjectId: string;
      subjectName: string;
    } = {
      urgency: "NONE",
      whenToApproach: "No immediate intervention required",
      topicToDiscuss: subMat?.latestTopicTitle || sub.subjectName,
      actionReason: "Complete upcoming modules to generate new diagnostic signals.",
      teacherId: primaryTeacher.id,
      teacherName: primaryTeacher.name,
      subjectId: sub.subjectId,
      subjectName: sub.subjectName
    };

    if (missedConcepts.length > 0) {
      facultyTrigger = {
        urgency: "IMMEDIATE",
        whenToApproach: "Before attempting the next assessment or module",
        topicToDiscuss: `${missedConcepts[0].quizTitle} — "${missedConcepts[0].questionText}"`,
        actionReason: `You missed ${missedConcepts.length} question(s) in ${sub.subjectName}. Schedule a 1-on-1 or post a doubt with Prof. ${primaryTeacher.name} to review the correct derivation ("${missedConcepts[0].correctOption}").`,
        teacherId: primaryTeacher.id,
        teacherName: primaryTeacher.name,
        subjectId: sub.subjectId,
        subjectName: sub.subjectName
      };
    } else if (rawAccuracy !== null && rawAccuracy < 75) {
      facultyTrigger = {
        urgency: "IMMEDIATE",
        whenToApproach: "Within the next 24–48 hours",
        topicToDiscuss: `${sub.subjectName} Core Rubric & Graded Feedback`,
        actionReason: `Overall subject accuracy is ${rawAccuracy}%. Request a 1-on-1 rubric walkthrough with Prof. ${primaryTeacher.name}.`,
        teacherId: primaryTeacher.id,
        teacherName: primaryTeacher.name,
        subjectId: sub.subjectId,
        subjectName: sub.subjectName
      };
    } else if (pendingAssignments.length > 0 || unattemptedQuizzes.length > 0) {
      const nextItemTitle = pendingAssignments[0]?.title || unattemptedQuizzes[0]?.title || sub.subjectName;
      facultyTrigger = {
        urgency: "RECOMMENDED",
        whenToApproach: "While preparing your pending submission",
        topicToDiscuss: nextItemTitle,
        actionReason: `You have ${pendingAssignments.length} pending assignment(s) and ${unattemptedQuizzes.length} unattempted quiz(zes). Clarify problem constraints with Prof. ${primaryTeacher.name} if stuck.`,
        teacherId: primaryTeacher.id,
        teacherName: primaryTeacher.name,
        subjectId: sub.subjectId,
        subjectName: sub.subjectName
      };
    } else if (rawAccuracy !== null && rawAccuracy >= 85) {
      facultyTrigger = {
        urgency: "ENRICHMENT",
        whenToApproach: "During weekly office hours for advanced progression",
        topicToDiscuss: subMat?.latestTopicTitle ? `Advanced application of ${subMat.latestTopicTitle}` : `Higher-order problems in ${sub.subjectName}`,
        actionReason: `You achieved ${rawAccuracy}% mastery in ${sub.subjectName}. Approach Prof. ${primaryTeacher.name} for advanced challenge problems.`,
        teacherId: primaryTeacher.id,
        teacherName: primaryTeacher.name,
        subjectId: sub.subjectId,
        subjectName: sub.subjectName
      };
    }

    return {
      subjectId: sub.subjectId,
      subjectName: sub.subjectName,
      teacherId: primaryTeacher.id,
      teacherName: primaryTeacher.name,
      modulesCount: subMat?.modulesCount || 0,
      topicsCount: subMat?.topicsCount || 0,
      quizzesTotal: subQuizzes.length,
      quizzesAttempted: attemptedQuizzes.length,
      assignmentsTotal: subAssignments.length,
      assignmentsSubmitted: submittedAssignments.length,
      assignmentsGraded: gradedAssignments.length,
      accuracy: rawAccuracy,
      completionRate,
      openDoubtsCount: openDoubts.length,
      resolvedDoubtsCount: resolvedDoubts.length,
      correctConcepts,
      missedConcepts,
      focusPriorityScore,
      focusReasons,
      facultyTrigger
    };
  });

  // Sort subjects by Focus Priority Score descending
  const rankedByFocusNeed = [...subjectDiagnostics].sort(
    (a, b) => b.focusPriorityScore - a.focusPriorityScore
  );

  // Extract Global Strengths & Weaknesses
  const strengths: Array<{ subjectName: string; detail: string; metric: string }> = [];
  const weaknesses: Array<{ subjectName: string; detail: string; metric: string }> = [];

  subjectDiagnostics.forEach(sd => {
    if (sd.accuracy !== null && sd.accuracy >= 80) {
      strengths.push({
        subjectName: sd.subjectName,
        detail: `High assessment accuracy across ${sd.quizzesAttempted} quiz(zes) and ${sd.assignmentsGraded} graded assignment(s).`,
        metric: `${sd.accuracy}% Mastery`
      });
    }
    sd.correctConcepts.slice(0, 3).forEach(concept => {
      strengths.push({
        subjectName: sd.subjectName,
        detail: `Verified concept mastery on ${concept}`,
        metric: "100% Correct"
      });
    });

    if (sd.accuracy !== null && sd.accuracy < 75) {
      weaknesses.push({
        subjectName: sd.subjectName,
        detail: `Sub-threshold score across graded evaluations; requires targeted revision.`,
        metric: `${sd.accuracy}% Score`
      });
    }
    sd.missedConcepts.forEach(mc => {
      weaknesses.push({
        subjectName: sd.subjectName,
        detail: `Missed "${mc.questionText}" in ${mc.quizTitle} (Selected: ${mc.studentOption} • Correct: ${mc.correctOption})`,
        metric: `-${mc.points} pts`
      });
    });
    if (sd.assignmentsTotal > sd.assignmentsSubmitted) {
      const pendingCount = sd.assignmentsTotal - sd.assignmentsSubmitted;
      weaknesses.push({
        subjectName: sd.subjectName,
        detail: `${pendingCount} assigned coursework submission(s) still pending upload.`,
        metric: `${sd.completionRate}% Completed`
      });
    }
  });

  // Locate current student's vector inside the cohort
  const myVector = cohortVectors.find(v => v.studentId === telemetry.studentId) || {
    studentId: telemetry.studentId,
    studentName: telemetry.studentName,
    accuracy: 0,
    completionRate: 0,
    velocityScore: 0,
    autonomyScore: 100,
    compositeIndex: 0,
    totalActivities: 0,
    clusterId: "CALIBRATING" as const,
    clusterLabel: "Cold-Start Calibration"
  };

  // Compute percentile rank among active students
  const sortedCohort = [...cohortVectors].sort((a, b) => b.compositeIndex - a.compositeIndex);
  const myRankIndex = sortedCohort.findIndex(v => v.studentId === telemetry.studentId);
  const percentile =
    sortedCohort.length > 1 && myRankIndex >= 0
      ? Math.round(((sortedCohort.length - myRankIndex) / sortedCohort.length) * 100)
      : 100;

  // Generate Personalized Study Strategies & Tactical Recommendations based on ML Cluster + Diagnostics
  const strategies: Array<{
    category: string;
    title: string;
    tactic: string;
    impactMetric: string;
  }> = [];

  const topFocusSubject = rankedByFocusNeed[0];

  if (myVector.clusterId === "ACCELERATED") {
    strategies.push({
      category: "Velocity Optimization",
      title: "Interleaved Retrieval & Spaced Challenge Sets",
      tactic: `Your accuracy (${myVector.accuracy}%) and completion velocity (${myVector.velocityScore}%) place you in the Accelerated Synthesizer tier. Shift from passive note reading to timed mixed-subject problem sets across ${telemetry.enrolledSubjects.map(s => s.subjectName).join(", ")}.`,
      impactMetric: " sustains >90% retention"
    });
  } else if (myVector.clusterId === "ANALYTICAL") {
    strategies.push({
      category: "Pacing Acceleration",
      title: "Time-Boxed Two-Pass Assessment Execution",
      tactic: `You maintain strong accuracy (${myVector.accuracy}%) but a more deliberate completion velocity (${myVector.velocityScore}%). Use a strict two-pass method: complete direct formula questions in 60 seconds, then allocate remaining time to derivations.`,
      impactMetric: "+25% submission speed"
    });
  } else if (myVector.clusterId === "EXPLORER") {
    strategies.push({
      category: "Precision Calibration",
      title: "Pre-Submission Error-Log Verification",
      tactic: `You complete coursework rapidly (${myVector.completionRate}% completion), but accuracy (${myVector.accuracy}%) shows preventable misses. Before submitting quizzes, verify unit conversions and sign conventions on every question.`,
      impactMetric: "+15–20% score gain"
    });
  } else if (myVector.clusterId === "FOUNDATIONAL") {
    strategies.push({
      category: "Foundational Reinforcement",
      title: "Topic-First Active Recall Before Quiz Attempts",
      tactic: `Study each uploaded module note in full and summarize key formulas in writing before clicking "Start Quiz". Immediately post a ticket in the Doubt Clearing Hub whenever a derivation step is unclear.`,
      impactMetric: "Eliminates core concept gaps"
    });
  } else {
    strategies.push({
      category: "Model Calibration",
      title: "Complete Baseline Diagnostic Assessments",
      tactic: `Your ML profile is in Cold-Start mode because 0 quizzes/assignments have been submitted across all subjects. Complete your first quiz or assignment so the engine can compute your velocity and accuracy vectors.`,
      impactMetric: "Unlocks full ML clustering"
    });
  }

  if (topFocusSubject && topFocusSubject.focusPriorityScore > 0) {
    strategies.push({
      category: "Priority Subject Allocation",
      title: `Allocate 60% Study Bandwidth to ${topFocusSubject.subjectName}`,
      tactic:
        topFocusSubject.focusReasons.length > 0
          ? `Why: ${topFocusSubject.focusReasons.join("; ")}. Complete pending items under Prof. ${topFocusSubject.teacherName} first.`
          : `Focus on ${topFocusSubject.subjectName} modules and upcoming assessments.`,
      impactMetric: `Priority Index: ${topFocusSubject.focusPriorityScore}/100`
    });
  } else if (topFocusSubject) {
    strategies.push({
      category: "Mastery Maintenance",
      title: `Maintain 100% Benchmark in ${topFocusSubject.subjectName}`,
      tactic: `You have zero pending bottlenecks in ${topFocusSubject.subjectName}. Review newly uploaded topic notes from Prof. ${topFocusSubject.teacherName} and request an advanced 1-on-1 problem breakdown.`,
      impactMetric: "100% Cohort Standing"
    });
  }

  return {
    studentVector: myVector,
    percentile,
    subjectDiagnostics: rankedByFocusNeed,
    primaryFocusSubject: topFocusSubject || null,
    strengths,
    weaknesses,
    strategies,
    cohortSegregation: {
      totalStudentsAnalyzed: cohortVectors.length,
      tiers: [
        {
          id: "ACCELERATED",
          label: "Accelerated Synthesizer",
          description: "High assessment accuracy (>=80%) paired with rapid syllabus completion velocity.",
          students: cohortVectors.filter(v => v.clusterId === "ACCELERATED")
        },
        {
          id: "ANALYTICAL",
          label: "Deep Analytical Pacer",
          description: "High accuracy with methodical, deliberate submission pacing.",
          students: cohortVectors.filter(v => v.clusterId === "ANALYTICAL")
        },
        {
          id: "EXPLORER",
          label: "Rapid Concept Explorer",
          description: "Fast completion speed with developing accuracy; benefits from error-log review.",
          students: cohortVectors.filter(v => v.clusterId === "EXPLORER")
        },
        {
          id: "FOUNDATIONAL",
          label: "Foundational Guided Builder",
          description: "Requires structured topic-by-topic reinforcement and frequent 1-on-1 faculty check-ins.",
          students: cohortVectors.filter(v => v.clusterId === "FOUNDATIONAL")
        },
        {
          id: "CALIBRATING",
          label: "Cold-Start Calibration",
          description: "Enrolled students who have not yet submitted a quiz or assignment.",
          students: cohortVectors.filter(v => v.clusterId === "CALIBRATING")
        }
      ]
    }
  };
}
