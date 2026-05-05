import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';

export const useTransactions = () => useQuery(['transactions'], () => client.fetcher('/api/v1/transactions').then((r) => r.transactions || []));

export default useTransactions;
