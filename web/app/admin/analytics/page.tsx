'use client';

import { useEffect, useState } from 'react';
import { getDocs, query, orderBy, limit } from 'firebase/firestore';
import { GlassCard } from '../../../components/common/GlassCard';
import { projectsRef, transactionsRef, usersRef, type Project, type Transaction } from '../../../lib/firestore';
import { formatCurrency } from '../../../lib/utils/formatCurrency';

interface AnalyticsData {
  totalMembers:  number;
  totalProjects: number;
  totalRevenue:  number;
  platformFees:  number;
  topProjects:   (Project & { id: string })[];
  recentTx:      (Transaction & { id: string })[];
}

export default function AnalyticsPage() {
  const [data,      setData]      = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [membersSnap, projectsSnap, txSnap] = await Promise.all([
        getDocs(usersRef()),
        getDocs(query(projectsRef(), orderBy('viewCount', 'desc'), limit(10))),
        getDocs(query(transactionsRef(), orderBy('transactionDate', 'desc'), limit(50))),
      ]);

      const txs = txSnap.docs.map(d => ({ ...d.data() as Transaction, id: d.id }));
      const completed = txs.filter(t => t.status === 'completed');

      setData({
        totalMembers:  membersSnap.size,
        totalProjects: projectsSnap.size,
        totalRevenue:  completed.reduce((s, t) => s + t.amount, 0),
        platformFees:  completed.reduce((s, t) => s + (t.facilitation_fee ?? 0), 0),
        topProjects:   projectsSnap.docs.map(d => ({ ...d.data() as Project, id: d.id })),
        recentTx:      txs.slice(0, 10),
      });
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) return <div className="text-center py-24 text-luxa-text-muted">Loading analytics…</div>;
  if (!data) return null;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl mb-8">Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Members',         value: data.totalMembers.toLocaleString() },
          { label: 'Projects',        value: data.totalProjects.toLocaleString() },
          { label: 'Gross Revenue',   value: formatCurrency(data.totalRevenue) },
          { label: 'Platform Earned', value: formatCurrency(data.platformFees), variant: 'fire' as const },
        ].map(card => (
          <GlassCard key={card.label} variant={card.variant ?? 'default'} size="md">
            <p className="text-luxa-text-dim text-xs uppercase tracking-widest mb-2">{card.label}</p>
            <p className="font-display font-bold text-2xl">{card.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Projects */}
        <GlassCard variant="admin" size="md">
          <h2 className="font-display font-semibold mb-5">Top Projects by Views</h2>
          <div className="space-y-3">
            {data.topProjects.slice(0, 8).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 text-sm">
                <span className="text-luxa-text-dim w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="text-luxa-text-dim text-xs">{p.creatorName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold">{p.viewCount.toLocaleString()}</p>
                  <p className="text-luxa-text-dim text-xs">{p.likeCount} likes</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Transactions */}
        <GlassCard variant="admin" size="md">
          <h2 className="font-display font-semibold mb-5">Recent Sales</h2>
          <div className="space-y-3">
            {data.recentTx.filter(t => t.status === 'completed').slice(0, 8).map(tx => (
              <div key={tx.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1 mr-4">
                  <p className="truncate font-medium">{tx.projectTitle}</p>
                  <p className="text-luxa-text-dim text-xs">{tx.buyerName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold">{formatCurrency(tx.amount, tx.currency)}</p>
                  <p className="text-luxa-fire text-xs">+{formatCurrency(tx.facilitation_fee ?? 0, tx.currency)}</p>
                </div>
              </div>
            ))}
            {data.recentTx.filter(t => t.status === 'completed').length === 0 && (
              <p className="text-luxa-text-dim text-sm">No completed sales yet.</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
