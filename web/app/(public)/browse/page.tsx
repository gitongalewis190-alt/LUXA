'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getDocs, query, where, orderBy, limit, startAfter, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';
import { projectsRef, type Project } from '../../../lib/firestore';
import { ProjectCard } from '../../../components/projects/ProjectCard';
import { ProjectFilter, type FilterState } from '../../../components/projects/ProjectFilter';
import { ProjectCardSkeleton } from '../../../components/common/GlassCard';
import { useCart } from '../../../lib/hooks/useCart';
import { useAuth } from '../../../lib/hooks/useAuth';

export default function BrowsePage() {
  const { user } = useAuth();
  const { addItem, hasItem } = useCart();

  const [projects,    setProjects]    = useState<(Project & { id: string })[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [hasMore,     setHasMore]     = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [likedIds,    setLikedIds]    = useState<Set<string>>(new Set());
  const loaderRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<FilterState>({ category: '', status: '', sort: 'createdAt', search: '' });

  const PAGE_SIZE = 20;

  const fetchPage = useCallback(async (reset: boolean, currentFilters: FilterState, cursor: QueryDocumentSnapshot<DocumentData> | null) => {
    setIsLoading(true);
    try {
      const constraints: Parameters<typeof query>[1][] = [
        where('isApproved', '==', true),
        where('status', '!=', 'unlisted'),
        orderBy('status'),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE + 1),
      ];
      if (currentFilters.category) constraints.push(where('category', '==', currentFilters.category));
      if (currentFilters.status)   constraints.push(where('status',   '==', currentFilters.status));
      if (!reset && cursor)        constraints.push(startAfter(cursor));

      const snap  = await getDocs(query(projectsRef(), ...constraints));
      const docs  = snap.docs;
      const more  = docs.length > PAGE_SIZE;
      const slice = more ? docs.slice(0, -1) : docs;
      const items = slice.map(d => ({ ...d.data() as Project, id: d.id, projectId: d.id }));

      setProjects(prev => reset ? items : [...prev, ...items]);
      setLastVisible(slice.length ? slice[slice.length - 1] : null);
      setHasMore(more);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(true, filters, null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.status]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) fetchPage(false, filters, lastVisible);
    }, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, filters, lastVisible, fetchPage]);

  const displayed = filters.search
    ? projects.filter(p =>
        p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description?.toLowerCase().includes(filters.search.toLowerCase())
      )
    : projects;

  return (
    <div className="min-h-dvh pt-[var(--nav-height)] pb-24">
      <div className="container-luxa pt-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl mb-2">Browse Projects</h1>
          <p className="text-luxa-text-muted text-sm">Discover advanced vehicle concepts and engineering innovations.</p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ProjectFilter filters={filters} onChange={partial => setFilters(prev => ({ ...prev, ...partial }))} />
        </div>

        {/* Grid */}
        {isLoading && projects.length === 0 ? (
          <div className="project-grid">
            {Array.from({ length: 8 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-24 text-luxa-text-muted">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-display">No projects found</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="project-grid">
              {displayed.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isLiked={likedIds.has(project.id)}
                  onLike={id => {
                    if (!user) return;
                    setLikedIds(prev => {
                      const next = new Set(prev);
                      next.has(id) ? next.delete(id) : next.add(id);
                      return next;
                    });
                  }}
                  showAddToCart={!!user}
                  inCart={hasItem(project.id)}
                  onAddToCart={p => addItem({ projectId: p.id, title: p.title, thumbnail: p.thumbnail, price: p.price, currency: p.currency, creatorName: p.creatorName })}
                />
              ))}
            </div>
            <div ref={loaderRef} className="h-8 mt-8 flex items-center justify-center">
              {isLoading && <div className="w-5 h-5 rounded-full border-2 border-luxa-sky/30 border-t-luxa-sky animate-spin" />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
