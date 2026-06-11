'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

type HeroPhase = 'idle' | 'drifting' | 'smoke-rising' | 'smoke-clear' | 'text-reveal' | 'complete';

const TIMING = {
  START_DRIFT:   200,
  SMOKE_RISE:    800,
  SMOKE_CLEAR:   1800,
  TEXT_REVEAL:   2800,
  AMBIENT:       4000,
};

const tireVariants = {
  idle:     { x: 0, rotate: 0, scale: 1, transition: { duration: 0 } },
  drifting: { x: '-6%', rotate: -2, scale: 1.03, transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const smokeVariants = {
  hidden:   { opacity: 0, scale: 0.75, y: 20 },
  rising:   { opacity: 1, scale: 1, y: 0, transition: { duration: 1.0, ease: 'easeOut' } },
  clearing: { opacity: 0, y: -40, scale: 1.15, filter: 'blur(20px)', transition: { duration: 1.4, ease: 'easeIn' } },
};

const textVariants = {
  hidden:  { opacity: 0, y: 40, skewY: 2, filter: 'blur(16px)' },
  visible: { opacity: 1, y: 0, skewY: 0, filter: 'blur(0px)', transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const subtitleVariants = {
  hidden:  { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const btnVariants = {
  hidden:  { opacity: 0, y: 20, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export function HeroAnimation() {
  const [phase, setPhase]             = useState<HeroPhase>('idle');
  const [imageLoaded, setImageLoaded] = useState(false);
  const prefersReducedMotion          = useReducedMotion();
  const timersRef                     = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  useEffect(() => {
    if (!imageLoaded) return;

    if (prefersReducedMotion) {
      setPhase('complete');
      return;
    }

    const schedule = (fn: () => void, delay: number) => {
      const t = setTimeout(fn, delay);
      timersRef.current.push(t);
    };

    schedule(() => setPhase('drifting'),     TIMING.START_DRIFT);
    schedule(() => setPhase('smoke-rising'), TIMING.SMOKE_RISE);
    schedule(() => setPhase('smoke-clear'),  TIMING.SMOKE_CLEAR);
    schedule(() => setPhase('text-reveal'),  TIMING.TEXT_REVEAL);
    schedule(() => setPhase('complete'),     TIMING.AMBIENT);
  }, [imageLoaded, prefersReducedMotion]);

  const isSmokeVisible    = phase === 'smoke-rising' || phase === 'smoke-clear';
  const isTextVisible     = phase === 'text-reveal'  || phase === 'complete';
  const areButtonsVisible = phase === 'complete';

  const tireAnimState = (phase === 'idle') ? 'idle' : 'drifting';

  return (
    <section
      className="relative w-full min-h-dvh flex items-center justify-center overflow-hidden"
      aria-label="LUXA Platform Introduction"
    >
      <div className="absolute inset-0 bg-luxa-void" />
      <div className="absolute inset-0 bg-luxa-hero opacity-100" />

      {/* Grid lines — Layer 04 */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,168,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,168,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="absolute bottom-0 right-0 w-[70vw] h-[70vh] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 80% 100%, rgba(255,107,53,0.12) 0%, transparent 60%)' }} />
      <div className="absolute top-0 left-0 w-[60vw] h-[60vh] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 10% 0%, rgba(0,102,204,0.10) 0%, transparent 60%)' }} />

      {/* Tire image — Layer 07 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative w-full h-full gpu"
          variants={tireVariants}
          animate={tireAnimState}
        >
          <Image
            src="/images/hero-tire.jpg"
            alt="LUXA — Vehicle innovation in motion"
            fill
            priority
            quality={95}
            className="object-cover object-center select-none"
            style={{ opacity: 0.85 }}
            onLoad={() => setImageLoaded(true)}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(5,8,16,0.5) 70%, rgba(5,8,16,0.85) 100%), linear-gradient(180deg, rgba(5,8,16,0.4) 0%, transparent 30%, transparent 70%, rgba(5,8,16,0.7) 100%)`,
            }}
          />
        </motion.div>
      </div>

      {/* Smoke — Layer 08 */}
      <AnimatePresence>
        {isSmokeVisible && (
          <motion.div
            key="smoke"
            className="absolute inset-0 pointer-events-none"
            variants={smokeVariants}
            initial="hidden"
            animate={phase === 'smoke-clear' ? 'clearing' : 'rising'}
            exit={{ opacity: 0 }}
          >
            <div className="absolute" style={{ bottom: '15%', left: '5%', width: '45%', height: '60%', background: 'radial-gradient(ellipse at 40% 60%, rgba(139,144,153,0.75) 0%, rgba(139,144,153,0.4) 40%, transparent 70%)', filter: 'blur(24px)' }} />
            <div className="absolute" style={{ bottom: '10%', right: '8%', width: '50%', height: '55%', background: 'radial-gradient(ellipse at 60% 50%, rgba(139,144,153,0.65) 0%, rgba(139,144,153,0.35) 45%, transparent 70%)', filter: 'blur(28px)' }} />
            <div className="absolute" style={{ bottom: '5%', left: '50%', transform: 'translateX(-50%)', width: '70%', height: '80%', background: 'radial-gradient(ellipse at 50% 80%, rgba(110,115,120,0.85) 0%, rgba(110,115,120,0.5) 35%, transparent 65%)', filter: 'blur(32px)' }} />
            <div className="absolute" style={{ bottom: '0%', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '40%', background: 'radial-gradient(ellipse at 50% 100%, rgba(255,107,53,0.45) 0%, rgba(255,107,53,0.2) 40%, transparent 70%)', filter: 'blur(20px)' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content — Layer 10 */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24 max-w-4xl mx-auto">

        <AnimatePresence>
          {isTextVisible && (
            <motion.div key="luxa-text" variants={textVariants} initial="hidden" animate="visible" className="mb-6">
              <h1
                className="font-display font-bold tracking-[-0.06em] leading-none select-none"
                style={{
                  fontSize: 'clamp(5rem, 16vw, 12rem)',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(240,244,255,0.85) 50%, rgba(0,212,255,0.6) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                LUXA
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isTextVisible && (
            <motion.p
              key="subtitle"
              variants={subtitleVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: prefersReducedMotion ? 0 : 0.3 }}
              className="text-luxa-text-muted font-body text-lg md:text-xl max-w-lg mx-auto leading-relaxed mb-12"
            >
              Advanced vehicle concepts, engineering innovations, and automotive
              projects — curated and created by Antonio.
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {areButtonsVisible && (
            <motion.div key="ctas" className="flex flex-col sm:flex-row items-center gap-4">
              <motion.div variants={btnVariants} initial="hidden" animate="visible">
                <Link href="/browse" className="btn-primary text-base px-8 py-3.5 rounded-glass-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  Browse Projects
                </Link>
              </motion.div>
              <motion.div variants={btnVariants} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
                <Link href="/signup" className="btn-secondary text-base px-8 py-3.5 rounded-glass-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  Join LUXA
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              key="scroll-indicator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
              aria-hidden="true"
            >
              <span className="text-luxa-text-dim text-label font-body tracking-widest uppercase">Scroll</span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-px h-10"
                style={{ background: 'linear-gradient(180deg, rgba(0,212,255,0.6) 0%, transparent 100%)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ambient fire line — bottom edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,107,53,0.5) 30%, rgba(255,184,0,0.4) 50%, rgba(255,107,53,0.5) 70%, transparent 100%)',
          boxShadow: '0 0 20px rgba(255,107,53,0.3)',
        }}
      />
    </section>
  );
}
