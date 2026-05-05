import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';

export const useAccounts = () =>
	useQuery(['accounts'], () => client.fetcher('/api/v1/accounts').then((r) => (r.accounts || []).map((a: any) => ({ ...a, _id: String(a._id) }))));

export default useAccounts;
