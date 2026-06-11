'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useAuth } from '../../lib/hooks/useAuth';

const SPRING = { type: 'spring' as const, stiffness: 60, damping: 15 };

// Particle system for dust effects
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  opacity: number;
  size: number;
}

export function HeroAnimation() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const prefersReduced = useReducedMotion();
  const wheelRotation = useMotionValue(0);
  const particleCountRef = useRef(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Realistic wheel rotation with physics
  useEffect(() => {
    if (prefersReduced) return;

    const controls = animate(wheelRotation, 720, {
      duration: 20,
      ease: 'linear',
      repeat: Infinity,
    });

    return () => controls.stop();
  }, [wheelRotation, prefersReduced]);

  // Dust particle generation as wheel rotates
  useEffect(() => {
    const unsubscribe = wheelRotation.on('change', (latest) => {
      if (prefersReduced) return;

      // Generate dust particles periodically based on rotation speed
      const particleSpawnRate = Math.abs(Math.sin(latest * Math.PI / 180)) * 0.5;
      if (Math.random() < particleSpawnRate) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 160 + Math.random() * 20;
        const speed = 2 + Math.random() * 3;

        setParticles((prev) => {
          const newParticles = [...prev];
          newParticles.push({
            id: particleCountRef.current++,
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            opacity: 0.6,
            size: 2 + Math.random() * 4,
          });
          return newParticles.slice(-100); // Keep max 100 particles
        });
      }
    });

    return () => unsubscribe();
  }, [wheelRotation, prefersReduced]);

  // Particle physics simulation
  useEffect(() => {
    const simulate = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15, // gravity
            vx: p.vx * 0.98, // air resistance
            life: p.life - 0.02,
            opacity: p.opacity * 0.95,
          }))
          .filter((p) => p.life > 0)
      );

      animationFrameRef.current = requestAnimationFrame(simulate);
    };

    animationFrameRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!mounted) return null;

  return (
    <section
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
      aria-label="LUXA Platform"
    >
      {/* Background glow */}
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

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 flex flex-col items-center justify-center min-h-screen">

        {/* Wheel with dust particles */}
        <motion.div
          className="mb-16 relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ...SPRING }}
        >
          {/* Particle rendering */}
          <div className="absolute inset-0 w-96 h-96 md:w-[450px] md:h-[450px] pointer-events-none">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute rounded-full bg-slate-400"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  left: `calc(50% + ${particle.x}px)`,
                  top: `calc(50% + ${particle.y}px)`,
                  opacity: particle.opacity * 0.7,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 6px rgba(148, 163, 184, 0.5)',
                }}
              />
            ))}
          </div>

          {/* Rotating wheel — upload your image here */}
          <motion.div
            className="w-80 h-80 md:w-[450px] md:h-[450px] relative"
            style={{ rotate: wheelRotation }}
          >
            <div className="w-full h-full relative rounded-full overflow-hidden shadow-2xl border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800">
              {/* Image placeholder — replace with your uploaded wheel/logo */}
              <Image
                src="/images/hero-tire.jpg"
                alt="LUXA Wheel"
                fill
                priority
                quality={95}
                className="object-cover object-center"
                onError={(e) => {
                  // Fallback if image missing
                  console.warn('Wheel image not found, using placeholder');
                }}
              />

              {/* Placeholder circles if image fails */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center border border-slate-500">
                  <span className="text-white/40 text-2xl font-display">LUXA</span>
                </div>
              </div>
            </div>

            {/* Glow halo around wheel (reacts to dust) */}
            <div
              className="absolute inset-0 rounded-full opacity-40 blur-2xl"
              style={{
                background: 'radial-gradient(circle, #00D4FF 0%, transparent 70%)',
                animation: prefersReduced ? 'none' : 'pulse 4s ease-in-out infinite',
              }}
            />
          </motion.div>

          {/* Speed lines / motion blur accent */}
          <div className="absolute inset-0 pointer-events-none">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute opacity-20"
                style={{
                  width: '100%',
                  height: '100%',
                  border: '2px solid #00D4FF',
                  borderRadius: '50%',
                  animation: prefersReduced ? 'none' : `spin ${20 + i * 5}s linear infinite`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-center mb-6 text-white"
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

        {/* Auth navigation buttons */}
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

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}
