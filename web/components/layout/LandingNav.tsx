'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/hooks/useAuth';
import { useCart } from '../../lib/hooks/useCart';

export function LandingNav() {
  const { user, logout } = useAuth();
  const itemCount = useCart(s => s.itemCount());
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-nav transition-all duration-300 ${
        scrolled ? 'bg-[rgba(5,8,16,0.85)] backdrop-blur-glass border-b border-[rgba(255,255,255,0.06)]' : 'bg-transparent'
      }`}
      style={{ height: 'var(--nav-height)' }}
    >
      <div className="container-luxa h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display font-bold text-xl tracking-[-0.04em] text-luxa-text">
          LUXA
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/browse" className="nav-link">Browse</Link>
          {user && <Link href="/dashboard" className="nav-link">Dashboard</Link>}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/cart" className="btn-icon relative">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-luxa-sky text-white text-[10px] font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setMenuOpen(!menuOpen)} className="btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>

              {menuOpen && (
                <div className="absolute top-16 right-4 w-56 glass-card rounded-glass p-2 shadow-card-hover z-modal">
                  <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-luxa-text-muted hover:text-luxa-text hover:bg-white/5 rounded-glass-sm transition-colors" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <Link href="/dashboard?tab=wallet" className="block px-4 py-2.5 text-sm text-luxa-text-muted hover:text-luxa-text hover:bg-white/5 rounded-glass-sm transition-colors" onClick={() => setMenuOpen(false)}>Wallet</Link>
                  <Link href="/saved" className="block px-4 py-2.5 text-sm text-luxa-text-muted hover:text-luxa-text hover:bg-white/5 rounded-glass-sm transition-colors" onClick={() => setMenuOpen(false)}>Saved Projects</Link>
                  <div className="divider my-1" />
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-glass-sm transition-colors">
                    Sign Out
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link href="/login"  className="btn-ghost text-sm px-4 py-2">Log In</Link>
              <Link href="/signup" className="btn-primary text-sm px-4 py-2">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
