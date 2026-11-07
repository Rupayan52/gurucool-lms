"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

const BANNER_THEMES: Record<string, { label: string; classes: string }> = {
  INDIGO_CYBER: {
    label: "Indigo Cyber",
    classes: "from-indigo-600 via-purple-600 to-slate-900"
  },
  EMERALD_QUANTUM: {
    label: "Emerald Quantum",
    classes: "from-emerald-600 via-teal-700 to-slate-900"
  },
  CRIMSON_NOVA: {
    label: "Crimson Nova",
    classes: "from-rose-600 via-orange-500 to-slate-900"
  },
  OCEANIC_DEEP: {
    label: "Oceanic Deep",
    classes: "from-blue-600 via-cyan-600 to-slate-900"
  }
};

export default function StudentProfileDossierPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "IDENTITY" | "ACADEMICS" | "GUARDIAN_LINKS" | "TRANSCRIPT"
  >("IDENTITY");

  const [user, setUser] = useState<any>(null);
  const [transcript, setTranscript] = useState<any>(null);

  // Modifiable Form State
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [headline, setHeadline] = useState("");
  const [institution, setInstitution] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [targetExam, setTargetExam] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [learningStyle, setLearningStyle] = useState("Visual & Derivation-First");
  const [dailyStudyGoalHrs, setDailyStudyGoalHrs] = useState<number>(4);
  const [availability, setAvailability] = useState("Available");
  const [careerGoals, setCareerGoals] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [bannerTheme, setBannerTheme] = useState("INDIGO_CYBER");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/profile");
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        const ext = data.extended || {};
        setUser(u);
        setTranscript(data.transcript);

        setName(u.name || "");
        setBio(u.bio || "");
        setAvatarUrl(u.avatarUrl || null);
        setHeadline(ext.headline || "");
        setInstitution(ext.institution || "");
        setAcademicLevel(ext.academicLevel || "");
        setTargetExam(ext.targetExam || "");
        setGraduationYear(ext.graduationYear || "");
        setPhone(ext.phone || "");
        setLocation(ext.location || "");
        setDateOfBirth(ext.dateOfBirth || "");
        setGuardianName(ext.guardianName || "");
        setGuardianPhone(ext.guardianPhone || "");
        setLearningStyle(ext.learningStyle || "Visual & Derivation-First");
        setDailyStudyGoalHrs(ext.dailyStudyGoalHrs ?? 4);
        setAvailability(ext.availability || "Available");
        setCareerGoals(ext.careerGoals || "");
        setLinkedinUrl(ext.linkedinUrl || "");
        setGithubUrl(ext.githubUrl || "");
        setPortfolioUrl(ext.portfolioUrl || "");
        setBannerTheme(ext.bannerTheme || "INDIGO_CYBER");

        try {
          const parsedSkills = JSON.parse(ext.skillsTags || "[]");
          setSkillsList(Array.isArray(parsedSkills) ? parsedSkills : []);
        } catch {
          setSkillsList([]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setAvatarUrl(base64);
      await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: base64 })
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddSkill = () => {
    const clean = newSkillInput.trim();
    if (!clean || skillsList.includes(clean)) return;
    setSkillsList(prev => [...prev, clean]);
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsList(prev => prev.filter(s => s !== skill));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          avatarUrl,
          headline,
          institution,
          academicLevel,
          targetExam,
          graduationYear,
          phone,
          location,
          dateOfBirth,
          guardianName,
          guardianPhone,
          learningStyle,
          dailyStudyGoalHrs,
          availability,
          careerGoals,
          skillsTags: skillsList,
          linkedinUrl,
          githubUrl,
          portfolioUrl,
          bannerTheme
        })
      });
      if (res.ok) {
        setSavedBanner(true);
        setTimeout(() => setSavedBanner(false), 3000);
        await fetchProfile();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="w-9 h-9 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Real-Time Profile Completeness Calculation
  const completenessFields = [
    name,
    avatarUrl,
    headline,
    bio,
    institution,
    academicLevel,
    targetExam,
    graduationYear,
    phone,
    location,
    dateOfBirth,
    guardianName,
    guardianPhone,
    careerGoals,
    skillsList.length > 0 ? "yes" : ""
  ];
  const filledCount = completenessFields.filter(f => Boolean(f && String(f).trim())).length;
  const completenessPct = Math.round((filledCount / completenessFields.length) * 100);

  const activeBannerClass =
    BANNER_THEMES[bannerTheme]?.classes || BANNER_THEMES.INDIGO_CYBER.classes;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      {/* ================================================================= */}
      {/* HERO BANNER, AVATAR UPLOAD & LIVE COMPLETENESS METER              */}
      {/* ================================================================= */}
      <div className="bg-[#1C1C24] rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
        {/* Customizable Gradient Cover */}
        <div className={`h-44 bg-gradient-to-r ${activeBannerClass} relative p-6 flex justify-between items-start`}>
          <div className="flex items-center gap-2 bg-black/35 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                availability === "Available"
                  ? "bg-emerald-400"
                  : availability === "In Deep Focus"
                  ? "bg-indigo-400"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-[11px] font-bold text-white">{availability}</span>
          </div>

          {/* Theme Switcher Pills */}
          <div className="flex items-center gap-2 bg-black/35 backdrop-blur-md p-1.5 rounded-full border border-white/10">
            {Object.entries(BANNER_THEMES).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => setBannerTheme(key)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                  bannerTheme === key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {/* Identity Bar Below Cover */}
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 -mt-16 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              {/* Avatar with Hover Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-3xl border-4 border-[#1C1C24] bg-[#252530] shadow-2xl overflow-hidden relative group cursor-pointer flex items-center justify-center shrink-0"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-indigo-400">
                    {name?.charAt(0)?.toUpperCase() || "S"}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white bg-indigo-600 px-3 py-1 rounded-full">
                    Upload Photo
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {name || "Student Scholar"}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
                    Verified Student
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-300">
                  {headline || "Add your academic headline (e.g., Biotechnology & Physics Scholar)"}
                </p>
                <p className="text-xs text-slate-400">
                  {user.email} {location ? `• ${location}` : ""} {institution ? `• ${institution}` : ""}
                </p>
              </div>
            </div>

            {/* Save Button & Profile Completeness Meter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="bg-[#13131A] border border-white/10 rounded-2xl px-4 py-3 min-w-[200px]">
                <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-slate-400">Dossier Completeness</span>
                  <span className="text-emerald-400">{completenessPct}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${completenessPct}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? "Saving Dossier..." : savedBanner ? "✓ Profile Saved" : "Save All Changes"}
              </button>
            </div>
          </div>

          {/* Quick Verified Academic KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
            <div className="bg-[#13131A] rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Enrolled Subjects
              </p>
              <p className="text-2xl font-black text-white mt-1">
                {transcript?.enrolledCourses?.length || 0}
              </p>
            </div>
            <div className="bg-[#13131A] rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Verified Quiz Avg
              </p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {transcript?.quizAverage !== null && transcript?.quizAverage !== undefined
                  ? `${transcript.quizAverage}%`
                  : "N/A"}
              </p>
            </div>
            <div className="bg-[#13131A] rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Assignment Avg
              </p>
              <p className="text-2xl font-black text-indigo-400 mt-1">
                {transcript?.assignmentAverage !== null && transcript?.assignmentAverage !== undefined
                  ? `${transcript.assignmentAverage}%`
                  : "N/A"}
              </p>
            </div>
            <div className="bg-[#13131A] rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Daily Study Target
              </p>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {dailyStudyGoalHrs} hrs/day
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 4-SECTION DOSSIER NAVIGATION TABS                                 */}
      {/* ================================================================= */}
      <div className="flex items-center gap-2 flex-wrap bg-[#1C1C24] p-2 rounded-2xl border border-white/10">
        {[
          { id: "IDENTITY", label: "1. Personal Identity & Bio" },
          { id: "ACADEMICS", label: "2. Academic Track, Skills & Study Preferences" },
          { id: "GUARDIAN_LINKS", label: "3. Guardian Contacts & Portfolio Links" },
          { id: "TRANSCRIPT", label: "4. Verified Live Academic Transcript" }
        ].map((t: any) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === t.id
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ================================================================= */}
      {/* TAB 1: PERSONAL IDENTITY & BIO                                    */}
      {/* ================================================================= */}
      {activeTab === "IDENTITY" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-[#1C1C24] rounded-3xl border border-white/10 p-8 space-y-6">
            <h2 className="text-lg font-black text-white border-b border-white/10 pb-4">
              Personal Identity & Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Full Legal / Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Live Presence Status
                </label>
                <select
                  value={availability}
                  onChange={e => setAvailability(e.target.value)}
                  className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Available">🟢 Available for Study & Mentorship</option>
                  <option value="In Deep Focus">🟣 In Deep Focus (Do Not Disturb)</option>
                  <option value="In Live Session">🔴 In Live Faculty Session</option>
                  <option value="Offline">⚪ Offline</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Academic Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  placeholder="e.g., B.Tech Biotechnology Scholar | Quantum Physics & Bioprocess Enthusiast"
                  className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Personal Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  City & State / Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g., Kolkata, West Bengal"
                  className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Registered Email (Verified)
                </label>
                <input
                  type="text"
                  readOnly
                  value={user.email}
                  className="w-full bg-[#13131A]/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#1C1C24] rounded-3xl border border-white/10 p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white border-b border-white/10 pb-4">
                About Me & Career Aspirations
              </h2>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Personal Biography
                </label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={4}
                  placeholder="Introduce yourself to your faculty mentors and batchmates..."
                  className="w-full bg-[#13131A] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Long-Term Career & Research Goals
                </label>
                <textarea
                  value={careerGoals}
                  onChange={e => setCareerGoals(e.target.value)}
                  rows={4}
                  placeholder="What are you working toward? (e.g., Cracking top national fellowships, publishing research, mastering computational biology...)"
                  className="w-full bg-[#13131A] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-md"
            >
              {saving ? "Saving..." : "Save Personal Identity"}
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: ACADEMIC TRACK, SKILLS & STUDY PREFERENCES                 */}
      {/* ================================================================= */}
      {activeTab === "ACADEMICS" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-[#1C1C24] rounded-3xl border border-white/10 p-8 space-y-6">
            <h2 className="text-lg font-black text-white border-b border-white/10 pb-4">
              Institution, Target Exam & Learning Calibration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  School / University / Institution Name
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  placeholder="e.g., Vellore Institute of Technology (VIT)"
                  className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Current Academic Level / Batch
                </label>
                <input
                  type="text"
                  value={academicLevel}
                  onChange={e => setAcademicLevel(e.target.value)}
                  placeholder="e.g., Undergraduate / Class 12 / Phygital Batch"
                  className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Target Examination / Major Track
                </label>
                <input
                  type="text"
                  value={targetExam}
                  onChange={e => setTargetExam(e.target.value)}
                  placeholder="e.g., GATE BT / JEE Advanced / Honours Research"
                  className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Expected Graduation / Exam Year
                </label>
                <input
                  type="text"
                  value={graduationYear}
                  onChange={e => setGraduationYear(e.target.value)}
                  placeholder="e.g., 2027"
                  className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Preferred Learning Style
                </label>
                <select
                  value={learningStyle}
                  onChange={e => setLearningStyle(e.target.value)}
                  className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Visual & Derivation-First">Visual & Derivation-First</option>
                  <option value="Problem-Solving & Numerical Intensive">Problem-Solving & Numerical Intensive</option>
                  <option value="Conceptual & Research Reading">Conceptual & Research Reading</option>
                  <option value="1-on-1 Interactive Mentorship">1-on-1 Interactive Mentorship</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Daily Self-Study Target (Hours / Day)
                  </label>
                  <span className="text-sm font-black text-indigo-400">{dailyStudyGoalHrs} Hours</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={14}
                  step={0.5}
                  value={dailyStudyGoalHrs}
                  onChange={e => setDailyStudyGoalHrs(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Skills & Academic Interests Tag Manager */}
          <div className="lg:col-span-5 bg-[#1C1C24] rounded-3xl border border-white/10 p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white border-b border-white/10 pb-4">
                Skills, Subjects & Research Tags
              </h2>
              <p className="text-xs text-slate-400">
                Add key subjects, programming tools, or lab competencies visible to your faculty mentors.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={e => setNewSkillInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                  placeholder="e.g., Organic Chemistry, Bioprocess, Python..."
                  className="flex-1 bg-[#13131A] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  + Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {skillsList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No skill tags added yet.</p>
                ) : (
                  skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-indigo-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-md"
            >
              {saving ? "Saving..." : "Save Academic Preferences"}
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: GUARDIAN CONTACTS & PORTFOLIO LINKS                        */}
      {/* ================================================================= */}
      {activeTab === "GUARDIAN_LINKS" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-[#1C1C24] rounded-3xl border border-white/10 p-8 space-y-5">
            <h2 className="text-lg font-black text-white border-b border-white/10 pb-4">
              Parent / Guardian Emergency & Progress Contact
            </h2>
            <p className="text-xs text-slate-400">
              Shared exclusively with verified faculty for academic progress reporting and mentorship updates.
            </p>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                Parent / Guardian Full Name
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={e => setGuardianName(e.target.value)}
                placeholder="Guardian Name"
                className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                Parent / Guardian Phone Number
              </label>
              <input
                type="text"
                value={guardianPhone}
                onChange={e => setGuardianPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#1C1C24] rounded-3xl border border-white/10 p-8 space-y-5">
            <h2 className="text-lg font-black text-white border-b border-white/10 pb-4">
              External Portfolio & Research Profiles
            </h2>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                GitHub / Lab Repository URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/yourusername"
                className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                Personal Website / Zenodo / Google Scholar URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={e => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#13131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-md"
            >
              {saving ? "Saving..." : "Save Contacts & Links"}
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 4: VERIFIED LIVE ACADEMIC TRANSCRIPT (READ-ONLY DB SYNC)      */}
      {/* ================================================================= */}
      {activeTab === "TRANSCRIPT" && (
        <div className="space-y-6">
          <div className="bg-[#1C1C24] rounded-3xl border border-white/10 p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Live PostgreSQL Ledger
                </span>
                <h2 className="text-xl font-black text-white mt-0.5">
                  Verified Course Enrollments & Assessment Transcript
                </h2>
              </div>
              <Link
                href="/dashboard/curriculum"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Open Coursework Portal →
              </Link>
            </div>

            {/* Enrolled Subjects List */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                Active Registered Subjects ({transcript?.enrolledCourses?.length || 0})
              </h3>
              {!transcript?.enrolledCourses || transcript.enrolledCourses.length === 0 ? (
                <p className="text-xs text-slate-500">No subjects enrolled yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {transcript.enrolledCourses.map((c: any) => (
                    <div
                      key={c.subjectId}
                      className="p-4 rounded-2xl bg-[#13131A] border border-white/10 flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="text-base font-black text-white capitalize">{c.subjectName}</h4>
                        <p className="text-xs text-indigo-400 font-bold mt-1">
                          Mentors:{" "}
                          {c.mentors?.length > 0
                            ? c.mentors.map((m: string) => `Prof. ${m}`).join(", ")
                            : "Pending"}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-3">
                        Enrolled {new Date(c.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Quiz & Assignment Records */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                  Recent Verified Quiz Attempts ({transcript?.quizzesCompleted || 0})
                </h3>
                {!transcript?.recentQuizAttempts || transcript.recentQuizAttempts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No quiz attempts recorded yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {transcript.recentQuizAttempts.map((att: any) => (
                      <div
                        key={att.id}
                        className="p-3.5 rounded-xl bg-[#13131A] border border-white/5 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{att.quiz?.title}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(att.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs">
                          {att.score}/{att.maxScore} (
                          {Math.round((att.score / att.maxScore) * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                  Recent Assignment Submissions ({transcript?.assignmentsSubmitted || 0})
                </h3>
                {!transcript?.recentSubmissions || transcript.recentSubmissions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No assignments submitted yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {transcript.recentSubmissions.map((sub: any) => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl bg-[#13131A] border border-white/5 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{sub.assignment?.title}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(sub.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        {sub.status === "GRADED" ? (
                          <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-black text-xs">
                            {sub.awardedMarks}/{sub.assignment?.maxMarks}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black text-[10px]">
                            Submitted
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
