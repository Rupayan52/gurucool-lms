"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Handle timeout messages
  useEffect(() => {
    if (window.location.search.includes("timeout=true")) {
      setError("Session expired due to inactivity. Please log in again.");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-emerald-400 tracking-tight mb-2">GuruCool.</h1>
          <p className="text-slate-400 text-sm">Control Center Access</p>
        </div>
        
        {error && (
          <div className="bg-red-950/50 border border-red-900 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Admin ID</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:border-emerald-500 outline-none transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Security Key</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 focus:border-emerald-500 outline-none transition-colors" 
            />
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-colors">
            Authorize Entry
          </button>
        </form>
      </div>
      <div className="mt-8 text-center">
        <Link href="/login" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
          ← Return to Student App
        </Link>
      </div>
    </div>
  );
}
