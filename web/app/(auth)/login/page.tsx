'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlassCard } from '../../../components/common/GlassCard';
import { useAuth } from '../../../lib/hooks/useAuth';

export default function LoginPage() {
  const { login, error, clearError, isLoading } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get('redirect') ?? '/dashboard';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      router.push(redirect);
    } catch {}
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-24">
      <div className="absolute inset-0 bg-luxa-void" />
      <div className="absolute inset-0 bg-luxa-hero" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-2xl tracking-[-0.04em]">LUXA</Link>
          <p className="text-luxa-text-muted text-sm mt-2">Welcome back</p>
        </div>

        <GlassCard variant="elevated" size="lg">
          <h1 className="font-display font-bold text-2xl mb-6">Log In</h1>

          {error && (
            <div className="glass-fire rounded-glass-sm p-3 mb-5 text-sm text-red-300">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-luxa-text-muted mb-1.5" htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm text-luxa-text-muted mb-1.5" htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input" placeholder="••••••••" />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3 mt-2">
              {isLoading ? 'Signing in…' : 'Log In'}
            </button>
          </form>

          <p className="text-sm text-luxa-text-muted text-center mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-luxa-cyan hover:underline">Sign up</Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
