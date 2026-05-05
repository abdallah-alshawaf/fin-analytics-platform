import React from 'react';
import Panel from '../components/ui/Panel';
import Badge from '../components/ui/Badge';
import useStore from '../store/useStore';

export default function SettingsPage() {
  const theme = useStore((s) => s.theme);
  const selectedAccountId = useStore((s) => s.selectedAccountId);
  const accessToken = useStore((s) => s.accessToken);
  const toggleTheme = useStore((s) => s.toggleTheme);

  return (
    <div className="space-y-6 animate-fade-up">
      <Panel>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Preferences</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Theme and session settings</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Keep the interface in dark or light mode, and review the current account context used for transactions.</p>
          </div>
          <Badge tone={theme === 'dark' ? 'info' : 'neutral'}>{theme} mode</Badge>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h4 className="text-base font-semibold text-slate-950 dark:text-white">Appearance</h4>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Switch between a premium dark and light fintech look.</p>
          <button className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950" onClick={toggleTheme} type="button">
            Toggle theme
          </button>
        </Panel>

        <Panel>
          <h4 className="text-base font-semibold text-slate-950 dark:text-white">Session context</h4>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>Access token: {accessToken ? 'loaded' : 'missing'}</p>
            <p>Selected account: {selectedAccountId || 'none'}</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}