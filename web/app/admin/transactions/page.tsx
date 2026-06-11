'use client';

import { useEffect, useState } from 'react';
import { getDocs, query, orderBy } from 'firebase/firestore';
import { GlassCard } from '../../../components/common/GlassCard';
import { transactionsRef, type Transaction } from '../../../lib/firestore';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<(Transaction & { id: string })[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [filter,       setFilter]       = useState('');

  useEffect(() => {
    getDocs(query(transactionsRef(), orderBy('transactionDate', 'desc'))).then(snap => {
      setTransactions(snap.docs.map(d => ({ ...d.data() as Transaction, id: d.id })));
      setIsLoading(false);
    });
  }, []);

  const totalRevenue  = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalFees     = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + (t.facilitation_fee ?? 0), 0);

  const filtered = filter ? transactions.filter(t => t.status === filter) : transactions;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-3xl">Transactions</h1>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input w-auto py-2 text-sm">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <GlassCard size="md">
          <p className="text-luxa-text-dim text-xs uppercase tracking-widest mb-1">Total Volume</p>
          <p className="font-display font-bold text-2xl">{formatCurrency(totalRevenue)}</p>
        </GlassCard>
        <GlassCard size="md" variant="fire">
          <p className="text-luxa-text-dim text-xs uppercase tracking-widest mb-1">Platform Fees</p>
          <p className="font-display font-bold text-2xl">{formatCurrency(totalFees)}</p>
        </GlassCard>
        <GlassCard size="md">
          <p className="text-luxa-text-dim text-xs uppercase tracking-widest mb-1">Transactions</p>
          <p className="font-display font-bold text-2xl">{transactions.length}</p>
        </GlassCard>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-luxa-text-muted">Loading transactions…</div>
      ) : (
        <GlassCard variant="admin" size="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  {['Project', 'Buyer', 'Seller', 'Amount', 'Fee', 'Payout', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left text-xs text-luxa-text-dim uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 max-w-[160px]">
                      <p className="truncate font-medium">{tx.projectTitle}</p>
                    </td>
                    <td className="px-4 py-3 text-luxa-text-muted">{tx.buyerName}</td>
                    <td className="px-4 py-3 text-luxa-text-muted">{tx.sellerName}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(tx.amount, tx.currency)}</td>
                    <td className="px-4 py-3 text-luxa-fire">{formatCurrency(tx.facilitation_fee ?? 0, tx.currency)}</td>
                    <td className="px-4 py-3 text-green-400">{formatCurrency(tx.payout_amount ?? 0, tx.currency)}</td>
                    <td className="px-4 py-3"><span className={`badge-${tx.status}`}>{tx.status}</span></td>
                    <td className="px-4 py-3 text-luxa-text-dim text-xs">{formatDate(tx.transactionDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-luxa-text-dim text-sm py-8">No transactions found.</p>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
