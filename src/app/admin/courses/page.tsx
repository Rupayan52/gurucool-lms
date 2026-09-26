"use client";
import { useEffect, useState } from "react";

export default function AdminCourses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [newClassName, setNewClassName] = useState("");

  const fetchCourses = async () => {
    const res = await fetch("/api/admin/courses");
    if (res.ok) setClasses(await res.json());
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "CLASS", name: newClassName })
    });
    setNewClassName("");
    fetchCourses();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Course Builder</h1>
      
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Class</h2>
        <form onSubmit={handleCreateClass} className="flex gap-4">
          <input 
            type="text" 
            required 
            value={newClassName} 
            onChange={(e) => setNewClassName(e.target.value)} 
            placeholder="e.g., Class 11 - Commerce" 
            className="flex-1 border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors">
            Create Class
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {classes.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xl font-black text-blue-700 mb-4">{c.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {c.subjects.map((s: any) => (
                <div key={s.id} className="border border-slate-100 bg-slate-50 rounded-xl p-4">
                  <div className="font-bold text-slate-900">{s.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.chapters.length} Chapters</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
