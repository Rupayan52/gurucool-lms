"use client";
import React, { useEffect, useState } from "react";

export default function TeacherDoubtClearingHub() {
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("OPEN");

  const [answerMap, setAnswerMap] = useState<Record<string, { text: string; file: File | null; includeMeet: boolean }>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeacherDoubts();
  }, []);

  const fetchTeacherDoubts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doubts?role=teacher");
      if (res.ok) {
        const data = await res.json();
        setDoubts(data.doubts || []);
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

  const handleResolveDoubt = async (doubtId: string) => {
    const state = answerMap[doubtId];
    if (!state || !state.text?.trim()) {
      alert("Please write an explanation before resolving this doubt.");
      return;
    }
    setSubmittingId(doubtId);

    let teacherFileUrl = null, teacherFileName = null, teacherFileType = null;
    if (state.file) {
      teacherFileUrl = await fileToBase64(state.file);
      teacherFileName = state.file.name;
      teacherFileType = state.file.type;
    }

    const res = await fetch("/api/doubts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ANSWER_DOUBT",
        doubtId,
        teacherAnswer: state.text,
        teacherFileUrl,
        teacherFileName,
        teacherFileType,
        includeMeetLink: state.includeMeet
      })
    });

    if (res.ok) {
      await fetchTeacherDoubts();
    }
    setSubmittingId(null);
  };

  const filtered = doubts.filter(d => filter === "ALL" ? true : d.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Doubt Clearing Desk</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Review student doubts across your subjects, upload worked solutions, and issue instant 1-on-1 FFMUC links.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(["OPEN", "RESOLVED", "ALL"] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === st ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md" : "bg-white text-slate-600 border border-slate-200"}`}
              >
                {st} ({st === "ALL" ? doubts.length : doubts.filter(d => d.status === st).length})
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <p className="text-sm font-bold text-slate-400">No {filter.toLowerCase()} student doubts at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map(d => {
              const current = answerMap[d.id] || {
                text: d.teacherAnswer || "",
                file: null,
                includeMeet: Boolean(d.meetingLink)
              };

              return (
                <div key={d.id} className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-0.5 rounded-full bg-pink-50 text-pink-600 text-[10px] font-black uppercase">
                          {d.subjectName}
                        </span>
                        <span className="text-xs font-bold text-slate-700">{d.student?.name}</span>
                        <span className="text-xs text-slate-400">({d.student?.email})</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900">{d.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">{new Date(d.createdAt).toLocaleString()}</span>
                      {d.status === "RESOLVED" ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">Resolved</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-black">Needs Answer</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Student Question Details</p>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{d.description}</p>
                    {d.studentFileUrl && (
                      <div className="pt-2">
                        {d.studentFileType?.startsWith("image/") ? (
                          <img src={d.studentFileUrl} alt="Student problem" className="max-h-64 rounded-xl border border-slate-200" />
                        ) : (
                          <a href={d.studentFileUrl} download={d.studentFileName || "student-doubt"} className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3.5 py-2 rounded-xl border border-indigo-100">
                            Download Student Attachment ({d.studentFileName || "File"})
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Teacher Answer Box */}
                  <div className="space-y-4 pt-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      {d.status === "RESOLVED" ? "Update Faculty Solution" : "Write Step-by-Step Solution"}
                    </label>
                    <textarea
                      value={current.text}
                      onChange={e => setAnswerMap(prev => ({
                        ...prev,
                        [d.id]: { ...current, text: e.target.value }
                      }))}
                      rows={4}
                      placeholder="Write a clear explanation or derivation for the student..."
                      className="w-full border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 focus:outline-none focus:border-pink-500 resize-none"
                    />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <input
                          type="file"
                          onChange={e => setAnswerMap(prev => ({
                            ...prev,
                            [d.id]: { ...current, file: e.target.files?.[0] || null }
                          }))}
                          className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-pink-50 file:text-pink-600"
                        />

                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={current.includeMeet}
                            onChange={e => setAnswerMap(prev => ({
                              ...prev,
                              [d.id]: { ...current, includeMeet: e.target.checked }
                            }))}
                            className="rounded border-slate-300"
                          />
                          Attach 1-on-1 FFMUC Live Room Link
                        </label>
                      </div>

                      <button
                        onClick={() => handleResolveDoubt(d.id)}
                        disabled={submittingId === d.id}
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
                      >
                        {submittingId === d.id ? "Publishing Solution..." : d.status === "RESOLVED" ? "Update Solution" : "Send Solution & Mark Resolved"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
