import React from 'react';
import { useForm } from 'react-hook-form';
import client from '../../api/client';
import useStore from '../../store/useStore';
import { useQueryClient } from '@tanstack/react-query';

export default function Login() {
  const { register, handleSubmit, reset } = useForm<{ email: string; password: string }>();
  const setAccessToken = useStore((s) => s.setAccessToken);
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isRegistering, setIsRegistering] = React.useState(false);

  const onSubmit = async (data: { email: string; password: string }) => {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const body = await client.fetcher('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const token = body.accessToken;
      if (token) {
        localStorage.setItem('accessToken', token);
        setAccessToken(token);
        queryClient.invalidateQueries();
        reset();
        return;
      }

      setError('Login succeeded, but no access token was returned.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegister = async (data: { email: string; password: string }) => {
    setError(null);
    setMessage(null);
    setIsRegistering(true);

    try {
      await client.fetcher('/api/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      setMessage('Registration complete. You can sign in now.');
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Email</span>
          <input
            placeholder="email"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            autoComplete="email"
            {...register('email')}
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Password</span>
          <input
            placeholder="password"
            type="password"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            autoComplete="current-password"
            {...register('password')}
          />
        </label>
      </div>
      <button
        className="w-full rounded-xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in...' : 'Open dashboard'}
      </button>
      <button
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        type="button"
        disabled={isRegistering || isSubmitting}
        onClick={handleSubmit(onRegister)}
      >
        {isRegistering ? 'Registering...' : 'Register'}
      </button>
      {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900">{message}</p>}
      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900">{error}</p>}
    </form>
  );
}
