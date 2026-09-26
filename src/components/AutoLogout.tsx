"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoLogout({ timeoutMinutes = 15 }: { timeoutMinutes?: number }) {
  const router = useRouter();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const logout = async () => {
      // Securely destroy the session cookie on the server
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Convert minutes to milliseconds
      timeoutId = setTimeout(logout, timeoutMinutes * 60 * 1000);
    };

    // Listen for any signs of life from the student
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Start the timer immediately upon loading
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(timeoutId);
    };
  }, [router, timeoutMinutes]);

  return null; // This is an invisible background worker
}
