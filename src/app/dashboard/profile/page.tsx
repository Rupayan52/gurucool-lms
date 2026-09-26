"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserProfile = {
  name: string;
  email: string;
  role: string;
  subscription: string;
  createdAt: string;
  hasActiveRequest: boolean;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchProfile = async () => {
    const res = await fetch("/api/auth/profile");
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleRequestDeletion = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/auth/request-deletion", { method: "POST" });
    if (res.ok) {
      setMessage("Deletion request sent! Contact admin for your 6-digit PIN.");
      fetchProfile();
    } else {
      setError("Failed to submit request");
    }
    setLoading(false);
  };

  const handleConfirmDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/delete-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin })
    });
    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "Incorrect PIN");
      setLoading(false);
    }
  };

  if (!profile) return <div className="p-8 text-slate-500 animate-pulse">Loading profile...</div>;

  return (
    <div className="max-w-2xl animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Profile</h1>
        <p className="mt-2 text-slate-500">Manage your account details and security settings.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Username</label>
            <div className="text-lg font-semibold text-slate-900">{profile.name}</div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Address</label>
            <div className="text-lg font-semibold text-slate-900">{profile.email}</div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Account Role</label>
            <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">{profile.role}</div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Subscription Plan</label>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">{profile.subscription}</div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-red-900 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-600 mb-6">Permanently delete your account and all associated data from GuruCool.</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}
        {message && <div className="bg-emerald-100 text-emerald-700 p-3 rounded-lg text-sm mb-4">{message}</div>}

        {!profile.hasActiveRequest ? (
          <button 
            onClick={handleRequestDeletion}
            disabled={loading}
            className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm"
          >
            Request Account Deletion PIN
          </button>
        ) : (
          <form onSubmit={handleConfirmDeletion} className="space-y-4">
            <p className="text-xs text-red-700 font-medium">A deletion request is active. Enter the 6-digit PIN provided by your admin:</p>
            <div className="flex gap-4">
              <input 
                type="text" 
                maxLength={6}
                placeholder="Enter 6-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                className="border border-red-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 tracking-widest font-mono text-lg"
              />
              <button 
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm"
              >
                Confirm & Delete
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
