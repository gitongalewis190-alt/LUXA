'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

const SPRING = { ease: [0.16, 1, 0.3, 1] as const, duration: 0.7 };

const steps = [
  {
    number: '01',
    accent: '#00D4FF',
    heading: 'Browse the exhibition',
    body: 'Explore the curated library of advanced vehicle concepts, aerodynamics studies, drivetrain documentation, and prototype builds — all approved by Antonio.',
    cta: { label: 'Start browsing', href: '/browse' },
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18 18l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: '02',
    accent: '#FF6B35',
    heading: 'Add to your cart',
    body: 'Select the documentation, licenses, or engineering assets you want. Cart persists across sessions — take your time to review before committing.',
    cta: null,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M4 5h2.5l3 12h11l2.5-8H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="13" cy="21.5" r="1.5" fill="currentColor" />
        <circle cx="19" cy="21.5" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    number: '03',
    accent: '#2D6A4F',
    heading: 'Checkout with M-Pesa',
    body: 'Secure checkout via M-Pesa STK Push or card. Funds are held transparently until delivery is confirmed, then released directly to the creator.',
    cta: { label: 'Create account', href: '/signup' },
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <rect x="4" y="8" width="20" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 12h20" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8" y="16" width="5" height="2" rx="0.75" fill="currentColor" fillOpacity="0.6" />
      </svg>
    ),
  },
];

export function HowItWorks() {
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
          <p className="text-luxa-fire text-label uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="font-display font-bold text-display mb-4">How it works</h2>
          <p className="text-luxa-text-muted text-lg leading-relaxed">
            Three steps from discovery to ownership. Built for engineers, collectors, and investors
            who know exactly what they want.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line — desktop only */}
          <div
            className="hidden md:block absolute top-[3.5rem] left-[calc(16.67%-1px)] right-[calc(16.67%-1px)] h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)',
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...SPRING, delay: 0.1 + i * 0.08 }}
              >
                <StepCard {...step} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  number,
  accent,
  heading,
  body,
  cta,
  icon,
}: (typeof steps)[0]) {
  return (
    <div className="flex flex-col gap-6">
      {/* Number badge + icon row */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
          style={{
            background: `${accent}12`,
            border: `1px solid ${accent}30`,
            color: accent,
          }}
        >
          {icon}
        </div>
        <span
          className="font-display font-bold text-5xl leading-none select-none"
          style={{ color: `${accent}20` }}
        >
          {number}
        </span>
      </div>

      {/* Content */}
      <motion.div
        className="rounded-2xl p-7 flex flex-col gap-4 h-full"
        style={{
          background: 'rgba(8, 13, 26, 0.50)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
        whileHover={{ y: -3 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
      >
        <h3 className="font-display font-semibold text-xl leading-snug">{heading}</h3>
        <p className="text-luxa-text-muted text-sm leading-relaxed flex-1">{body}</p>
        {cta && (
          <Link
            href={cta.href}
            className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: accent }}
          >
            {cta.label}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )}
      </motion.div>
    </div>
  );
}
