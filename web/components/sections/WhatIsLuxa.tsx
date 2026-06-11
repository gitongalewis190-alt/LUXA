'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const SPRING = { ease: [0.16, 1, 0.3, 1] as const, duration: 0.7 };

const pillars = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
        <circle cx="16" cy="16" r="6" fill="currentColor" fillOpacity="0.15" />
        <path d="M16 3v4M16 25v4M3 16h4M25 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="2.5" fill="currentColor" />
      </svg>
    ),
    accent: '#00D4FF',
    label: 'Discover',
    heading: 'Curated vehicle concepts',
    body:
      'A hand-selected library of advanced automotive engineering — from electric drivetrains to aerodynamic body studies. Every project vetted by Antonio.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M6 26L16 6l10 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" />
        <path d="M9.5 19.5h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="6" r="2.5" fill="currentColor" />
      </svg>
    ),
    accent: '#FF6B35',
    label: 'Showcase',
    heading: 'Build your creator profile',
    body:
      'Upload engineering documentation, renders, prototypes, and concepts. Your work earns visibility — and an audience of buyers who understand what they\'re looking at.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="4" y="8" width="24" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M4 13h24" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
        <rect x="8" y="18" width="6" height="2.5" rx="1" fill="currentColor" fillOpacity="0.6" />
        <rect x="18" y="18" width="6" height="2.5" rx="1" fill="currentColor" fillOpacity="0.3" />
      </svg>
    ),
    accent: '#2D6A4F',
    label: 'Acquire',
    heading: 'Direct commerce, no middlemen',
    body:
      'Purchase project documentation, licenses, and engineering assets directly. Facilitated checkout with M-Pesa and card — funds released to creators transparently.',
  },
];

export function WhatIsLuxa() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-24 border-t border-[rgba(255,255,255,0.06)]">
      <div className="container-luxa">

        {/* Section header */}
        <motion.div
          className="max-w-xl mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...SPRING, delay: 0 }}
        >
          <p className="text-luxa-cyan text-label uppercase tracking-widest mb-3">The Platform</p>
          <h2 className="font-display font-bold text-display mb-4">
            What is LUXA?
          </h2>
          <p className="text-luxa-text-muted text-lg leading-relaxed">
            LUXA is a dual-layer digital exhibition and marketplace for advanced vehicle concepts,
            engineering innovations, and automotive project documentation — curated by Antonio.
          </p>
        </motion.div>

        {/* Pillar cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.label}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...SPRING, delay: 0.1 + i * 0.07 }}
            >
              <PillarCard {...pillar} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarCard({
  icon,
  accent,
  label,
  heading,
  body,
}: (typeof pillars)[0]) {
  return (
    <motion.div
      className="relative rounded-2xl p-8 h-full flex flex-col gap-5 overflow-hidden"
      style={{
        background: 'rgba(8, 13, 26, 0.55)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
      whileHover={{ y: -4, boxShadow: `0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)` }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
    >
      {/* Accent bloom */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
        }}
      />

      {/* Icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: `${accent}12`,
          border: `1px solid ${accent}28`,
          color: accent,
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2">
        <p
          className="text-label uppercase tracking-widest font-medium"
          style={{ color: accent }}
        >
          {label}
        </p>
        <h3 className="font-display font-semibold text-xl leading-snug">{heading}</h3>
        <p className="text-luxa-text-muted text-sm leading-relaxed">{body}</p>
      </div>
    </motion.div>
  );
}
