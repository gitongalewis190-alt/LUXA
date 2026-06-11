'use client';

import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export type GlassVariant = 'default' | 'ocean' | 'fire' | 'heavy' | 'elevated' | 'admin';
export type GlassSize    = 'sm' | 'md' | 'lg' | 'none';

export interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children:       ReactNode;
  variant?:       GlassVariant;
  size?:          GlassSize;
  isLoading?:     boolean;
  isInteractive?: boolean;
  isSelected?:    boolean;
  glowColor?:     'ocean' | 'fire' | 'none';
  className?:     string;
}

const VARIANT_STYLES: Record<GlassVariant, string> = {
  default:  'bg-[rgba(8,13,26,0.60)] border border-[rgba(255,255,255,0.06)] shadow-glass',
  ocean:    'bg-gradient-to-br from-[rgba(0,102,204,0.12)] to-[rgba(0,168,255,0.06)] border border-[rgba(0,168,255,0.18)] shadow-[0_4px_24px_rgba(0,168,255,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]',
  fire:     'bg-gradient-to-br from-[rgba(255,107,53,0.12)] to-[rgba(255,107,53,0.04)] border border-[rgba(255,107,53,0.20)] shadow-[0_4px_24px_rgba(255,107,53,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]',
  heavy:    'bg-[rgba(5,8,16,0.85)] border border-[rgba(255,255,255,0.10)] shadow-card blur-heavy',
  elevated: 'bg-[rgba(10,16,30,0.75)] border border-[rgba(255,255,255,0.10)] shadow-[0_12px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.10)]',
  admin:    'bg-[rgba(3,5,12,0.96)] border border-[rgba(255,107,53,0.15)] shadow-admin-panel blur-max',
};

const SIZE_STYLES: Record<GlassSize, string> = {
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
  none: '',
};

const GLOW_STYLES: Record<string, string> = {
  ocean: 'ring-glow-ocean',
  fire:  'ring-glow-fire',
  none:  '',
};

const interactiveVariants = {
  idle:    { scale: 1,    y: 0 },
  hover:   { scale: 1.01, y: -2 },
  pressed: { scale: 0.98, y: 0  },
};

const selectedStyles = 'border-[rgba(0,212,255,0.35)] shadow-[0_0_0_1px_rgba(0,212,255,0.2),0_8px_32px_rgba(0,212,255,0.15)]';

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    {
      children,
      variant       = 'default',
      size          = 'md',
      isLoading     = false,
      isInteractive = false,
      isSelected    = false,
      glowColor     = 'none',
      className     = '',
      ...motionProps
    },
    ref
  ) {
    const baseClasses = [
      'relative',
      'rounded-glass',
      'overflow-hidden',
      'blur-glass',
      VARIANT_STYLES[variant],
      SIZE_STYLES[size],
      glowColor !== 'none' ? GLOW_STYLES[glowColor] : '',
      isSelected ? selectedStyles : '',
      isInteractive ? 'cursor-pointer' : '',
      'transition-all duration-300 ease-spring',
      className,
    ].filter(Boolean).join(' ');

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        variants={isInteractive ? interactiveVariants : undefined}
        initial={isInteractive ? 'idle' : undefined}
        whileHover={isInteractive ? 'hover' : undefined}
        whileTap={isInteractive ? 'pressed' : undefined}
        {...motionProps}
      >
        {/* Top-lit glass edge */}
        <div
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)' }}
          aria-hidden="true"
        />

        {isLoading ? <SkeletonContent /> : children}
      </motion.div>
    );
  }
);

function SkeletonContent() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="skeleton w-full h-48 rounded-glass-sm" />
      <div className="space-y-2 px-1">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
      </div>
      <div className="flex justify-between items-center px-1">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-8 w-24 rounded-glass-sm" />
      </div>
    </div>
  );
}

export function Skeleton({ className = '', height = 'h-4' }: { className?: string; height?: string }) {
  return <div className={`skeleton ${height} rounded ${className}`} aria-hidden="true" />;
}

export function ProjectCardSkeleton() {
  return (
    <GlassCard size="none" className="overflow-hidden" aria-label="Loading project">
      <div className="skeleton w-full aspect-video" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-20 rounded-full" />
        </div>
        <div className="skeleton h-6 w-4/5 rounded" />
        <div className="skeleton h-4 w-3/5 rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="skeleton h-7 w-24 rounded" />
          <div className="skeleton h-9 w-28 rounded-glass-sm" />
        </div>
      </div>
    </GlassCard>
  );
}

export function StatCardSkeleton() {
  return (
    <GlassCard size="md" aria-label="Loading statistic">
      <div className="flex justify-between items-start mb-4">
        <div className="skeleton h-4 w-28 rounded" />
        <div className="skeleton h-8 w-8 rounded-glass-sm" />
      </div>
      <div className="skeleton h-10 w-32 rounded mb-2" />
      <div className="skeleton h-3 w-20 rounded" />
    </GlassCard>
  );
}
