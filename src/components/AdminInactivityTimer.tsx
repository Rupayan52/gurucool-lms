"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminInactivityTimer() {
  const router = useRouter();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Log out after 5 minutes (300,000 milliseconds) of inactivity
      timeoutId = setTimeout(async () => {
        await fetch("/api/admin/auth", { method: "DELETE" });
        router.push("/admin-login?timeout=true");
      }, 300000);
    };

    // Listen for any form of activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    // Start timer on load
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [router]);

  return null; // This component is invisible
}
