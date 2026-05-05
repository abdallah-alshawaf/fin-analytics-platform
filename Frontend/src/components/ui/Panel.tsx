import React from 'react';

export default function Panel({ className = '', children }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <section className={`rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-[0_20px_60px_rgba(2,6,23,0.5)] ${className}`}>
      {children}
    </section>
  );
}