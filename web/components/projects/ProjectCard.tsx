'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassCard } from '../common/GlassCard';
import { formatCurrency } from '../../lib/utils/formatCurrency';
import { formatRelative } from '../../lib/utils/formatDate';
import type { Project } from '../../lib/firestore';

interface ProjectCardProps {
  project: Project & { id: string };
  onLike?: (projectId: string) => void;
  isLiked?: boolean;
  showAddToCart?: boolean;
  onAddToCart?: (project: Project & { id: string }) => void;
  inCart?: boolean;
}

const statusStyles: Record<string, string> = {
  available: 'badge-available',
  sold:      'badge-sold',
  featured:  'badge-featured',
  unlisted:  'badge-unlisted',
};

export function ProjectCard({ project, onLike, isLiked, showAddToCart, onAddToCart, inCart }: ProjectCardProps) {
  return (
    <GlassCard size="none" isInteractive className="group overflow-hidden">
      {/* Thumbnail */}
      <Link href={`/browse/${project.id}`} className="block relative aspect-video overflow-hidden">
        <Image
          src={project.thumbnail || '/images/placeholder.png'}
          alt={project.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Antonio badge */}
        {project.isAntonioProject && (
          <span className="absolute top-3 left-3 badge-antonio text-[10px]">LUXA ORIGINAL</span>
        )}
        <span className={`absolute top-3 right-3 ${statusStyles[project.status] ?? 'badge-unlisted'}`}>
          {project.status}
        </span>
      </Link>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link href={`/browse/${project.id}`} className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-base text-luxa-text truncate hover:text-luxa-cyan transition-colors">
              {project.title}
            </h3>
            <p className="text-luxa-text-dim text-xs mt-0.5 truncate">{project.creatorName}</p>
          </Link>
          <p className="font-display font-bold text-luxa-text shrink-0">
            {formatCurrency(project.price, project.currency)}
          </p>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-luxa-text-dim text-xs mb-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {project.viewCount.toLocaleString()}
            </span>
            <button
              onClick={() => onLike?.(project.id)}
              className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-400' : 'hover:text-luxa-text'}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {project.likeCount}
            </button>
          </div>
          <span>{formatRelative(project.createdAt)}</span>
        </div>

        {/* Actions */}
        {project.status !== 'sold' && showAddToCart && (
          <button
            onClick={() => onAddToCart?.(project)}
            disabled={inCart}
            className={`w-full py-2.5 rounded-glass-sm text-sm font-semibold transition-all ${
              inCart
                ? 'bg-luxa-sky/20 text-luxa-sky border border-luxa-sky/30 cursor-default'
                : 'btn-primary'
            }`}
          >
            {inCart ? '✓ In Cart' : 'Add to Cart'}
          </button>
        )}
      </div>
    </GlassCard>
  );
}
