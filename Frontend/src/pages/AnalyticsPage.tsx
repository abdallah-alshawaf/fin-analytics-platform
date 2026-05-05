import React from 'react';
import Panel from '../components/ui/Panel';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { useAllocation, useSummary, useTimeSeries } from '../features/portfolio/hooks';
import { BarChart, Bar, CartesianGrid, Cell, Legend, PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#0f172a', '#1d4ed8', '#0f766e', '#c2410c', '#b91c1c'];

export default function AnalyticsPage() {
  const { data: balances, isLoading } = useSummary();
  const { data: allocation } = useAllocation();
  const { data: series } = useTimeSeries();

  if (isLoading) {
    return <Skeleton className="h-[34rem]" />;
  }

  const topMover = balances?.slice().sort((a: any, b: any) => (b.currentValue ?? 0) - (a.currentValue ?? 0))[0];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Insight</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Most influential asset</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{topMover ? `${topMover.assetSymbol} contributes the largest share of current value.` : 'No holdings available.'}</p>
        </Panel>
        <Panel>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Risk level</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Concentration profile</h3>
          <div className="mt-3"><Badge tone={allocation?.concentrationRisk ? 'warning' : 'success'}>{allocation?.concentrationRisk ? 'Elevated concentration' : 'Within target range'}</Badge></div>
        </Panel>
        <Panel>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Time horizon</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Default 90 days</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">The chart below uses the deterministic mock price service for repeatable local testing.</p>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Panel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Growth</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Portfolio value evolution</h3>
            </div>
            <Badge tone="info">Mongo aggregation</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={series ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="currentColor" />
                <YAxis tick={{ fontSize: 12 }} stroke="currentColor" />
                <Tooltip formatter={(value: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#0f172a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Allocation</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Asset distribution</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={allocation?.allocation ?? []} dataKey="percent" nameKey="assetSymbol" outerRadius={95} innerRadius={55} paddingAngle={3}>
                  {(allocation?.allocation ?? []).map((_: any, index: number) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}