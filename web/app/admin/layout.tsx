'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/hooks/useAuth';

const NAV_ITEMS = [
  { href: '/admin',               label: 'Overview',    icon: '◈' },
  { href: '/admin/approval',      label: 'Approval Queue', icon: '⏳' },
  { href: '/admin/members',       label: 'Members',     icon: '👤' },
  { href: '/admin/transactions',  label: 'Transactions',icon: '💳' },
  { href: '/admin/analytics',     label: 'Analytics',   icon: '📊' },
  { href: '/admin/config',        label: 'Config',      icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push('/');
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-dvh flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-luxa-fire/30 border-t-luxa-fire animate-spin" /></div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-dvh flex" style={{ background: 'rgba(3, 5, 12, 0.98)' }}>
      {/* Sidebar */}
      <aside className="w-[var(--sidebar-width)] shrink-0 border-r border-[rgba(255,107,53,0.12)] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[rgba(255,107,53,0.12)]">
          <p className="font-display font-bold text-xl tracking-[-0.04em]">
            <span className="text-gradient-fire">LUXA</span>
            <span className="text-luxa-text-dim text-sm font-normal ml-2">ADMIN</span>
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-glass-sm text-sm transition-all ${
                pathname === item.href
                  ? 'bg-[rgba(255,107,53,0.15)] text-luxa-fire border border-[rgba(255,107,53,0.25)]'
                  : 'text-luxa-text-muted hover:text-luxa-text hover:bg-white/5'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(255,107,53,0.12)]">
          <Link href="/" className="flex items-center gap-2 text-xs text-luxa-text-dim hover:text-luxa-text transition-colors">
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
