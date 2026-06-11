'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { GlassCard } from '../../../components/common/GlassCard';
import { useAuth } from '../../../lib/hooks/useAuth';
import { useMyProjects } from '../../../lib/hooks/useProjects';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatRelative } from '../../../lib/utils/formatDate';

type Tab = 'projects' | 'analytics' | 'wallet';

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const { projects, isLoading, deleteProject, updateProject } = useMyProjects();
  const [activeTab, setActiveTab] = useState<Tab>('projects');

  const totalRevenue  = projects.filter(p => p.status === 'sold').reduce((s, p) => s + p.price, 0);
  const projectsSold  = projects.filter(p => p.status === 'sold').length;
  const trendingProject = projects.sort((a, b) => b.viewCount - a.viewCount)[0];

  const tabs: { id: Tab; label: string }[] = [
    { id: 'projects',  label: 'My Projects' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'wallet',    label: 'Wallet' },
  ];

  return (
    <div className="min-h-dvh pt-[var(--nav-height)] pb-24">
      <div className="container-luxa pt-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl">Dashboard</h1>
            <p className="text-luxa-text-muted text-sm mt-1">
              {userData?.luzaId ?? user?.email}
            </p>
          </div>
          <Link href="/create-project" className="btn-primary">
            + New Project
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Projects',       value: projects.length },
            { label: 'Sold',           value: projectsSold },
            { label: 'Total Revenue',  value: formatCurrency(totalRevenue) },
            { label: 'Avg Views',      value: projects.length ? Math.round(projects.reduce((s, p) => s + p.viewCount, 0) / projects.length) : 0 },
          ].map(stat => (
            <GlassCard key={stat.label} size="md">
              <p className="text-luxa-text-dim text-xs uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="font-display font-bold text-2xl text-luxa-text">{stat.value}</p>
            </GlassCard>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass rounded-glass-sm w-fit mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-glass-sm text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-luxa-sky/20 text-luxa-cyan border border-luxa-sky/30'
                  : 'text-luxa-text-muted hover:text-luxa-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Projects tab */}
        {activeTab === 'projects' && (
          <div>
            {isLoading ? (
              <div className="text-center py-12 text-luxa-text-muted">Loading…</div>
            ) : projects.length === 0 ? (
              <GlassCard size="lg" className="text-center">
                <p className="text-4xl mb-4">📦</p>
                <p className="font-display font-semibold text-xl mb-2">No projects yet</p>
                <p className="text-luxa-text-muted text-sm mb-6">Share your first vehicle concept with the community.</p>
                <Link href="/create-project" className="btn-primary">Create Project</Link>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {projects.map(project => (
                  <GlassCard key={project.id} size="none" className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-14 rounded-glass-sm overflow-hidden shrink-0">
                        <Image src={project.thumbnail || '/images/placeholder.png'} alt={project.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{project.title}</h3>
                          <span className={`badge-${project.status} text-[10px] shrink-0`}>{project.status}</span>
                          {!project.isApproved && <span className="badge-pending text-[10px]">Pending</span>}
                        </div>
                        <p className="text-luxa-text-dim text-xs">
                          {project.viewCount} views · {project.likeCount} likes · {project.saleCount} sales
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={project.status}
                          onChange={e => updateProject(project.id, { status: e.target.value as Project['status'] })}
                          className="input w-auto py-1.5 text-xs"
                        >
                          <option value="available">Available</option>
                          <option value="unlisted">Unlisted</option>
                        </select>
                        <Link href={`/browse/${project.id}`} className="btn-icon w-8 h-8">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </Link>
                        <button onClick={() => deleteProject(project.id)} className="btn-icon w-8 h-8 hover:text-red-400">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/></svg>
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard size="md">
              <h3 className="font-display font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total views',    value: projects.reduce((s, p) => s + p.viewCount, 0).toLocaleString() },
                  { label: 'Total likes',    value: projects.reduce((s, p) => s + p.likeCount, 0).toLocaleString() },
                  { label: 'Projects sold',  value: projectsSold },
                  { label: 'Revenue',        value: formatCurrency(totalRevenue) },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-luxa-text-muted">{row.label}</span>
                    <span className="font-semibold">{row.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {trendingProject && (
              <GlassCard variant="ocean" size="md">
                <h3 className="font-display font-semibold mb-3">Trending Project</h3>
                <p className="text-luxa-cyan font-semibold">{trendingProject.title}</p>
                <p className="text-luxa-text-dim text-sm mt-1">{trendingProject.viewCount.toLocaleString()} views</p>
                <Link href={`/browse/${trendingProject.id}`} className="btn-secondary text-xs mt-4 inline-flex py-2 px-3">
                  View Project
                </Link>
              </GlassCard>
            )}
          </div>
        )}

        {/* Wallet tab */}
        {activeTab === 'wallet' && (
          <GlassCard size="md">
            <h3 className="font-display font-semibold mb-4">Wallet</h3>
            {userData?.walletAddress ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-luxa-text-muted">Provider</span>
                  <span className="capitalize">{userData.walletProvider}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-luxa-text-muted">Address</span>
                  <span className="font-mono text-xs">{userData.walletAddress.slice(0, 16)}…</span>
                </div>
              </div>
            ) : (
              <p className="text-luxa-text-muted text-sm">No wallet linked. Contact support to link your M-Pesa or bank wallet for payouts.</p>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
}

// Needed for the status type reference in onChange
type Project = import('../../../lib/firestore').Project;
