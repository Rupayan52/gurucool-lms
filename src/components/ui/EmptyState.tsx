import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="gc-glass-card rounded-3xl p-10 text-center space-y-5 my-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto text-2xl font-black shadow-inner">
        ✦
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-xl font-black text-white">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
      {actionLabel && (actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all"
        >
          {actionLabel}
        </button>
      ))}
    </div>
  );
}
