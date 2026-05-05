import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import client from '../../api/client';
import { useAccounts } from '../accounts/hooks';
import useStore from '../../store/useStore';

const schema = z.object({
  accountId: z.string().min(1),
  assetSymbol: z.string().min(1),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.string().min(1),
  priceAtDate: z.string().min(1)
});

type FormValues = z.infer<typeof schema>;

export default function TransactionForm() {
  const { register, handleSubmit, formState, setValue, watch } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { data: accounts } = useAccounts();
  const selectedAccountId = useStore((s) => s.selectedAccountId);
  const setSelectedAccountId = useStore((s) => s.setSelectedAccountId);
  const linkedAccounts = accounts ?? [];
  const currentAccountId = watch('accountId');
  const selectedAccount = linkedAccounts.find((account: any) => account._id === (currentAccountId || selectedAccountId)) ?? null;

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = { ...data, date: new Date().toISOString() };
      await client.fetcher('/api/v1/transactions', { method: 'POST', body: JSON.stringify(payload) });
      alert('Transaction created');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  React.useEffect(() => {
    if (!linkedAccounts.length) return;

    const preferredAccount = linkedAccounts.find((account: any) => account._id === selectedAccountId) ?? linkedAccounts[0];
    if (preferredAccount) {
      setValue('accountId', preferredAccount._id, { shouldValidate: true });
      setSelectedAccountId(preferredAccount._id);
    }
  }, [linkedAccounts, selectedAccountId, setSelectedAccountId, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm">Account</label>
        <select
          className="w-full border rounded p-2"
          {...register('accountId', {
            onChange: (event) => setSelectedAccountId(event.target.value)
          })}
          disabled={!linkedAccounts.length}
        >
          {linkedAccounts.length === 0 ? (
            <option value="">No accounts found</option>
          ) : (
            linkedAccounts.map((account: any) => (
              <option key={account._id} value={account._id}>
                {account.name} ({account.type})
              </option>
            ))
          )}
        </select>
        {selectedAccount ? (
          <p className="mt-1 text-xs text-slate-500">
            Linked to your signed-in user: {selectedAccount.name} in {selectedAccount.currency}
          </p>
        ) : (
          <p className="mt-1 text-xs text-amber-700">No account is linked to the signed-in user yet.</p>
        )}
      </div>
      <div>
        <label className="block text-sm">Asset Symbol</label>
        <input className="w-full border rounded p-2" {...register('assetSymbol')} />
      </div>
      <div className="flex gap-2">
        <select {...register('type')} className="border rounded p-2 w-1/2">
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
        <input {...register('quantity')} placeholder="Quantity (string)" className="border rounded p-2 w-1/2" />
      </div>
      <div>
        <input {...register('priceAtDate')} placeholder="Price (string)" className="w-full border rounded p-2" />
      </div>
      {/* date removed - server will use current timestamp */}
      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit" disabled={!selectedAccount}>
        Submit
      </button>
      {formState.isSubmitting && <div>Submitting...</div>}
    </form>
  );
}
