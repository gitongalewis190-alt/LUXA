'use client';

import { useEffect, type ReactNode } from 'react';
import { AuthProvider } from '../lib/hooks/useAuth';

function PlatformConfigProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Only run on client side
    try {
      import('firebase/firestore').then(({ onSnapshot }) => {
        import('../lib/firestore').then(({ configRef, type: _PlatformConfig }) => {
          const unsubscribe = onSnapshot(
            configRef(),
            (snap) => {
              if (!snap.exists()) return;
              const config = snap.data() as any;
              const root = document.documentElement;

              root.style.setProperty('--luxa-primary', config.colors?.primary ?? '#0066CC');
              root.style.setProperty('--luxa-secondary', config.colors?.secondary ?? '#00A8FF');
              root.style.setProperty('--luxa-accent', config.colors?.accent ?? '#2D6A4F');
              root.style.setProperty('--luxa-background', config.colors?.background ?? '#050810');

              const metaTheme = document.querySelector('meta[name="theme-color"]');
              if (metaTheme) {
                metaTheme.setAttribute('content', config.colors?.background ?? '#050810');
              }
            },
            (error) => {
              if (process.env.NODE_ENV === 'development') {
                console.error('[PlatformConfig] Firestore listener error:', error);
              }
            }
          );
          return () => unsubscribe();
        });
      });
    } catch (error) {
      // Silently fail if Firebase isn't available (e.g., during build)
      if (process.env.NODE_ENV === 'development') {
        console.warn('[PlatformConfig] Firebase not available');
      }
    }
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
