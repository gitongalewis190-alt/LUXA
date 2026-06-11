'use client';

import { useEffect, type ReactNode, Suspense } from 'react';
import dynamic from 'next/dynamic';

const AuthProvider = dynamic(() => import('../lib/hooks/useAuth').then(m => m.AuthProvider), { ssr: false });

function PlatformConfigProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      (async () => {
        const { onSnapshot } = await import('firebase/firestore');
        const { configRef } = await import('../lib/firestore');

        onSnapshot(
          configRef(),
          (snap) => {
            if (!snap.exists()) return;
            const config = snap.data() as any;
            const root = document.documentElement;

            root.style.setProperty('--luxa-primary', config.colors?.primary ?? '#0066CC');
            root.style.setProperty('--luxa-secondary', config.colors?.secondary ?? '#00A8FF');
            root.style.setProperty('--luxa-accent', config.colors?.accent ?? '#2D6A4F');
            root.style.setProperty('--luxa-background', config.colors?.background ?? '#050810');
          },
          () => {}
        );
      })();
    } catch {}
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthProvider>
        <PlatformConfigProvider>
          {children}
        </PlatformConfigProvider>
      </AuthProvider>
    </Suspense>
  );
}
