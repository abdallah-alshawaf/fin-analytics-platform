import React from 'react';
import useStore, { PageId } from '../../store/useStore';

const items: { id: PageId; label: string; short: string }[] = [
  { id: 'dashboard', label: 'Dashboard', short: 'DB' },
  { id: 'accounts', label: 'Accounts', short: 'AC' },
  { id: 'transactions', label: 'Transactions', short: 'TX' },
  { id: 'analytics', label: 'Analytics', short: 'AN' },
  { id: 'settings', label: 'Settings', short: 'ST' }
];

export default function Sidebar() {
  const activePage = useStore((s) => s.activePage);
  const setActivePage = useStore((s) => s.setActivePage);
  const collapsed = useStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);

  return (
    <aside className={`hidden border-r border-slate-200 bg-white/90 px-3 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 md:flex md:flex-col md:gap-6 ${collapsed ? 'md:w-24' : 'md:w-72'}`}>
      <div className="flex items-center justify-between gap-3 px-2">
        <div className={`transition-all ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Alvea Capital</p>
          <h1 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Portfolio OS</h1>
        </div>
        <button className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900" onClick={toggleSidebar} type="button">
          {collapsed ? '»' : '«'}
        </button>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const active = item.id === activePage;
          return (
            <button
              key={item.id}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${active ? 'bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}
              onClick={() => setActivePage(item.id)}
              type="button"
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold ${active ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-800'}`}>{item.short}</span>
              <span className={`transition-all ${collapsed ? 'hidden' : 'inline'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={`mt-auto rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-700 p-4 text-white shadow-xl dark:border-slate-800 ${collapsed ? 'hidden' : 'block'}`}>
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Real-time view</p>
        <p className="mt-2 text-sm leading-6 text-white/80">Multi-account balances, weighted cost basis, and portfolio growth with MongoDB-backed data.</p>
      </div>
    </aside>
  );
}