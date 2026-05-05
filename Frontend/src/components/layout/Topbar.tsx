import React from 'react';
import client from '../../api/client';
import useStore, { PageId } from '../../store/useStore';

const mobileNav: { id: PageId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' }
];

export default function Topbar() {
  const activePage = useStore((s) => s.activePage);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const clearSession = useStore((s) => s.clearSession);
  const setAccessToken = useStore((s) => s.setAccessToken);

  const logout = async () => {
    try {
      await client.fetcher('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // ignore logout network errors in dev
    } finally {
      localStorage.removeItem('accessToken');
      setAccessToken(null);
      clearSession();
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 px-4 py-4 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70 md:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Multi-account investment platform</p>
          <h2 className="mt-1 text-xl font-semibold capitalize text-slate-950 dark:text-white">{activePage}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800" type="button">
              3 alerts
            </button>
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800" onClick={toggleTheme} type="button">
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </button>
            <button className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" onClick={logout} type="button">
              Logout
            </button>
          </div>
        </div>
        <nav className="grid gap-2 md:hidden sm:grid-cols-2">
          {mobileNav.map((item) => {
            const active = item.id === activePage;
            return (
              <button
                key={item.id}
                className={`rounded-2xl border px-3 py-2 text-sm font-medium transition ${active ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                onClick={() => useStore.getState().setActivePage(item.id)}
                type="button"
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}