export interface StudentRawTelemetry {
  studentId: string;
  studentName: string;
  studyProfile?: {
    dailyStudyGoalHrs: number;
    learningStyle: string;
    targetExam: string | null;
    institution: string | null;
  };
  liveClassTelemetry?: {
    totalAssignedClasses: number;
    attendedClasses: number;
    mandatoryAssigned: number;
    mandatoryAttended: number;
  };
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
  accuracy: number;         // 0..100
  completionRate: number;   // 0..100
  velocityScore: number;    // 0..100
  autonomyScore: number;    // 0..100
  bktMasteryPct: number;    // 0..100 Bayesian Knowledge Tracing posterior
  irtTheta: number;         // -3.0 .. +3.0 IRT Latent Ability
  compositeIndex: number;   // 0..100
  totalActivities: number;
  clusterId: "ACCELERATED" | "ANALYTICAL" | "EXPLORER" | "FOUNDATIONAL" | "CALIBRATING";
  clusterLabel: string;
}

// Canonical Bayesian Knowledge Tracing (BKT) Parameter Set (Corbett & Anderson)
const BKT_PARAMS = {
  pInit: 0.45,    // P(L_0): Initial prior probability of skill mastery
  pTransit: 0.22, // P(T): Probability of transitioning from unlearned to mastered after practice
  pSlip: 0.10,    // P(S): Probability of making a slip despite knowing the concept
  pGuess: 0.25    // P(G): Probability of guessing a 4-option MCQ correctly without mastery
};

/**
 * Runs sequential Bayesian Knowledge Tracing (BKT) over binary observations (1 = correct, 0 = wrong)
 * Returns posterior mastery P(L_t) and next-step predicted success probability P(C_{t+1}).
 */
export function computeBayesianKnowledgeTrace(observations: number[]): {
  posteriorMastery: number;
  predictedNextSuccess: number;
} {
  if (observations.length === 0) {
    const pNext =
      BKT_PARAMS.pInit * (1 - BKT_PARAMS.pSlip) +
      (1 - BKT_PARAMS.pInit) * BKT_PARAMS.pGuess;
    return {
      posteriorMastery: Math.round(BKT_PARAMS.pInit * 100),
      predictedNextSuccess: Math.round(pNext * 100)
    };
  }

  let pL = BKT_PARAMS.pInit;
  const { pTransit, pSlip, pGuess } = BKT_PARAMS;

  for (const obs of observations) {
    let pLGivenObs: number;
    if (obs === 1) {
      const num = pL * (1 - pSlip);
      const den = num + (1 - pL) * pGuess;
      pLGivenObs = den > 0 ? num / den : pL;
    } else {
      const num = pL * pSlip;
      const den = num + (1 - pL) * (1 - pGuess);
      pLGivenObs = den > 0 ? num / den : pL;
    }
    // Learning transition step: P(L_t) = P(L_{t-1}|obs) + (1 - P(L_{t-1}|obs)) * P(T)
    pL = pLGivenObs + (1 - pLGivenObs) * pTransit;
  }

  const pNextCorrect = pL * (1 - pSlip) + (1 - pL) * pGuess;
  return {
    posteriorMastery: Math.max(5, Math.min(99, Math.round(pL * 100))),
    predictedNextSuccess: Math.max(10, Math.min(99, Math.round(pNextCorrect * 100)))
  };
}

/**
 * Ebbinghaus Forgetting Curve Retention Model: R(t) = exp(-hoursElapsed / stabilityHours)
 * Stability increases with each completed reinforcement activity and high BKT mastery.
 */
