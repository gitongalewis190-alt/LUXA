'use client';

import { useState, useEffect } from 'react';
import { setDoc, serverTimestamp } from 'firebase/firestore';
import { GlassCard } from '../../../components/common/GlassCard';
import { configRef, fetchPlatformConfig, type PlatformConfig } from '../../../lib/firestore';

const DEFAULT_CONFIG: PlatformConfig['colors'] = {
  primary:       '#0066CC',
  secondary:     '#00A8FF',
  accent:        '#2D6A4F',
  glass_overlay: 'rgba(255,255,255,0.1)',
  background:    '#050810',
};

export default function ConfigPage() {
  const [colors,      setColors]      = useState(DEFAULT_CONFIG);
  const [fee,         setFee]         = useState(15);
  const [sections,    setSections]    = useState({ browse_feed: true, company_shares: true, featured_carousel: true });
  const [isSaving,    setIsSaving]    = useState(false);
  const [saved,       setSaved]       = useState(false);

  useEffect(() => {
    fetchPlatformConfig().then(cfg => {
      if (!cfg) return;
      setColors(cfg.colors);
      setFee(cfg.facilitation_fee);
      setSections(cfg.visible_sections);
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await setDoc(configRef(), {
      colors,
      facilitation_fee:  fee,
      visible_sections:  sections,
      featured_projects: [],
      analytics:         { totalMembers: 0, totalProjects: 0, totalRevenue: 0, activeThisMonth: 0 },
      lastUpdatedAt:     serverTimestamp(),
    }, { merge: true });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const colorFields: { key: keyof typeof colors; label: string }[] = [
    { key: 'primary',       label: 'Primary (Ocean Blue)' },
    { key: 'secondary',     label: 'Secondary (Sky Blue)' },
    { key: 'accent',        label: 'Accent (Jungle Green)' },
    { key: 'background',    label: 'Background' },
    { key: 'glass_overlay', label: 'Glass Overlay' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl">Platform Config</h1>
        <button onClick={handleSave} disabled={isSaving} className="btn-fire px-6 py-2">
          {isSaving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Color Palette */}
        <GlassCard variant="admin" size="md">
          <h2 className="font-display font-semibold mb-5">Color Palette</h2>
          <p className="text-luxa-text-dim text-sm mb-5">Changes apply site-wide in real-time via Firestore.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colorFields.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={colors[key].startsWith('#') ? colors[key] : '#0066CC'}
                  onChange={e => setColors(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-10 h-10 rounded-glass-sm border border-[rgba(255,255,255,0.1)] bg-transparent cursor-pointer"
                />
                <div className="flex-1">
                  <label className="block text-sm text-luxa-text-muted mb-1">{label}</label>
                  <input
                    type="text"
                    value={colors[key]}
                    onChange={e => setColors(prev => ({ ...prev, [key]: e.target.value }))}
                    className="input py-1.5 text-sm font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Facilitation Fee */}
        <GlassCard variant="admin" size="md">
          <h2 className="font-display font-semibold mb-5">Commerce Settings</h2>
          <div className="max-w-xs">
            <label className="block text-sm text-luxa-text-muted mb-1.5">
              Facilitation Fee (%) — deducted from each sale
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="50"
                value={fee}
                onChange={e => setFee(parseFloat(e.target.value) || 0)}
                className="input py-2 text-sm"
              />
              <span className="text-luxa-text-muted text-sm">%</span>
            </div>
            <p className="text-luxa-text-dim text-xs mt-2">
              At {fee}%, a $500 sale pays out ${(500 * (1 - fee / 100)).toFixed(2)} to the creator.
            </p>
          </div>
        </GlassCard>

        {/* Section Visibility */}
        <GlassCard variant="admin" size="md">
          <h2 className="font-display font-semibold mb-5">Section Visibility</h2>
          <div className="space-y-3">
            {(Object.keys(sections) as (keyof typeof sections)[]).map(key => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setSections(prev => ({ ...prev, [key]: !prev[key] }))}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${sections[key] ? 'bg-luxa-sky' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${sections[key] ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
