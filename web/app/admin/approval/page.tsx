'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { GlassCard } from '../../../components/common/GlassCard';
import { subscribeApprovalQueue, COLLECTIONS, type ApprovalQueueItem, type Project } from '../../../lib/firestore';
import { formatRelative } from '../../../lib/utils/formatDate';

export default function ApprovalQueuePage() {
  const [queue,      setQueue]      = useState<(ApprovalQueueItem & { id: string; project?: Project })[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeApprovalQueue(async items => {
      const enriched = await Promise.all(items.map(async item => {
        const snap = await getDoc(doc(db, COLLECTIONS.PROJECTS, item.projectId));
        return { ...item, project: snap.exists() ? snap.data() as Project : undefined };
      }));
      setQueue(enriched);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handle = async (queueId: string, projectId: string, action: 'approve' | 'reject', reason?: string) => {
    setProcessing(queueId);
    await updateDoc(doc(db, COLLECTIONS.APPROVAL_QUEUE, queueId), {
      status:          action === 'approve' ? 'approved' : 'rejected',
      rejectionReason: reason ?? null,
      updatedAt:       serverTimestamp(),
    });
    if (action === 'approve') {
      await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
        isApproved: true,
        approvedAt: serverTimestamp(),
      });
    }
    setProcessing(null);
  };

  return (
    <div>
      <h1 className="font-display font-bold text-3xl mb-8">
        Approval Queue
        {queue.length > 0 && <span className="ml-3 badge-pending">{queue.length}</span>}
      </h1>

      {isLoading ? (
        <div className="text-center py-12 text-luxa-text-muted">Loading queue…</div>
      ) : queue.length === 0 ? (
        <GlassCard size="lg" className="text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-display font-semibold">All clear — no pending submissions</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {queue.map(item => (
            <GlassCard key={item.id} variant="admin" size="md">
              <div className="flex gap-6">
                {/* Thumbnail */}
                {item.project?.thumbnail && (
                  <div className="relative w-32 h-24 rounded-glass-sm overflow-hidden shrink-0">
                    <Image src={item.project.thumbnail} alt={item.project.title ?? ''} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-display font-semibold">{item.project?.title ?? item.projectId}</h3>
                      <p className="text-luxa-text-dim text-sm">by {item.submitterName} · {formatRelative(item.submissionDate)}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handle(item.id, item.projectId, 'approve')}
                        disabled={processing === item.id}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Rejection reason (optional):') ?? '';
                          handle(item.id, item.projectId, 'reject', reason);
                        }}
                        disabled={processing === item.id}
                        className="btn-fire text-sm px-4 py-2"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                  {item.project?.description && (
                    <p className="text-luxa-text-muted text-sm line-clamp-2">{item.project.description}</p>
                  )}
                  <div className="flex gap-3 mt-2 text-xs text-luxa-text-dim">
                    <span>Category: {item.project?.category ?? '—'}</span>
                    <span>Price: {item.project ? `${item.project.price} ${item.project.currency}` : '—'}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
