import React from 'react';
import { useSummary, useAllocation, useTimeSeries } from './hooks';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Panel from '../../components/ui/Panel';
import Badge from '../../components/ui/Badge';

const COLORS = ['#4f46e5', '#06b6d4', '#f97316', '#10b981', '#ef4444'];

export default function PortfolioOverview() {
  const { data: balances, isLoading } = useSummary();
  const { data: allocation } = useAllocation();
  const { data: series } = useTimeSeries();

  if (isLoading) return <div className="p-4 text-slate-500">Loading portfolio...</div>;

  const total = balances?.reduce((s: number, b: any) => s + (b.currentValue ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Total balance</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">${total.toFixed(2)}</h2>
          </div>
          <Badge tone="info">Live analytics</Badge>
        </div>
      </Panel>

      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Growth curve</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Portfolio value over time</h3>
          </div>
        </div>
        <div className="h-80">
        <ResponsiveContainer>
          <AreaChart data={series ?? []}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="mb-2 text-base font-semibold text-slate-950 dark:text-white">Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={allocation?.allocation ?? []} dataKey="percent" nameKey="assetSymbol" outerRadius={70} label>
                  {(allocation?.allocation ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <h3 className="mb-2 text-base font-semibold text-slate-950 dark:text-white">Holdings</h3>
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {(balances ?? []).map((b: any) => (
              <li key={b.assetSymbol} className="flex justify-between py-3 text-sm">
                <span className="text-slate-700 dark:text-slate-300">{b.assetSymbol} ({b.netQuantity})</span>
                <span className="font-medium text-slate-950 dark:text-white">${(b.currentValue ?? 0).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
