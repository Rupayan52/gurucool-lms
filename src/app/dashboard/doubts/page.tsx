"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface EnrolledCohort {
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
}

export default function StudentDoubtClearingHub() {
  const [cohorts, setCohorts] = useState<EnrolledCohort[]>([]);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Compose Doubt Form State
  const [selectedCohortKey, setSelectedCohortKey] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
  const [followUpMap, setFollowUpMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDoubtsData();
  }, []);

  const fetchDoubtsData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doubts?role=student");
      if (res.ok) {
        const data = await res.json();
        const cohortList: EnrolledCohort[] = data.enrolledCohorts || [];
        setCohorts(cohortList);
        setDoubts(data.doubts || []);
        if (cohortList.length > 0 && !selectedCohortKey) {
          setSelectedCohortKey(`${cohortList[0].subjectId}:::${cohortList[0].teacherId}`);
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

  const activeCohortObj = cohorts.find(
    c => `${c.subjectId}:::${c.teacherId}` === selectedCohortKey
  ) || null;

  const handleSubmitDoubt = async () => {
    if (!activeCohortObj || !title.trim() || !description.trim()) return;
    setSubmitting(true);

    let studentFileUrl = null, studentFileName = null, studentFileType = null;
    if (attachment) {
      studentFileUrl = await fileToBase64(attachment);
      studentFileName = attachment.name;
      studentFileType = attachment.type;
    }

    const res = await fetch("/api/doubts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE_DOUBT",
        subjectId: activeCohortObj.subjectId,
        teacherId: activeCohortObj.teacherId,
        title,
        description,
        studentFileUrl,
        studentFileName,
        studentFileType
      })
    });

    if (res.ok) {
      setTitle("");
      setDescription("");
      setAttachment(null);
      await fetchDoubtsData();
    }
    setSubmitting(false);
  };

  const handleReopenDoubt = async (doubtId: string) => {
    const followUpText = followUpMap[doubtId] || "";
    const res = await fetch("/api/doubts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "REOPEN_DOUBT", doubtId, followUpText })
    });
    if (res.ok) {
      setFollowUpMap(prev => ({ ...prev, [doubtId]: "" }));
      await fetchDoubtsData();
    }
  };

  const filteredDoubts = doubts.filter(d => statusFilter === "ALL" ? true : d.status === statusFilter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Doubt Clearing Hub</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Submit subject-specific doubts directly to your assigned faculty and receive step-by-step solutions or 1-on-1 FFMUC video links.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            {doubts.filter(d => d.status === "OPEN").length} Open
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            {doubts.filter(d => d.status === "RESOLVED").length} Resolved
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: COMPOSE A DOUBT */}
        <div className="lg:col-span-5">
          <div className="bg-[#1C1C24] rounded-3xl border border-white/10 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Compose a Doubt</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Direct Faculty Sync</span>
            </div>

            {cohorts.length === 0 ? (
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-3">
                <p className="font-bold">You are not enrolled in any active subject cohorts yet.</p>
                <Link href="/dashboard/catalog" className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs">
                  Visit Course Catalog →
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Select Registered Course
                    </label>
                    <select
                      value={selectedCohortKey}
                      onChange={e => setSelectedCohortKey(e.target.value)}
                      className="w-full bg-[#13131A] border border-white/10 rounded-xl px-3.5 py-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                    >
                      {cohorts.map((c, idx) => (
                        <option key={idx} value={`${c.subjectId}:::${c.teacherId}`}>
                          {c.subjectName} (Prof. {c.teacherName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Assigned Faculty
                    </label>
                    <div className="w-full bg-[#13131A] border border-white/10 rounded-xl px-3.5 py-3 text-xs font-bold text-emerald-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      {activeCohortObj ? `Prof. ${activeCohortObj.teacherName}` : "Select Course"}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Question Summary / Topic
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g., Confusion in Nernst Equation log base conversion"
                    className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Detailed Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Explain what step you are stuck on..."
                    className="w-full bg-[#13131A] border border-white/10 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Attach Problem Screenshot / PDF (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={e => setAttachment(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30"
                  />
                </div>

                <button
                  onClick={handleSubmitDoubt}
                  disabled={submitting || !title.trim() || !description.trim()}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {submitting ? "Submitting Doubt to Faculty..." : "Submit Doubt"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: MY DOUBT TICKETS & FACULTY SOLUTIONS */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">My Submitted Doubts ({filteredDoubts.length})</h2>
            <div className="flex items-center gap-2">
              {(["ALL", "OPEN", "RESOLVED"] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === st ? "bg-indigo-600 text-white" : "bg-[#1C1C24] text-slate-400 hover:text-white border border-white/5"}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {filteredDoubts.length === 0 ? (
            <div className="bg-[#1C1C24] rounded-3xl border border-white/10 p-12 text-center">
              <p className="text-sm font-bold text-slate-400">No doubts found in this view. Post a question on the left to get started!</p>
            </div>
          ) : (
            filteredDoubts.map(d => (
              <div key={d.id} className="bg-[#1C1C24] rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase">
                        {d.subjectName}
                      </span>
                      <span className="text-xs font-bold text-slate-400">• Assigned to Prof. {d.teacherName}</span>
                    </div>
                    <h3 className="text-base font-black text-white">{d.title}</h3>
                  </div>

                  {d.status === "RESOLVED" ? (
                    <span className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                      ✓ Resolved by Faculty
                    </span>
                  ) : (
                    <span className="px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black">
                      ⏳ Awaiting Faculty Response
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{d.description}</p>

                {d.studentFileUrl && (
                  <div>
                    {d.studentFileType?.startsWith("image/") ? (
                      <img src={d.studentFileUrl} alt="Student attachment" className="max-h-56 rounded-2xl border border-white/10 mt-2" />
                    ) : (
                      <a href={d.studentFileUrl} download={d.studentFileName || "attachment"} className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3.5 py-2 rounded-xl border border-indigo-500/20">
                        Your Attachment: {d.studentFileName || "Download File"}
                      </a>
                    )}
                  </div>
                )}

                {d.status === "RESOLVED" && d.teacherAnswer && (
                  <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        Faculty Solution • Prof. {d.teacherName}
                      </span>
                      {d.resolvedAt && (
                        <span className="text-[10px] text-slate-400">{new Date(d.resolvedAt).toLocaleString()}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">{d.teacherAnswer}</p>

                    {d.teacherFileUrl && (
                      <div className="pt-2">
                        {d.teacherFileType?.startsWith("image/") ? (
                          <img src={d.teacherFileUrl} alt="Solution attachment" className="max-h-60 rounded-2xl border border-emerald-500/20" />
                        ) : (
                          <a href={d.teacherFileUrl} download={d.teacherFileName || "solution"} className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-4 py-2 rounded-xl">
                            Download Faculty Solution File ({d.teacherFileName || "Attachment"})
                          </a>
                        )}
                      </div>
                    )}

                    {d.meetingLink && (
                      <div className="pt-2">
                        <a
                          href={d.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
                        >
                          Join 1-on-1 FFMUC Doubt Breakdown Room →
                        </a>
                      </div>
                    )}

                    {/* Follow-up option if student still has a question */}
                    <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={followUpMap[d.id] || ""}
                        onChange={e => setFollowUpMap(prev => ({ ...prev, [d.id]: e.target.value }))}
                        placeholder="Still need clarity? Add a follow-up note to reopen..."
                        className="flex-1 bg-[#13131A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <button
                        onClick={() => handleReopenDoubt(d.id)}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                      >
                        Reopen Doubt
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
