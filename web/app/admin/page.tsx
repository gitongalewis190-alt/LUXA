'use client';

import { useEffect, useState } from 'react';
import { getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { GlassCard, StatCardSkeleton } from '../../components/common/GlassCard';
import { projectsRef, transactionsRef, usersRef, approvalQueueRef, type Transaction } from '../../lib/firestore';
import { formatCurrency } from '../../lib/utils/formatCurrency';
import { formatRelative } from '../../lib/utils/formatDate';

interface Stats {
  totalMembers:   number;
  totalProjects:  number;
  totalRevenue:   number;
  pendingApprovals: number;
}

export default function AdminOverviewPage() {
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [recent,   setRecent]   = useState<(Transaction & { id: string })[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [membersSnap, projectsSnap, txSnap, queueSnap] = await Promise.all([
        getDocs(usersRef()),
        getDocs(projectsRef()),
        getDocs(query(transactionsRef(), orderBy('transactionDate', 'desc'), limit(10))),
        getDocs(query(approvalQueueRef(), where('status', '==', 'pending'))),
      ]);

      const revenue = txSnap.docs.reduce((s, d) => {
        const t = d.data() as Transaction;
        return t.status === 'completed' ? s + (t.facilitation_fee ?? 0) : s;
      }, 0);

      setStats({
        totalMembers:     membersSnap.size,
        totalProjects:    projectsSnap.size,
        totalRevenue:     revenue,
        pendingApprovals: queueSnap.size,
      });

      setRecent(txSnap.docs.map(d => ({ ...d.data() as Transaction, id: d.id })));
      setLoading(false);
    })();
  }, []);

  const statCards = stats ? [
    { label: 'Total Members',   value: stats.totalMembers.toLocaleString() },
    { label: 'Total Projects',  value: stats.totalProjects.toLocaleString() },
    { label: 'Platform Revenue',value: formatCurrency(stats.totalRevenue) },
    { label: 'Pending Approval',value: stats.pendingApprovals, alert: stats.pendingApprovals > 0 },
  ] : null;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl mb-8">
        <span className="text-gradient-fire">Admin</span> Overview
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards?.map(card => (
              <GlassCard key={card.label} variant={card.alert ? 'fire' : 'default'} size="md">
                <p className="text-luxa-text-dim text-xs uppercase tracking-widest mb-2">{card.label}</p>
                <p className="font-display font-bold text-2xl">{card.value}</p>
              </GlassCard>
            ))
        }
      </div>

      {/* Recent transactions */}
      <GlassCard variant="admin" size="md">
        <h2 className="font-display font-semibold mb-5">Recent Transactions</h2>
        {recent.length === 0 ? (
          <p className="text-luxa-text-dim text-sm">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {recent.map(tx => (
              <div key={tx.id} className="flex items-center justify-between text-sm border-b border-[rgba(255,255,255,0.05)] pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{tx.projectTitle}</p>
                  <p className="text-luxa-text-dim text-xs">{tx.buyerName} → {tx.sellerName} · {formatRelative(tx.transactionDate)}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="font-semibold">{formatCurrency(tx.amount, tx.currency)}</p>
                  <p className="text-luxa-text-dim text-xs">fee: {formatCurrency(tx.facilitation_fee ?? 0, tx.currency)}</p>
                  <span className={`badge-${tx.status} text-[10px]`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
