'use client';

import { useEffect, useState } from 'react';
import { getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { projectsRef, type Project } from '../../lib/firestore';
import { ProjectCard } from '../projects/ProjectCard';
import { ProjectCardSkeleton } from '../common/GlassCard';
import { useCart } from '../../lib/hooks/useCart';
import Link from 'next/link';

export function AntonioSection() {
  const [projects,  setProjects]  = useState<(Project & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, hasItem } = useCart();

  useEffect(() => {
    getDocs(query(
      projectsRef(),
      where('isApproved', '==', true),
      where('isAntonioProject', '==', true),
      orderBy('createdAt', 'desc'),
      limit(4)
    )).then(snap => {
      setProjects(snap.docs.map(d => ({ ...d.data() as Project, id: d.id, projectId: d.id })));
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  if (!isLoading && projects.length === 0) return null;

  return (
    <section className="py-20 border-t border-[rgba(255,255,255,0.06)]">
      <div className="container-luxa">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-luxa-fire text-label uppercase tracking-widest mb-2">Creator</p>
            <h2 className="font-display font-bold text-display">
              <span className="text-gradient-fire">Antonio&apos;s</span> Projects
            </h2>
          </div>
          <Link href="/browse?antonio=1" className="btn-ghost text-sm">View All →</Link>
        </div>
        <div className="project-grid">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProjectCardSkeleton key={i} />)
            : projects.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  inCart={hasItem(p.id)}
                  showAddToCart
                  onAddToCart={proj => addItem({ projectId: proj.id, title: proj.title, thumbnail: proj.thumbnail, price: proj.price, currency: proj.currency, creatorName: proj.creatorName })}
                />
              ))
          }
        </div>
      </div>
    </section>
  );
}
