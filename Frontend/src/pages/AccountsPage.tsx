import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import client from '../api/client';
import { useAccounts } from '../features/accounts/hooks';
import Panel from '../components/ui/Panel';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import useStore from '../store/useStore';

type AccountForm = { name: string; type: 'SAVINGS' | 'BROKERAGE' | 'CRYPTO'; currency: string };

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<AccountForm>({ defaultValues: { name: '', type: 'BROKERAGE', currency: 'USD' } });
  const [open, setOpen] = React.useState(false);
  const setSelectedAccountId = useStore((s) => s.setSelectedAccountId);

  const createAccount = useMutation({
    mutationFn: (payload: AccountForm) => client.fetcher('/api/v1/accounts', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: async (result: any) => {
      queryClient.invalidateQueries(['accounts']);
      if (result?.account?._id) setSelectedAccountId(String(result.account._id));
      reset();
      setOpen(false);
    }
  });

  const total = accounts?.length ?? 0;

  return (
    <div className="space-y-6 animate-fade-up">
      <Panel>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Accounts</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Investment accounts linked to the signed-in user</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Each account is stored in MongoDB against the authenticated userId and is available for transactions immediately.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="info">{total} linked</Badge>
            <button className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950" onClick={() => setOpen(true)} type="button">
              Add account
            </button>
          </div>
        </div>
      </Panel>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : total === 0 ? (
        <EmptyState
          title="No accounts yet"
          description="Create a brokerage, savings, or crypto account to start routing transactions into the signed-in user profile."
          action={<button className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800" onClick={() => setOpen(true)} type="button">Create your first account</button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(accounts ?? []).map((account: any) => (
            <div key={account._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{account.name}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{account.type}</p>
                </div>
                <Badge tone="neutral">{account.currency}</Badge>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                Account ID: <span className="font-mono text-xs">{account._id}</span>
              </div>
              <button className="mt-4 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900" onClick={() => setSelectedAccountId(String(account._id))} type="button">
                Set as active
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} title="Add investment account" onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={handleSubmit((values) => createAccount.mutate(values))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span>Name</span>
              <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-slate-700" {...register('name', { required: true })} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span>Currency</span>
              <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-slate-700" {...register('currency', { required: true })} />
            </label>
          </div>
          <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <span>Type</span>
            <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-slate-700" {...register('type', { required: true })}>
              <option value="BROKERAGE">BROKERAGE</option>
              <option value="SAVINGS">SAVINGS</option>
              <option value="CRYPTO">CRYPTO</option>
            </select>
          </label>
          <button className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950" type="submit" disabled={createAccount.isLoading}>
            {createAccount.isLoading ? 'Creating...' : 'Create account'}
          </button>
        </form>
      </Modal>
    </div>
  );
}