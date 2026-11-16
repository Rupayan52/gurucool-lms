import React from "react";

export function SkeletonCard() {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-4 animate-in fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl gc-skeleton flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-3/4 gc-skeleton rounded-lg" />
          <div className="h-3 w-1/2 gc-skeleton rounded-lg" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full gc-skeleton rounded-lg" />
        <div className="h-3 w-5/6 gc-skeleton rounded-lg" />
      </div>
    </div>
  );
}
