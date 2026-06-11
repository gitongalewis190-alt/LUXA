'use client';

// HeroAnimation.tsx
// LUXA Landing Hero — Tire Drift → Smoke Billow → LUXA Reveal
// Timing: 0 → static | 200 → drift | 800 → smoke | 1400 → clear | 1800 → text | 2400 → CTAs | 2700 → ambient
// Skill rules applied: transform/opacity only, spring easing, stagger 150ms, prefers-reduced-motion respected

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link  from 'next/link';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useTransform,
  animate,
  type Variants,
} from 'framer-motion';

// ─── Phase state machine ──────────────────────────────────────────────────────
type Phase = 'static' | 'drifting' | 'smoke' | 'clearing' | 'revealing' | 'complete';

const TIMING: Record<string, number> = {
  DRIFT:   200,
  SMOKE:   800,
  CLEAR:   1400,
  TEXT:    1800,
  SUB:     2100,
  BTN_1:   2400,
  BTN_2:   2550,
  AMBIENT: 2700,
};

// ─── Motion Variants (spec: spring easing, transform/opacity only) ────────────
const SPRING = [0.16, 1, 0.3, 1] as [number,number,number,number];
const DRIFT_EASE = [0.25, 0.46, 0.45, 0.94] as [number,number,number,number];

const tireV: Variants = {
  static:   { x: '0%', rotate: 0, scale: 1 },
  drifting: {
    x:      '-6%',
    rotate: -2,
    scale:  1.04,
    transition: { duration: 1.4, ease: DRIFT_EASE },
  },
};

const smokeV: Variants = {
  hidden:   { opacity: 0, scale: 0.8, y: 30 },
  visible:  { opacity: 1, scale: 1.0, y: 0,   transition: { duration: 1.1, ease: 'easeOut' } },
  clearing: { opacity: 0, scale: 1.2, y: -50, filter: 'blur(24px)', transition: { duration: 1.6, ease: 'easeIn' } },
};

const wordmarkV: Variants = {
  hidden:  { opacity: 0, y: 48, skewY: 3, filter: 'blur(20px)' },
  visible: { opacity: 1, y: 0,  skewY: 0, filter: 'blur(0px)', transition: { duration: 1.2, ease: SPRING } },
};

const subtitleV: Variants = {
  hidden:  { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.9, ease: SPRING } },
};

const btnV: Variants = {
  hidden:  { opacity: 0, y: 20, scale: 0.94 },
  visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.8, ease: SPRING } },
};

