'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDocs, query, where } from 'firebase/firestore';
import { GlassCard } from '../../../components/common/GlassCard';
import { categoriesRef, type Category } from '../../../lib/firestore';
import { useCreateProject } from '../../../lib/hooks/useProjects';

export default function CreateProjectPage() {
  const router = useRouter();
  const { createProject, isSubmitting, error } = useCreateProject();
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    title:       '',
    description: '',
    category:    '',
    price:       '',
    currency:    'USD',
    status:      'available' as const,
    contentType: 'image' as const,
    tags:        '',
    mediaUrls:   [] as string[],
    thumbnail:   '',
  });

  useEffect(() => {
    getDocs(query(categoriesRef(), where('isActive', '==', true)))
      .then(snap => setCategories(snap.docs.map(d => ({ ...d.data() as Category, categoryId: d.id }))));
  }, []);

  const set = (k: string, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = await createProject({
        ...form,
        price:    parseFloat(form.price) || 0,
        tags:     form.tags.split(',').map(t => t.trim()).filter(Boolean),
        metadata: {},
      });
      router.push(`/browse/${id}`);
    } catch {}
  };

  return (
    <div className="min-h-dvh pt-[var(--nav-height)] pb-24">
      <div className="container-luxa pt-10 max-w-2xl">
        <h1 className="font-display font-bold text-3xl mb-8">Create Project</h1>

        {error && <div className="glass-fire rounded-glass-sm p-3 mb-5 text-sm text-red-300">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <GlassCard size="md">
            <h2 className="font-display font-semibold mb-5">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-luxa-text-muted mb-1.5">Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} required className="input" placeholder="Project title" />
              </div>
              <div>
                <label className="block text-sm text-luxa-text-muted mb-1.5">Description *</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} required rows={5} className="input resize-none" placeholder="Describe your project in detail..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-luxa-text-muted mb-1.5">Category</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)} required className="input">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.categoryId} value={c.categoryId ?? ''}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-luxa-text-muted mb-1.5">Content Type</label>
                  <select value={form.contentType} onChange={e => set('contentType', e.target.value)} className="input">
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="diagram">Diagram</option>
                    <option value="text">Text</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-luxa-text-muted mb-1.5">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => set('tags', e.target.value)} className="input" placeholder="v8, custom, turbo" />
              </div>
            </div>
          </GlassCard>

          <GlassCard size="md">
            <h2 className="font-display font-semibold mb-5">Pricing & Visibility</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-luxa-text-muted mb-1.5">Price *</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} required className="input" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm text-luxa-text-muted mb-1.5">Currency</label>
                <select value={form.currency} onChange={e => set('currency', e.target.value)} className="input">
                  <option value="USD">USD</option>
                  <option value="KES">KES</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-luxa-text-muted mb-1.5">Listing Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
                  <option value="available">Available (for sale)</option>
                  <option value="unlisted">Unlisted (showcase only)</option>
                </select>
              </div>
            </div>
          </GlassCard>

          <GlassCard size="md">
            <h2 className="font-display font-semibold mb-5">Media</h2>
            <p className="text-luxa-text-dim text-sm mb-4">Paste a publicly accessible image URL for the thumbnail (Firebase Storage URL after upload).</p>
            <div>
              <label className="block text-sm text-luxa-text-muted mb-1.5">Thumbnail URL</label>
              <input value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} className="input" placeholder="https://firebasestorage.googleapis.com/…" />
            </div>
          </GlassCard>

          <div className="flex gap-4">
            <button type="submit" disabled={isSubmitting} className="btn-primary px-8 py-3">
              {isSubmitting ? 'Submitting…' : 'Submit Project'}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-ghost px-8 py-3">Cancel</button>
          </div>

          <p className="text-luxa-text-dim text-xs">Your project will be reviewed by Antonio before going public.</p>
        </form>
      </div>
    </div>
  );
}
