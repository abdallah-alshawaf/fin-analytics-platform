import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';

export const useSummary = () =>
  useQuery(['analytics', 'summary'], async () => {
    const res = await client.fetcher('/api/v1/analytics/summary');
    return res.balances as Array<any>;
  });

export const useAllocation = () => useQuery(['analytics', 'allocation'], () => client.fetcher('/api/v1/analytics/allocation'));

export const useTimeSeries = (start?: string, end?: string) =>
  useQuery(['analytics', 'timeseries', start, end], () => client.fetcher(`/api/v1/analytics/timeseries?start=${start || ''}&end=${end || ''}`));