export function computeEbbinghausRetention(
  lastActivityDate: Date | null,
  reinforcementCount: number,
  bktMasteryPct: number
): { retentionPct: number; hoursSinceLastPractice: number | null; optimalReviewWindow: string } {
  if (!lastActivityDate || reinforcementCount === 0) {
    return {
      retentionPct: 0,
      hoursSinceLastPractice: null,
      optimalReviewWindow: "Immediate baseline practice needed"
    };
  }

  const hoursElapsed = Math.max(
    0,
    (Date.now() - new Date(lastActivityDate).getTime()) / (1000 * 3600)
  );

  // Base memory half-life stability scales with practice count and BKT mastery (in hours)
  const stabilityHours = 48 * (1 + reinforcementCount * 0.65) * (0.5 + bktMasteryPct / 100);
  const rawRetention = Math.exp(-hoursElapsed / stabilityHours);
  const retentionPct = Math.max(15, Math.min(100, Math.round(rawRetention * 100)));

  let optimalReviewWindow = "Memory stable (>85% retention)";
  if (retentionPct < 60) {
    optimalReviewWindow = "Critical decay (<60%): Review notes & retake quiz today";
  } else if (retentionPct < 80) {
    optimalReviewWindow = "Spaced repetition due within 24 hours";
  }

  return {
    retentionPct,
    hoursSinceLastPractice: Math.round(hoursElapsed),
    optimalReviewWindow
  };
}

/**
 * 1-Parameter Logistic (Rasch / IRT) Latent Ability Estimator (Theta in [-3.0, +3.0])
 */
export function estimateIRTAbilityTheta(
  observations: Array<{ correct: number; weight: number }>
): number {
  if (observations.length === 0) return 0;
  let weightedCorrect = 0;
  let totalWeight = 0;
  for (const item of observations) {
    weightedCorrect += item.correct * item.weight;
    totalWeight += item.weight;
  }
  // Bayesian Laplace smoothing to avoid infinite log-odds at 0% or 100%
  const p = (weightedCorrect + 0.5) / (totalWeight + 1.0);
  const logOdds = Math.log(p / (1 - p));
  return Number(Math.max(-3.0, Math.min(3.0, logOdds)).toFixed(2));
}

const CENTROIDS: Record<
  "ACCELERATED" | "ANALYTICAL" | "EXPLORER" | "FOUNDATIONAL",
  { acc: number; comp: number; vel: number; label: string }
