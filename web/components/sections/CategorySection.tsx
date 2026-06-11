'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDocs, query, where, orderBy } from 'firebase/firestore';
import { categoriesRef, type Category } from '../../lib/firestore';
import { GlassCard } from '../common/GlassCard';

export function CategorySection() {
  const [categories, setCategories] = useState<(Category & { id: string })[]>([]);

  useEffect(() => {
    getDocs(query(categoriesRef(), where('isActive', '==', true), orderBy('order', 'asc')))
      .then(snap => setCategories(snap.docs.map(d => ({ ...d.data() as Category, id: d.id, categoryId: d.id }))))
      .catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="py-20 border-t border-[rgba(255,255,255,0.06)]">
      <div className="container-luxa">
        <div className="mb-10">
          <p className="text-luxa-sky text-label uppercase tracking-widest mb-2">Explore</p>
          <h2 className="font-display font-bold text-display">Browse by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link key={cat.id} href={`/browse?category=${cat.id}`}>
              <GlassCard size="md" isInteractive>
                <p className="text-3xl mb-3">{cat.icon ?? '🔧'}</p>
                <p className="font-display font-semibold">{cat.name}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
