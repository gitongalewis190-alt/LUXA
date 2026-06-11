import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { AdminSignalDetector } from '../components/common/AdminSignalDetector';
import { HeroAnimation }       from '../components/hero/HeroAnimation';

const FeaturedSection     = dynamic(() => import('../components/sections/FeaturedSection').then(m => m.FeaturedSection),         { ssr: false });
const CategorySection     = dynamic(() => import('../components/sections/CategorySection').then(m => m.CategorySection),         { ssr: false });
const AntonioSection      = dynamic(() => import('../components/sections/AntonioSection').then(m => m.AntonioSection),           { ssr: false });
const CompanyShareSection = dynamic(() => import('../components/sections/CompanyShareSection').then(m => m.CompanyShareSection), { ssr: false });
const JoinSection         = dynamic(() => import('../components/sections/JoinSection').then(m => m.JoinSection),                 { ssr: false });
const LandingNav          = dynamic(() => import('../components/layout/LandingNav').then(m => m.LandingNav),                     { ssr: true  });
const LandingFooter       = dynamic(() => import('../components/layout/LandingFooter').then(m => m.LandingFooter),               { ssr: true  });

export const metadata: Metadata = {
  title: 'LUXA — Advanced Vehicle Innovation Platform',
  description: 'Discover, showcase, and acquire advanced vehicle concepts, engineering innovations, and automotive projects. Curated by Antonio.',
};

export default function LandingPage() {
  return (
    <>
      {/* Layer 20 — Admin signal detector (invisible, always active on landing) */}
      <AdminSignalDetector />

      <LandingNav />

      <main>
        <HeroAnimation />
        <FeaturedSection />
        <CategorySection />
        <AntonioSection />
        <CompanyShareSection />
        <JoinSection />
      </main>

      <LandingFooter />
    </>
  );
}
