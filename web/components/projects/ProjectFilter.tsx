'use client';

import { useState, useEffect } from 'react';
import { getDocs, query, where } from 'firebase/firestore';
import { categoriesRef, type Category } from '../../lib/firestore';

interface FilterState {
  category: string;
  status:   string;
  sort:     string;
  search:   string;
}

interface ProjectFilterProps {
  filters:   FilterState;
  onChange:  (f: Partial<FilterState>) => void;
}

export function ProjectFilter({ filters, onChange }: ProjectFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getDocs(query(categoriesRef(), where('isActive', '==', true)))
      .then(snap => setCategories(snap.docs.map(d => ({ ...d.data() as Category, categoryId: d.id }))))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-luxa-text-dim" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          type="text"
          placeholder="Search projects..."
          value={filters.search}
          onChange={e => onChange({ search: e.target.value })}
          className="input pl-9 py-2.5 text-sm"
        />
      </div>

      {/* Category */}
      <select
        value={filters.category}
        onChange={e => onChange({ category: e.target.value })}
        className="input w-auto py-2.5 text-sm"
      >
        <option value="">All Categories</option>
        {categories.map(c => (
          <option key={c.categoryId} value={c.categoryId ?? ''}>{c.name}</option>
        ))}
      </select>

      {/* Status */}
      <select
        value={filters.status}
        onChange={e => onChange({ status: e.target.value })}
        className="input w-auto py-2.5 text-sm"
      >
        <option value="">All Status</option>
        <option value="available">Available</option>
        <option value="featured">Featured</option>
        <option value="sold">Sold</option>
      </select>
    </div>
  );
}

export type { FilterState };
