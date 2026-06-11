'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../lib/hooks/useAuth';

const SPRING = { type: 'spring' as const, stiffness: 60, damping: 15 };

export function HeroAnimation() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
      aria-label="LUXA Platform"
    >
      {/* Subtle background gradient + glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #0066CC, transparent)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FF6B35, transparent)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 flex flex-col items-center justify-center min-h-screen">

        {/* Rotating wheel — prominent centerpiece */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ...SPRING }}
        >
          <div
            className="w-80 h-80 md:w-96 md:h-96 relative"
            style={{
              animation: prefersReduced ? 'none' : 'spin 20s linear infinite',
            }}
          >
            {/* Placeholder wheel — will be replaced with uploaded company logo */}
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center shadow-2xl border border-slate-600">
              <div className="w-3/4 h-3/4 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center border border-slate-500">
                <span className="text-white/40 text-xl font-display">LUXA</span>
              </div>
            </div>

            {/* Glow effect around wheel */}
            <div
              className="absolute inset-0 rounded-full opacity-30 blur-xl"
              style={{
                background: 'radial-gradient(circle, #00D4FF, transparent)',
                animation: prefersReduced ? 'none' : 'pulse 3s ease-in-out infinite',
              }}
            />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-center mb-6 text-white max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ...SPRING }}
        >
          LUXA
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl md:text-2xl text-slate-300 text-center mb-12 max-w-2xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ...SPRING }}
        >
          Advanced Vehicle Innovation Platform
        </motion.p>

        {/* Navigation buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ...SPRING }}
        >
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                View Account
              </Link>
              <Link
                href="/browse"
                className="px-8 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
              >
                Browse
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
              >
                Log In
              </Link>
            </>
          )}
        </motion.div>
      </div>

      {/* Keyframe animation for wheel rotation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </section>
  );
}
