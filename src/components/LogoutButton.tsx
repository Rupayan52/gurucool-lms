"use client";
import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    // 1. Hit the secure API to shred the HttpOnly cookies on the server
    await fetch("/api/auth/logout", { method: "POST" });
    
    // 2. Force a hard window redirect to clear Next.js client-side router cache
    window.location.href = "/login";
  };

  return (
    <button 
      onClick={handleLogout} 
      disabled={loading}
      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-white hover:bg-red-600/90 rounded-xl transition-all font-bold group disabled:opacity-50"
    >
      <svg className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
      </svg>
      <span>{loading ? "Terminating..." : "Sign Out"}</span>
    </button>
  );
}
