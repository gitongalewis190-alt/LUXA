import type { Metadata } from 'next';
import { HeroAnimation } from '../components/hero/HeroAnimation';

export const metadata: Metadata = {
  title: 'LUXA — Advanced Vehicle Innovation Platform',
  description:
    'Discover, showcase, and acquire advanced vehicle concepts, engineering innovations, and automotive projects. Curated by Antonio.',
};

export default function LandingPage() {
  return (
    <main className="bg-slate-950">
      <HeroAnimation />
    </main>
  );
}