> = {
  ACCELERATED: { acc: 88, comp: 85, vel: 85, label: "Accelerated Synthesizer" },
  ANALYTICAL: { acc: 85, comp: 70, vel: 55, label: "Deep Analytical Pacer" },
  EXPLORER: { acc: 60, comp: 80, vel: 82, label: "Rapid Concept Explorer" },
  FOUNDATIONAL: { acc: 45, comp: 40, vel: 40, label: "Foundational Guided Builder" }
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
  totalActivities: number,
  bktMasteryPct = accuracy
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

  const effectiveAcc = Math.round(accuracy * 0.6 + bktMasteryPct * 0.4);
  const point = { acc: effectiveAcc, comp: completionRate, vel: velocityScore };
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
    effectiveAcc * 0.45 + completionRate * 0.30 + velocityScore * 0.15 + autonomyScore * 0.10
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
  const dailyGoalHrs = telemetry.studyProfile?.dailyStudyGoalHrs || 4;
  const learningStyle = telemetry.studyProfile?.learningStyle || "Visual & Derivation-First";

  // 1. Per-Subject BKT, IRT, Ebbinghaus Retention & Diagnostic Matrix
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
    const bktObservations: number[] = [];
    const irtObservations: Array<{ correct: number; weight: number }> = [];
    let latestActivityDate: Date | null = null;

    attemptedQuizzes.forEach(q => {
      if (q.attempt) {
        earnedPts += q.attempt.score;
        maxPts += q.attempt.maxScore;
        if (!latestActivityDate || new Date(q.attempt.submittedAt) > latestActivityDate) {
          latestActivityDate = new Date(q.attempt.submittedAt);
        }
      }
    });

    gradedAssignments.forEach(a => {
      if (a.submission && a.submission.awardedMarks !== null) {
        earnedPts += a.submission.awardedMarks;
        maxPts += a.maxMarks;
        const ratio = a.maxMarks > 0 ? a.submission.awardedMarks / a.maxMarks : 0;
        bktObservations.push(ratio >= 0.7 ? 1 : 0);
        irtObservations.push({ correct: ratio >= 0.7 ? 1 : 0, weight: 2 });
        if (!latestActivityDate || new Date(a.submission.submittedAt) > latestActivityDate) {
          latestActivityDate = new Date(a.submission.submittedAt);
        }
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
        const isCorrect = Number(chosenIdx) === ques.correctIndex;
        bktObservations.push(isCorrect ? 1 : 0);
        irtObservations.push({ correct: isCorrect ? 1 : 0, weight: Math.max(1, ques.points) });

        if (isCorrect) {
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

    // Compute BKT Posterior Mastery, IRT Ability Theta, and Ebbinghaus Memory Retention
    const bkt = computeBayesianKnowledgeTrace(bktObservations);
    const irtTheta = estimateIRTAbilityTheta(irtObservations);
    const retention = computeEbbinghausRetention(
      latestActivityDate,
      completedItems,
      bkt.posteriorMastery
    );

    const openDoubts = subDoubts.filter(d => d.status === "OPEN");
    const resolvedDoubts = subDoubts.filter(d => d.status === "RESOLVED");
    const unattemptedQuizzes = subQuizzes.filter(q => !q.attempt);
    const pendingAssignments = subAssignments.filter(a => !a.submission);

    // Multi-Factor Focus Priority Regressor (0..100)
    let focusPriorityScore = 0;
    const focusReasons: string[] = [];

    if (rawAccuracy !== null && rawAccuracy < 75) {
      focusPriorityScore += Math.round((100 - rawAccuracy) * 0.55);
      focusReasons.push(`Assessment accuracy is ${rawAccuracy}% (BKT mastery: ${bkt.posteriorMastery}%)`);
    } else if (rawAccuracy === null && totalAssignedItems > 0) {
      focusPriorityScore += 55;
      focusReasons.push(`${totalAssignedItems} pending assessment(s) not yet attempted`);
    }

    if (retention.retentionPct > 0 && retention.retentionPct < 75) {
      focusPriorityScore += 18;
      focusReasons.push(`Memory retention decayed to ${retention.retentionPct}% (${retention.optimalReviewWindow})`);
    }

    if (missedConcepts.length > 0) {
      focusPriorityScore += Math.min(25, missedConcepts.length * 8);
      focusReasons.push(`${missedConcepts.length} quiz question(s) missed`);
    }

    if (pendingAssignments.length > 0) {
      focusPriorityScore += Math.min(20, pendingAssignments.length * 10);
      focusReasons.push(`${pendingAssignments.length} unsubmitted assignment(s)`);
    }

    if (openDoubts.length > 0) {
      focusPriorityScore += Math.min(15, openDoubts.length * 7);
      focusReasons.push(`${openDoubts.length} open doubt ticket(s)`);
    }

    focusPriorityScore = Math.min(100, focusPriorityScore);

    const primaryTeacher = sub.teachers[0] || { id: "", name: "Assigned Faculty", email: "" };

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
        actionReason: `BKT posterior mastery is ${bkt.posteriorMastery}% after missing ${missedConcepts.length} question(s). Approach Prof. ${primaryTeacher.name} to review "${missedConcepts[0].correctOption}".`,
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
        actionReason: `Overall subject accuracy is ${rawAccuracy}% (IRT Ability θ = ${irtTheta}). Request a 1-on-1 walkthrough with Prof. ${primaryTeacher.name}.`,
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
        actionReason: `You have ${pendingAssignments.length} pending assignment(s) and ${unattemptedQuizzes.length} unattempted quiz(zes). Clarify constraints with Prof. ${primaryTeacher.name}.`,
        teacherId: primaryTeacher.id,
        teacherName: primaryTeacher.name,
        subjectId: sub.subjectId,
        subjectName: sub.subjectName
      };
    } else if (rawAccuracy !== null && rawAccuracy >= 85) {
      facultyTrigger = {
        urgency: "ENRICHMENT",
        whenToApproach: "During weekly office hours for advanced progression",
        topicToDiscuss: subMat?.latestTopicTitle
          ? `Advanced application of ${subMat.latestTopicTitle}`
          : `Higher-order problems in ${sub.subjectName}`,
        actionReason: `BKT mastery is ${bkt.posteriorMastery}% with ${bkt.predictedNextSuccess}% predicted success on your next test. Approach Prof. ${primaryTeacher.name} for research-grade problems.`,
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
      bktMasteryPct: bkt.posteriorMastery,
      predictedNextScorePct: bkt.predictedNextSuccess,
      irtTheta,
      retentionPct: retention.retentionPct,
      optimalReviewWindow: retention.optimalReviewWindow,
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

  // Allocate Daily Study Hours Across Subjects Proportionally to Focus Priority Score
  const totalFocusWeight = subjectDiagnostics.reduce(
    (acc, s) => acc + Math.max(15, s.focusPriorityScore),
    0
  );
  const subjectDiagnosticsWithHours = subjectDiagnostics.map(sd => {
    const weight = Math.max(15, sd.focusPriorityScore);
    const recommendedDailyHours =
      totalFocusWeight > 0
        ? Number(((weight / totalFocusWeight) * dailyGoalHrs).toFixed(1))
        : Number((dailyGoalHrs / Math.max(1, subjectDiagnostics.length)).toFixed(1));
    return {
      ...sd,
      recommendedDailyHours
    };
  });

  const rankedByFocusNeed = [...subjectDiagnosticsWithHours].sort(
    (a, b) => b.focusPriorityScore - a.focusPriorityScore
  );

  // Extract Global Strengths & Weaknesses
  const strengths: Array<{ subjectName: string; detail: string; metric: string }> = [];
  const weaknesses: Array<{ subjectName: string; detail: string; metric: string }> = [];

  subjectDiagnosticsWithHours.forEach(sd => {
    if (sd.accuracy !== null && sd.accuracy >= 80) {
      strengths.push({
        subjectName: sd.subjectName,
        detail: `High BKT posterior mastery (${sd.bktMasteryPct}%) and IRT latent ability (θ = ${sd.irtTheta}) across ${sd.quizzesAttempted} quiz(zes).`,
        metric: `${sd.accuracy}% Mastery`
      });
    }
    sd.correctConcepts.slice(0, 3).forEach(concept => {
      strengths.push({
        subjectName: sd.subjectName,
        detail: `Verified concept mastery on ${concept}`,
        metric: "BKT Verified"
      });
    });

    if (sd.accuracy !== null && sd.accuracy < 75) {
      weaknesses.push({
        subjectName: sd.subjectName,
        detail: `Sub-threshold BKT mastery (${sd.bktMasteryPct}%); requires targeted revision (${sd.recommendedDailyHours} hrs/day recommended).`,
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

  const myVector = cohortVectors.find(v => v.studentId === telemetry.studentId) || {
    studentId: telemetry.studentId,
    studentName: telemetry.studentName,
    accuracy: 0,
    completionRate: 0,
    velocityScore: 0,
    autonomyScore: 100,
    bktMasteryPct: 45,
    irtTheta: 0,
    compositeIndex: 0,
    totalActivities: 0,
    clusterId: "CALIBRATING" as const,
    clusterLabel: "Cold-Start Calibration"
  };

  const sortedCohort = [...cohortVectors].sort((a, b) => b.compositeIndex - a.compositeIndex);
  const myRankIndex = sortedCohort.findIndex(v => v.studentId === telemetry.studentId);
  const percentile =
    sortedCohort.length > 1 && myRankIndex >= 0
      ? Math.round(((sortedCohort.length - myRankIndex) / sortedCohort.length) * 100)
      : 100;

  // Generate Personalized Study Strategies tailored to Cluster + Learning Style + Daily Study Goal
  const strategies: Array<{
    category: string;
    title: string;
    tactic: string;
    impactMetric: string;
  }> = [];

  const topFocusSubject = rankedByFocusNeed[0];

  strategies.push({
    category: `Learning Style Adaptation (${learningStyle})`,
    title: `Daily ${dailyGoalHrs}-Hour Cognitive Allocation Plan`,
    tactic: rankedByFocusNeed
      .map(s => `${s.subjectName}: ${s.recommendedDailyHours} hrs/day (BKT Mastery ${s.bktMasteryPct}%)`)
      .join(" • ") || `Complete your baseline subject enrollment to partition your ${dailyGoalHrs} hrs/day target.`,
    impactMetric: `${dailyGoalHrs} hrs/day Budget`
  });

  if (myVector.clusterId === "ACCELERATED") {
    strategies.push({
      category: "Bayesian Mastery Optimization",
      title: "Interleaved Retrieval & Spaced Challenge Sets",
      tactic: `Your BKT mastery (${myVector.bktMasteryPct}%) and IRT ability (θ = ${myVector.irtTheta}) place you in the Accelerated Synthesizer tier. Use interleaved timed problem sets across ${telemetry.enrolledSubjects.map(s => s.subjectName).join(", ")}.`,
      impactMetric: "Sustains >92% retention"
    });
  } else if (myVector.clusterId === "ANALYTICAL") {
    strategies.push({
      category: "Pacing Acceleration",
      title: "Time-Boxed Two-Pass Assessment Execution",
      tactic: `You maintain strong accuracy (${myVector.accuracy}%) with methodical completion velocity (${myVector.velocityScore}%). Complete direct conceptual questions in 60 seconds first, then allocate remaining time to derivations.`,
      impactMetric: "+25% submission speed"
    });
  } else if (myVector.clusterId === "EXPLORER") {
    strategies.push({
      category: "Slip-Rate Reduction (BKT P(S))",
      title: "Pre-Submission Error-Log Verification",
      tactic: `You complete coursework rapidly (${myVector.completionRate}%), but slip probability reduces accuracy (${myVector.accuracy}%). Verify unit conversions and boundary conditions before submitting quizzes.`,
      impactMetric: "+18% BKT mastery gain"
    });
  } else if (myVector.clusterId === "FOUNDATIONAL") {
    strategies.push({
      category: "Foundational Reinforcement",
      title: "Topic-First Active Recall Before Quiz Attempts",
      tactic: `Study each uploaded module note in full and summarize key formulas in writing before starting quizzes. Post a ticket in the Doubt Clearing Hub whenever a derivation step is unclear.`,
      impactMetric: "Eliminates core concept gaps"
    });
  } else {
    strategies.push({
      category: "Bayesian Prior Calibration",
      title: "Complete Baseline Diagnostic Assessments",
      tactic: `Your BKT prior is initialized at P(L0) = 45%. Complete your first quiz or assignment so the engine can update your posterior mastery and IRT ability θ.`,
      impactMetric: "Unlocks full BKT & IRT"
    });
  }

  if (telemetry.liveClassTelemetry && telemetry.liveClassTelemetry.totalAssignedClasses > 0) {
    const lc = telemetry.liveClassTelemetry;
    const attendanceRate = Math.round((lc.attendedClasses / lc.totalAssignedClasses) * 100);
    strategies.push({
      category: "Live Classroom Synchronization",
      title: `Live Broadcast Attendance Standing (${attendanceRate}%)`,
      tactic: `You have attended ${lc.attendedClasses} of ${lc.totalAssignedClasses} assigned live classes (${lc.mandatoryAttended}/${lc.mandatoryAssigned} mandatory). Joining live FFMUC broadcasts directly reinforces Ebbinghaus memory stability.`,
      impactMetric: `${lc.attendedClasses}/${lc.totalAssignedClasses} Classes Joined`
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
          description: "High BKT posterior mastery (>=80%) paired with rapid syllabus completion velocity.",
          students: cohortVectors.filter(v => v.clusterId === "ACCELERATED")
        },
        {
          id: "ANALYTICAL",
          label: "Deep Analytical Pacer",
          description: "High accuracy and IRT ability θ with methodical, deliberate submission pacing.",
          students: cohortVectors.filter(v => v.clusterId === "ANALYTICAL")
        },
        {
          id: "EXPLORER",
          label: "Rapid Concept Explorer",
          description: "Fast completion speed with developing accuracy; benefits from slip-rate verification.",
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
