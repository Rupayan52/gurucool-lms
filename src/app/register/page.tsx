"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [role, setRole] = useState("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (res.ok) {
      router.push(data.role === "TEACHER" ? "/teacher" : "/dashboard");
    } else {
      alert(data.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="text-3xl font-black tracking-tighter mb-2"><span className="text-blue-600">Guru</span>Cool.</div>
          <p className="text-slate-500 font-medium">Create your elite learning account.</p>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
          <button onClick={() => setRole("STUDENT")} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === "STUDENT" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Scholar</button>
          <button onClick={() => setRole("TEACHER")} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === "TEACHER" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Faculty</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} minLength={6} className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:border-blue-500 font-medium" />
          </div>
          <button type="submit" disabled={loading} className="w-full text-white font-bold py-4 rounded-xl transition-all shadow-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Provisioning..." : "Create Account"}
          </button>
        </form>
        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in to SSO Gateway</Link>
        </div>
      </div>
    </div>
  );
}