const scrollV: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.8, duration: 0.6 } },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function HeroAnimation() {
  const [phase,        setPhase]        = useState<Phase>('static');
  const [imageLoaded,  setImageLoaded]  = useState(false);
  const [imageError,   setImageError]   = useState(false);
  const prefersReduced = useReducedMotion();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const t = setTimeout(fn, delay);
    timers.current.push(t);
  }, []);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  // Start sequence once image signals ready (or on error, we use CSS fallback)
  useEffect(() => {
    if (!imageLoaded && !imageError) return;

    if (prefersReduced) {
      setPhase('complete');
      return;
    }

    schedule(() => setPhase('drifting'),  TIMING.DRIFT);
    schedule(() => setPhase('smoke'),     TIMING.SMOKE);
    schedule(() => setPhase('clearing'),  TIMING.CLEAR);
    schedule(() => setPhase('revealing'), TIMING.TEXT);
    schedule(() => setPhase('complete'),  TIMING.AMBIENT);
  }, [imageLoaded, imageError, prefersReduced, schedule]);

  const inDrift    = phase !== 'static';
  const smokeShown = phase === 'smoke';
  const smokeClear = phase === 'clearing';
  const textShown  = phase === 'revealing' || phase === 'complete';
  const btnsShown  = phase === 'complete';

  return (
    <section
      className="relative w-full min-h-dvh flex items-center justify-center overflow-hidden"
      aria-label="LUXA — Advanced Vehicle Innovation"
    >

      {/* ── Layer 01: Void background ── */}
      <div className="absolute inset-0 bg-luxa-void" />

      {/* ── Layer 02: Noise texture (3% grain) ── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Layer 03: Radial ocean bloom (top-left) ── */}
      <div
        className="absolute top-0 left-0 w-[65vw] h-[65vh] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 10% 5%, rgba(0,102,204,0.14) 0%, transparent 62%)' }}
      />

      {/* ── Layer 03: Radial fire bloom (bottom-right) ── */}
      <div
        className="absolute bottom-0 right-0 w-[75vw] h-[75vh] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 85% 95%, rgba(255,107,53,0.16) 0%, transparent 58%)' }}
      />

      {/* ── Layer 04: Topology grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(0,168,255,0.04) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(0,168,255,0.04) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '72px 72px',
        }}
      />

      {/* ── Layer 07: Tire image (or CSS fallback scene) ── */}
      <div className="absolute inset-0">
        <motion.div
          className="w-full h-full gpu"
          variants={tireV}
          animate={inDrift ? 'drifting' : 'static'}
        >
          {/* Real hero image */}
          {!imageError && (
            <Image
              src="/images/hero-tire.jpg"
              alt=""
              fill
              priority
              quality={95}
              className="object-cover object-center select-none"
              style={{ opacity: 0.82 }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}

          {/* CSS fallback scene — fires immediately if image fails */}
          {imageError && <TireSceneFallback onReady={() => setImageLoaded(true)} />}
        </motion.div>

        {/* Vignette — preserves text contrast regardless of image */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              'radial-gradient(ellipse at 50% 55%, transparent 28%, rgba(5,8,16,0.55) 62%, rgba(5,8,16,0.88) 100%)',
              'linear-gradient(180deg, rgba(5,8,16,0.5) 0%, transparent 25%, transparent 72%, rgba(5,8,16,0.85) 100%)',
            ].join(', '),
          }}
        />
      </div>

      {/* ── Layer 08: Smoke ── */}
      <AnimatePresence>
        {(smokeShown || smokeClear) && (
          <motion.div
            key="smoke"
            className="absolute inset-0 pointer-events-none"
            variants={smokeV}
            initial="hidden"
            animate={smokeClear ? 'clearing' : 'visible'}
            exit={{ opacity: 0 }}
          >
            {/* Left cloud */}
            <div className="absolute" style={{ bottom: '12%', left: '2%', width: '50%', height: '65%',
              background: 'radial-gradient(ellipse at 38% 58%, rgba(130,136,145,0.8) 0%, rgba(130,136,145,0.42) 42%, transparent 68%)',
              filter: 'blur(22px)' }} />
            {/* Right cloud */}
            <div className="absolute" style={{ bottom: '8%', right: '4%', width: '52%', height: '58%',
              background: 'radial-gradient(ellipse at 62% 48%, rgba(125,132,140,0.7) 0%, rgba(125,132,140,0.36) 46%, transparent 70%)',
              filter: 'blur(28px)' }} />
            {/* Central dense cloud */}
            <div className="absolute" style={{ bottom: '2%', left: '50%', transform: 'translateX(-50%)', width: '74%', height: '82%',
              background: 'radial-gradient(ellipse at 50% 78%, rgba(105,110,118,0.88) 0%, rgba(105,110,118,0.5) 36%, transparent 64%)',
              filter: 'blur(36px)' }} />
            {/* Fire glow through smoke base */}
            <div className="absolute" style={{ bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '62%', height: '44%',
              background: 'radial-gradient(ellipse at 50% 100%, rgba(255,107,53,0.5) 0%, rgba(255,140,0,0.22) 40%, transparent 70%)',
              filter: 'blur(18px)' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Layer 10: Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-[var(--nav-height)] pb-28 w-full max-w-5xl mx-auto">

        {/* LUXA Wordmark */}
        <AnimatePresence>
          {textShown && (
            <motion.div
              key="wordmark"
              variants={wordmarkV}
              initial="hidden"
              animate="visible"
              className="mb-5 select-none"
            >
              <h1
                className="font-display font-bold leading-none tracking-[-0.06em]"
                style={{
                  fontSize: 'clamp(5.5rem, 18vw, 13rem)',
                  background: 'linear-gradient(145deg, #FFFFFF 0%, rgba(248,252,255,0.9) 40%, rgba(0,212,255,0.65) 80%, rgba(0,168,255,0.4) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.06em',
                  lineHeight: 0.88,
                }}
              >
                LUXA
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider glow line */}
        <AnimatePresence>
          {textShown && (
            <motion.div
              key="divider"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.8, ease: SPRING }}
              className="w-24 h-px mb-6 origin-center"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.7), transparent)' }}
            />
          )}
        </AnimatePresence>

        {/* Subtitle */}
        <AnimatePresence>
          {textShown && (
            <motion.p
              key="subtitle"
              variants={subtitleV}
              initial="hidden"
              animate="visible"
              transition={{ delay: prefersReduced ? 0 : 0.2 }}
              className="font-body text-luxa-text-muted max-w-md mx-auto mb-12 leading-relaxed"
              style={{ fontSize: 'clamp(1rem, 2.2vw, 1.2rem)', fontWeight: 400, letterSpacing: '0.01em' }}
            >
              Advanced vehicle concepts, engineering innovations,
              and automotive projects — curated by&nbsp;Antonio.
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTA Buttons — stagger 150ms (skill spec) */}
        <AnimatePresence>
          {btnsShown && (
            <motion.div
              key="ctas"
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              {/* Primary */}
              <motion.div variants={btnV} initial="hidden" animate="visible">
                <Link
                  href="/browse"
                  className="btn-primary inline-flex items-center gap-2.5 px-8 py-3.5 text-[0.9375rem] rounded-glass-sm"
                >
                  <BrowseIcon />
                  Browse Projects
                </Link>
              </motion.div>

              {/* Secondary */}
              <motion.div
                variants={btnV}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.15 }}
              >
                <Link
                  href="/signup"
                  className="btn-secondary inline-flex items-center gap-2.5 px-8 py-3.5 text-[0.9375rem] rounded-glass-sm"
                >
                  <JoinIcon />
                  Join LUXA
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll indicator */}
        <AnimatePresence>
          {btnsShown && (
            <motion.div
              key="scroll"
              variants={scrollV}
              initial="hidden"
              animate="visible"
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
              aria-hidden="true"
            >
              <span className="text-luxa-text-dim font-body uppercase tracking-[0.18em]" style={{ fontSize: '0.625rem' }}>
                Scroll
              </span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-px h-10"
                style={{ background: 'linear-gradient(180deg, rgba(0,212,255,0.7) 0%, transparent 100%)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Ambient fire edge line ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,107,53,0.55) 28%, rgba(255,184,0,0.45) 50%, rgba(255,107,53,0.55) 72%, transparent 100%)',
          boxShadow: '0 0 24px rgba(255,107,53,0.35)',
        }}
      />

      {/* ── Ambient pulsing glow (complete state only) ── */}
      {btnsShown && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0, 0.04, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,168,255,1) 0%, transparent 60%)' }}
        />
      )}
    </section>
  );
}

