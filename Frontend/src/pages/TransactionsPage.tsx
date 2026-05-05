import React from 'react';
import Panel from '../components/ui/Panel';
import Badge from '../components/ui/Badge';
import TransactionForm from '../features/transactions/TransactionForm';
import { useTransactions } from '../features/transactions/hooks';

type LedgerRow = { id: number; date: string; account: string; asset: string; side: 'BUY' | 'SELL'; quantity: string; price: string; pnl: string };

const sampleLedger: LedgerRow[] = [
  { id: 1, date: '2026-05-01', account: 'Primary Brokerage', asset: 'AAPL', side: 'BUY', quantity: '10', price: '$185.20', pnl: '+$1,220.40' },
  { id: 2, date: '2026-05-02', account: 'Primary Brokerage', asset: 'MSFT', side: 'BUY', quantity: '4', price: '$412.80', pnl: '+$388.00' },
  { id: 3, date: '2026-05-03', account: 'Primary Brokerage', asset: 'BTC', side: 'SELL', quantity: '0.005', price: '$67,500.00', pnl: '+$142.12' },
  { id: 4, date: '2026-05-04', account: 'Primary Brokerage', asset: 'ETH', side: 'BUY', quantity: '1.5', price: '$3,120.50', pnl: '-$62.10' }
];

export default function TransactionsPage() {
  const [query, setQuery] = React.useState('');
  const [sortKey, setSortKey] = React.useState<'date' | 'asset' | 'pnl'>('date');

  const { data: transactions = [], isLoading } = useTransactions();

  const rows = React.useMemo(() => {
    const normalized = (transactions || []).map((t: any, idx: number) => ({
      id: t._id || idx,
      date: t.date ? new Date(t.date).toISOString().slice(0, 10) : '',
      account: t.accountName || t.accountId || '—',
      asset: t.assetSymbol,
      side: t.type,
      quantity: t.quantity || '',
      price: t.priceAtDate ? `$${Number(t.priceAtDate).toLocaleString()}` : '',
      pnl: '—'
    }));

    const filtered = normalized.filter((row) => `${row.asset} ${row.account} ${row.side}`.toLowerCase().includes(query.toLowerCase()));
    return [...filtered].sort((a, b) => {
      if (sortKey === 'asset') return a.asset.localeCompare(b.asset);
      if (sortKey === 'pnl') return Number(b.pnl.replace(/[^0-9.-]/g, '')) - Number(a.pnl.replace(/[^0-9.-]/g, ''));
      return b.date.localeCompare(a.date);
    });
  }, [transactions, query, sortKey]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Add transaction</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">BUY / SELL ledger entry</h3>
            </div>
            <Badge tone="info">Required fields</Badge>
          </div>
          <TransactionForm />
        </Panel>

        <Panel>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Recent activity</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Transaction table</h3>
            </div>
            <Badge tone="neutral">{rows.length} rows</Badge>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-slate-700" placeholder="Filter by asset, account, or side" value={query} onChange={(event) => setQuery(event.target.value)} />
            <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-slate-700" value={sortKey} onChange={(event) => setSortKey(event.target.value as any)}>
              <option value="date">Sort by date</option>
              <option value="asset">Sort by asset</option>
              <option value="pnl">Sort by P/L</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  {['Date', 'Account', 'Asset', 'Side', 'Qty', 'Price', 'P/L'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">Loading transactions…</td>
                  </tr>
                ) : (
                  rows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-900/70">
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{row.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{row.account}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-950 dark:text-white">{row.asset}</td>
                    <td className="px-4 py-3 text-sm"><Badge tone={row.side === 'BUY' ? 'success' : 'warning'}>{row.side}</Badge></td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{row.quantity}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{row.price}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-950 dark:text-white">{row.pnl}</td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}