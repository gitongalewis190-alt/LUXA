'use client';

import { useEffect, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { GlassCard } from '../common/GlassCard';
import { configRef, type PlatformConfig } from '../../lib/firestore';
import { useAuth } from '../../lib/hooks/useAuth';
import Link from 'next/link';

export function CompanyShareSection() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(configRef(), snap => {
      if (!snap.exists()) return;
      const cfg = snap.data() as PlatformConfig;
      setVisible(cfg.visible_sections?.company_shares ?? true);
    });
    return () => unsub();
  }, []);

  if (!visible) return null;

  return (
    <section className="py-20 border-t border-[rgba(255,255,255,0.06)]">
      <div className="container-luxa">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-luxa-fire text-label uppercase tracking-widest mb-3">Invest</p>
          <h2 className="font-display font-bold text-display mb-4">Own a Part of LUXA</h2>
          <p className="text-luxa-text-muted mb-8">
            Purchase LUXA company shares and be part of the platform&apos;s growth.
            Direct investment in Antonio&apos;s vision.
          </p>
          <GlassCard variant="fire" size="md" className="text-left mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-xl">LUXA Company Shares</p>
                <p className="text-luxa-text-muted text-sm mt-1">Limited availability — set by Antonio</p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-3xl">Contact</p>
                <p className="text-luxa-text-dim text-sm">for pricing</p>
              </div>
            </div>
          </GlassCard>
          {user ? (
            <Link href="/dashboard" className="btn-fire px-8 py-3">Inquire via Dashboard</Link>
          ) : (
            <Link href="/signup" className="btn-fire px-8 py-3">Sign Up to Invest</Link>
          )}
        </div>
      </div>
    </section>
  );
}
