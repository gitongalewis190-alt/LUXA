'use client';

import { useEffect, type ReactNode } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { AuthProvider } from '../lib/hooks/useAuth';
import { configRef, type PlatformConfig } from '../lib/firestore';

function PlatformConfigProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const unsubscribe = onSnapshot(
      configRef(),
      (snap) => {
        if (!snap.exists()) return;
        const config = snap.data() as PlatformConfig;
        const root   = document.documentElement;

        root.style.setProperty('--luxa-primary',    config.colors.primary   ?? '#0066CC');
        root.style.setProperty('--luxa-secondary',  config.colors.secondary ?? '#00A8FF');
        root.style.setProperty('--luxa-accent',     config.colors.accent    ?? '#2D6A4F');
        root.style.setProperty('--luxa-background', config.colors.background ?? '#050810');

        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
          metaTheme.setAttribute('content', config.colors.background ?? '#050810');
        }
      },
      (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[PlatformConfig] Firestore listener error:', error);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PlatformConfigProvider>
        {children}
      </PlatformConfigProvider>
    </AuthProvider>
  );
}
