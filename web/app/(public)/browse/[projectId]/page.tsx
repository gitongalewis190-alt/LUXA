'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { COLLECTIONS, subscribeComments, type Project, type Comment } from '../../../../lib/firestore';
import { GlassCard } from '../../../../components/common/GlassCard';
import { formatCurrency } from '../../../../lib/utils/formatCurrency';
import { formatDate, formatRelative } from '../../../../lib/utils/formatDate';
import { useAuth } from '../../../../lib/hooks/useAuth';
import { useCart } from '../../../../lib/hooks/useCart';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router  = useRouter();
  const { user } = useAuth();
  const { addItem, hasItem } = useCart();

  const [project,  setProject]  = useState<(Project & { id: string }) | null>(null);
  const [comments, setComments] = useState<(Comment & { id: string })[]>([]);
  const [comment,  setComment]  = useState('');
  const [loading,  setLoading]  = useState(true);
  const [posting,  setPosting]  = useState(false);

  useEffect(() => {
    if (!projectId) return;
    getDoc(doc(db, COLLECTIONS.PROJECTS, projectId)).then(snap => {
      if (!snap.exists()) { router.push('/browse'); return; }
      setProject({ ...snap.data() as Project, id: snap.id, projectId: snap.id });
      setLoading(false);
    });
  }, [projectId, router]);

  useEffect(() => {
    if (!projectId) return;
    return subscribeComments(projectId, setComments);
  }, [projectId]);

  const handleComment = async () => {
    if (!user || !comment.trim() || !projectId) return;
    setPosting(true);
    const { collection: col } = await import('firebase/firestore');
    await addDoc(col(db, COLLECTIONS.PROJECTS, projectId, 'comments'), {
      projectId,
      userId:    user.uid,
      userName:  user.displayName ?? 'Member',
      text:      comment.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isDeleted: false,
    });
    setComment('');
    setPosting(false);
  };

  if (loading) {
    return (
      <div className="min-h-dvh pt-[var(--nav-height)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-luxa-sky/30 border-t-luxa-sky animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  const inCart = hasItem(project.id);

  return (
    <div className="min-h-dvh pt-[var(--nav-height)] pb-24">
      <div className="container-luxa pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Left: media + details */}
          <div>
            {/* Hero media */}
            <GlassCard size="none" className="overflow-hidden mb-6">
              <div className="relative aspect-video">
                <Image src={project.thumbnail || '/images/placeholder.png'} alt={project.title} fill className="object-cover" />
                {project.isAntonioProject && (
                  <span className="absolute top-4 left-4 badge-antonio">LUXA ORIGINAL</span>
                )}
              </div>
            </GlassCard>

            {/* Title & meta */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="font-display font-bold text-3xl md:text-4xl">{project.title}</h1>
                <span className={`shrink-0 badge-${project.status}`}>{project.status}</span>
              </div>
              <div className="flex items-center gap-4 text-luxa-text-muted text-sm">
                <span>{project.creatorName}</span>
                <span>·</span>
                <span>{formatDate(project.createdAt)}</span>
                <span>·</span>
                <span>{project.viewCount.toLocaleString()} views</span>
                <span>·</span>
                <span>{project.likeCount} likes</span>
              </div>
            </div>

            {/* Description */}
            <GlassCard size="md" className="mb-6">
              <h2 className="font-display font-semibold text-lg mb-3">Description</h2>
              <p className="text-luxa-text-muted leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </GlassCard>

            {/* Tags */}
            {project.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {project.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs glass border-[rgba(255,255,255,0.1)] text-luxa-text-muted">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Comments */}
            <GlassCard size="md">
              <h2 className="font-display font-semibold text-lg mb-5">Comments ({comments.length})</h2>

              {user && (
                <div className="flex gap-3 mb-6">
                  <input
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleComment()}
                    placeholder="Add a comment..."
                    className="input flex-1"
                  />
                  <button onClick={handleComment} disabled={posting || !comment.trim()} className="btn-primary px-4 py-2 text-sm">
                    Post
                  </button>
                </div>
              )}

              {comments.length === 0 ? (
                <p className="text-luxa-text-dim text-sm text-center py-6">No comments yet. Be the first.</p>
              ) : (
                <div className="space-y-4">
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-luxa-ocean/30 flex items-center justify-center text-xs font-bold text-luxa-sky shrink-0">
                        {c.userName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-luxa-text">{c.userName}</span>
                          <span className="text-xs text-luxa-text-dim">{formatRelative(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-luxa-text-muted mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right: purchase panel */}
          <div className="lg:sticky lg:top-[calc(var(--nav-height)+24px)] h-fit">
            <GlassCard variant="ocean" size="md">
              <p className="font-display font-bold text-3xl mb-1">
                {formatCurrency(project.price, project.currency)}
              </p>
              <p className="text-luxa-text-dim text-sm mb-6">{project.currency} · Single license</p>

              {project.status === 'sold' ? (
                <div className="badge-sold w-full justify-center py-3 text-sm">Sold</div>
              ) : user ? (
                <button
                  onClick={() => addItem({ projectId: project.id, title: project.title, thumbnail: project.thumbnail, price: project.price, currency: project.currency, creatorName: project.creatorName })}
                  disabled={inCart}
                  className={`w-full py-3 rounded-glass-sm text-sm font-semibold transition-all ${inCart ? 'bg-luxa-sky/20 text-luxa-sky border border-luxa-sky/30' : 'btn-primary'}`}
                >
                  {inCart ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
              ) : (
                <Link href="/signup" className="btn-primary w-full justify-center py-3 text-sm">
                  Sign Up to Purchase
                </Link>
              )}

              {inCart && (
                <Link href="/cart" className="btn-secondary w-full justify-center py-2.5 text-sm mt-3">
                  View Cart
                </Link>
              )}

              <div className="divider my-5" />
              <div className="space-y-2 text-sm text-luxa-text-muted">
                <div className="flex justify-between"><span>Category</span><span className="text-luxa-text capitalize">{project.category}</span></div>
                <div className="flex justify-between"><span>Type</span><span className="text-luxa-text capitalize">{project.contentType}</span></div>
                <div className="flex justify-between"><span>Sales</span><span className="text-luxa-text">{project.saleCount}</span></div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
