import React from 'react';
import Login from './features/auth/Login';
import useStore from './store/useStore';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import TransactionsPage from './pages/TransactionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import Panel from './components/ui/Panel';

export default function App() {
  const accessToken = useStore((s) => s.accessToken) ?? localStorage.getItem('accessToken');
  const theme = useStore((s) => s.theme);
  const activePage = useStore((s) => s.activePage);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const page = (() => {
    switch (activePage) {
      case 'accounts':
        return <AccountsPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  })();

  if (!accessToken) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.1),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(37,99,235,0.12),_transparent_30%),linear-gradient(to_bottom_right,_rgba(255,255,255,0.7),_rgba(248,250,252,0.95))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.08),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(37,99,235,0.16),_transparent_30%),linear-gradient(to_bottom_right,_rgba(2,6,23,0.98),_rgba(15,23,42,0.95))]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
              Multi-account portfolio intelligence
            </div>
            <div className="max-w-2xl space-y-5">
              <h1 className="text-5xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-6xl">Modern fintech UI for real portfolio operations</h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">Sign in to access dashboards, accounts, transaction routing, analytics, and settings with a Stripe-like premium layout and live MongoDB-backed data.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Panel className="p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Precision</p>
                <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">Decimal128-friendly flows</p>
              </Panel>
              <Panel className="p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Analytics</p>
                <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">Growth, allocation, ROI</p>
              </Panel>
              <Panel className="p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Security</p>
                <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">JWT + cookie refresh</p>
              </Panel>
            </div>
          </div>
          <div className="mx-auto w-full max-w-xl">
            <Panel className="p-8">
              <div className="mb-8 space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Portfolio Access</p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Sign in to open your dashboard</h2>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">Your portfolio, transactions, and analytics stay hidden until authentication succeeds.</p>
              </div>
              <Login />
            </Panel>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">{page}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
