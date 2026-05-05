import React from 'react';

export default function StatCard({ label, value, hint, delta, accent = 'from-slate-950 to-slate-700' }: { label: string; value: string; hint?: string; delta?: string; accent?: string; }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className={`mb-4 h-1.5 w-20 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</div>
          {hint && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
        </div>
        {delta && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">{delta}</span>}
      </div>
    </div>
  );
}