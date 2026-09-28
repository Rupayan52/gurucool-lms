"use client";
import { useEffect, useState } from "react";

export default function BatchManager() {
  const [data, setData] = useState<any>(null);

  const loadData = () => fetch("/api/admin/enrollments").then(r => r.json()).then(setData);
  useEffect(() => { loadData(); }, []);

  const handleEnrollment = async (studentId: string, subjectId: string, teacherId: string) => {
    await fetch("/api/admin/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, subjectId, teacherId })
    });
    loadData();
  };

  if (!data) return <div className="p-10 animate-pulse font-bold text-slate-400">Loading Enterprise Batch Matrix...</div>;

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Batch Matrix Manager</h1>
        <p className="mt-2 text-slate-500 font-medium text-lg">Assign specific scholars to specific faculty cohorts.</p>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest">
                <th className="p-6">Scholar Identity</th>
                {data.subjects.map((sub: any) => <th key={sub.id} className="p-6 text-blue-600">{sub.name} Cohort</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.students.map((student: any) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-slate-900">{student.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{student.email}</div>
                  </td>
                  {data.subjects.map((sub: any) => {
                    const currentEnrollment = data.enrollments.find((e: any) => e.studentId === student.id && e.subjectId === sub.id);
                    return (
                      <td key={sub.id} className="p-6">
                        <select 
                          value={currentEnrollment?.teacherId || ""}
                          onChange={(e) => handleEnrollment(student.id, sub.id, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 shadow-sm"
                        >
                          <option value="" disabled>Unassigned</option>
                          {data.teachers.map((t: any) => <option key={t.id} value={t.id}>Prof. {t.name}</option>)}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
