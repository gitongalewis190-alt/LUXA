import type { Metadata } from 'next';
import { AdminSignalDetector } from '../components/common/AdminSignalDetector';
import { HeroAnimation } from '../components/hero/HeroAnimation';

export const metadata: Metadata = {
  title: 'LUXA — Advanced Vehicle Innovation Platform',
  description:
    'Discover, showcase, and acquire advanced vehicle concepts, engineering innovations, and automotive projects. Curated by Antonio.',
};

export default function LandingPage() {
  return (
    <>
      {/* Invisible admin gesture detector */}
      <AdminSignalDetector />

      <main>
        {/* Phase 1: Hero with rotating wheel + navigation options */}
        <HeroAnimation />
      </main>
    </>
  );
}