// ─── CSS Fallback Scene (when hero-tire.jpg is absent) ────────────────────────
function TireSceneFallback({ onReady }: { onReady: () => void }) {
  useEffect(() => { onReady(); }, [onReady]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dark asphalt ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[45%]"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(10,12,18,0.95) 100%)' }} />

      {/* Tire silhouette */}
      <TireSVG />

      {/* Heat shimmer */}
      <div className="absolute" style={{
        bottom: '40%', left: '48%', transform: 'translateX(-50%)',
        width: '18vw', height: '8vh',
        background: 'radial-gradient(ellipse, rgba(255,140,0,0.3) 0%, transparent 70%)',
        filter: 'blur(12px)',
      }} />

      {/* Road surface line */}
      <div className="absolute bottom-[38%] left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
    </div>
  );
}

function TireSVG() {
  return (
    <svg
      className="absolute gpu"
      viewBox="0 0 400 400"
      aria-hidden="true"
      style={{
        bottom: '30%',
        left: '42%',
        width: 'clamp(200px, 35vw, 480px)',
        height: 'auto',
        opacity: 0.75,
        filter: 'drop-shadow(0 0 60px rgba(255,107,53,0.3))',
      }}
    >
      {/* Outer tire */}
      <circle cx="200" cy="200" r="180" fill="#0c0e12" stroke="#1e2028" strokeWidth="6" />
      {/* Tread band */}
      <circle cx="200" cy="200" r="168" fill="none" stroke="#161820" strokeWidth="28" />
      {/* Tread blocks */}
      {Array.from({ length: 24 }).map((_, i) => (
        <rect
          key={i}
          x="192" y="20"
          width="16" height="32"
          rx="3"
          fill="#1c1e26"
          transform={`rotate(${i * 15} 200 200)`}
        />
      ))}
      {/* Sidewall ring */}
      <circle cx="200" cy="200" r="135" fill="#0a0c10" stroke="#12141c" strokeWidth="4" />
      {/* Rim outer */}
      <circle cx="200" cy="200" r="118" fill="#111318" stroke="rgba(200,203,212,0.15)" strokeWidth="2" />
      {/* Spokes */}
      {Array.from({ length: 5 }).map((_, i) => (
        <line
          key={i}
          x1="200" y1="200"
          x2="200" y2="88"
          stroke="rgba(200,203,212,0.2)"
          strokeWidth="12"
          strokeLinecap="round"
          transform={`rotate(${i * 72} 200 200)`}
        />
      ))}
      {/* Hub */}
      <circle cx="200" cy="200" r="28" fill="#0d0f14" stroke="rgba(200,203,212,0.25)" strokeWidth="3" />
      <circle cx="200" cy="200" r="14" fill="#151720" />
      {/* Chrome rim highlight */}
      <ellipse cx="155" cy="148" rx="18" ry="8" fill="rgba(200,203,212,0.06)" transform="rotate(-30 155 148)" />
    </svg>
  );
}

// ─── Icon components ──────────────────────────────────────────────────────────
function BrowseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function JoinIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  );
}
