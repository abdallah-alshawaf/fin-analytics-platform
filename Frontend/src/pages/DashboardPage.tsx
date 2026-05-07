import React from 'react';
import { useAllocation, useSummary } from '../features/portfolio/hooks';
import { useTransactions } from '../features/transactions/hooks';
import Panel from '../components/ui/Panel';
import StatCard from '../components/ui/StatCard';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0f172a', '#2563eb', '#14b8a6', '#f59e0b', '#ef4444'];

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);

const ACCOUNT_LINE_COLORS = ['#0f172a', '#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const { data: balances, isLoading } = useSummary();
  const { data: allocation } = useAllocation();
  const { data: transactions = [] } = useTransactions();
  const accountGrowth = React.useMemo(() => {
    const valid = (transactions || []).filter((tx: any) => tx?.date && tx?.accountName && tx?.quantity && tx?.priceAtDate);
    const byDate = new Map<string, Record<string, number>>();

    valid.forEach((tx: any) => {
      const day = new Date(tx.date).toISOString().slice(0, 10);
      const account = String(tx.accountName);
      const notional = Number(tx.quantity) * Number(tx.priceAtDate);
      const delta = tx.type === 'SELL' ? -notional : notional;

      if (!byDate.has(day)) byDate.set(day, {});
      const dateRow = byDate.get(day)!;
      dateRow[account] = (dateRow[account] ?? 0) + delta;
    });

    const dates = Array.from(byDate.keys()).sort((a, b) => a.localeCompare(b));
    const accounts = Array.from(new Set(valid.map((tx: any) => String(tx.accountName))));
    const runningTotals: Record<string, number> = Object.fromEntries(accounts.map((account) => [account, 0]));

    const points = dates.map((date) => {
      const deltas = byDate.get(date) ?? {};
      accounts.forEach((account) => {
        runningTotals[account] = (runningTotals[account] ?? 0) + (deltas[account] ?? 0);
      });
      return {
        date,
        ...Object.fromEntries(accounts.map((account) => [account, runningTotals[account] ?? 0]))
      };
    });

    return { accounts, points };
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[28rem]" />
      </div>
    );
  }
  const totalValue = balances?.reduce((sum: number, item: any) => sum + (item.currentValue ?? 0), 0) ?? 0;
  const totalCost = balances?.reduce((sum: number, item: any) => sum + ((item.averageBuyPrice ?? 0) * (item.netQuantity ?? 0)), 0) ?? 0;
  const profitLoss = totalValue - totalCost;
  const roi = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;


  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard label="Portfolio value" value={formatMoney(totalValue)} hint="Live mark-to-market value" delta={`${roi >= 0 ? '+' : ''}${roi.toFixed(2)}% ROI`} accent="from-slate-950 to-slate-600" />
        <StatCard label="Profit / loss" value={formatMoney(profitLoss)} hint="Weighted average cost basis" delta={profitLoss >= 0 ? 'Gain' : 'Loss'} accent="from-blue-600 to-cyan-500" />
        <StatCard label="Tracked assets" value={String(balances?.length ?? 0)} hint="Holdings across linked accounts" delta={allocation?.concentrationRisk ? 'Risk watch' : 'Healthy'} accent="from-emerald-500 to-teal-500" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Panel>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Portfolio growth</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Current positions by asset</h3>
            </div>
            <Badge tone="info">Snapshot</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={(balances ?? []).map((b: any) => ({ assetSymbol: b.assetSymbol, currentValue: b.currentValue }))}>
                <XAxis dataKey="assetSymbol" tick={{ fontSize: 12 }} stroke="currentColor" />
                <YAxis tick={{ fontSize: 12 }} stroke="currentColor" />
                <Tooltip formatter={(value: any) => formatMoney(Number(value))} />
                <Line type="monotone" dataKey="currentValue" stroke="#0f172a" strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Asset allocation</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Concentration profile</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={allocation?.allocation ?? []} dataKey="percent" nameKey="assetSymbol" outerRadius={90} innerRadius={56} paddingAngle={2} label>
                  {(allocation?.allocation ?? []).map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
            <span className="text-sm text-slate-500 dark:text-slate-400">Concentration risk</span>
            <Badge tone={allocation?.concentrationRisk ? 'warning' : 'success'}>{allocation?.concentrationRisk ? 'Watch list' : 'Balanced'}</Badge>
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Portfolio analytics</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Portfolio growth based on account</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Compare cumulative net invested value across your linked accounts.</p>
          </div>
          <Badge tone="info">Comparison</Badge>
        </div>
        <div className="h-80">
          {accountGrowth.accounts.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={accountGrowth.points} barGap={6}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="currentColor" />
                <YAxis tick={{ fontSize: 12 }} stroke="currentColor" />
                <Tooltip formatter={(value: any) => formatMoney(Number(value))} />
                <Legend />
                {accountGrowth.accounts.map((accountName, index) => (
                  <Bar
                    key={accountName}
                    dataKey={accountName}
                    name={accountName}
                    fill={ACCOUNT_LINE_COLORS[index % ACCOUNT_LINE_COLORS.length]}
                    radius={[6, 6, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
              Add transactions in two or more accounts to compare growth trends.
            </div>
          )}
        </div>
      </Panel>

      <Panel>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Holdings</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Current positions by asset</h3>
          </div>
          <Badge tone="neutral">{balances?.length ?? 0} assets</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(balances ?? []).map((balance: any) => (
            <div key={balance.assetSymbol} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{balance.assetSymbol}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Net quantity: {balance.netQuantity}</p>
                </div>
                <Badge tone={balance.currentValue >= 0 ? 'success' : 'danger'}>{formatMoney(balance.currentValue ?? 0)}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Avg cost</p>
                  <p className="font-medium text-slate-950 dark:text-white">{balance.averageBuyPrice ? formatMoney(balance.averageBuyPrice) : '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Price</p>
                  <p className="font-medium text-slate-950 dark:text-white">{formatMoney(balance.currentPrice ?? 0)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}