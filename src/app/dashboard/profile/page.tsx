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
  
  // Password change states
  const [newPassword, setNewPassword] = useState("");
  const [passMessage, setPassMessage] = useState("");
  const [passError, setPassError] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  
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

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassError("");
    setPassMessage("");

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });

    if (res.ok) {
      setPassMessage("Password updated successfully.");
      setNewPassword("");
    } else {
      const data = await res.json();
      setPassError(data.error || "Failed to update password.");
    }
    setPassLoading(false);
  };

  const handleRequestDeletion = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/auth/request-deletion", { method: "POST" });
    if (res.ok) {
      setMessage("Request sent. Contact admin for your PIN.");
      fetchProfile();
    } else {
      setError("Failed to submit request.");
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
      setError(data.error || "Incorrect PIN.");
      setLoading(false);
    }
  };

  if (!profile) return <div className="p-8 text-slate-500 animate-pulse">Loading profile...</div>;

  return (
    <div className="max-w-3xl animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Profile</h1>
        <p className="mt-2 text-slate-500">Manage your account details and security settings.</p>
      </header>

      {/* Profile Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Username</label>
            <div className="text-base font-semibold text-slate-900">{profile.name}</div>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
            <div className="text-base font-semibold text-slate-900">{profile.email}</div>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role</label>
            <div className="inline-block px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">{profile.role}</div>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Plan</label>
            <div className="inline-block px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">{profile.subscription}</div>
          </div>
        </div>
      </div>

      {/* Unified Security Settings Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-6 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Security Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Update your password or manage your account status.</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Change Password Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Change Password</h3>
            {passError && <div className="text-red-600 text-xs font-medium mb-3">{passError}</div>}
            {passMessage && <div className="text-emerald-600 text-xs font-medium mb-3">{passMessage}</div>}
            <form onSubmit={handlePasswordUpdate} className="flex gap-3 max-w-sm">
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={passLoading}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors text-sm disabled:opacity-70"
              >
                {passLoading ? "Saving..." : "Update"}
              </button>
            </form>
          </div>

          <hr className="border-slate-100" />

          {/* Account Deletion Section */}
          <div>
            <h3 className="text-sm font-bold text-red-600 mb-1">Delete Account</h3>
            <p className="text-xs text-slate-500 mb-4 max-w-lg">Permanently remove your account and all associated learning data. This action cannot be undone.</p>
            
            {error && <div className="text-red-600 text-xs font-medium mb-3">{error}</div>}
            {message && <div className="text-emerald-600 text-xs font-medium mb-3">{message}</div>}

            {!profile.hasActiveRequest ? (
              <button 
                onClick={handleRequestDeletion}
                disabled={loading}
                className="px-4 py-2 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors text-sm"
              >
                Request Deletion PIN
              </button>
            ) : (
              <form onSubmit={handleConfirmDeletion} className="flex gap-3 max-w-sm">
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="6-digit admin PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  className="w-36 border border-red-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm tracking-widest bg-red-50/30"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Confirm Delete
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
