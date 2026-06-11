import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { AdminSignalDetector } from '../components/common/AdminSignalDetector';
import { HeroAnimation }       from '../components/hero/HeroAnimation';
import { WhatIsLuxa }          from '../components/sections/WhatIsLuxa';
import { HowItWorks }          from '../components/sections/HowItWorks';
import { LandingNav }          from '../components/layout/LandingNav';
import { LandingFooter }       from '../components/layout/LandingFooter';

// Dynamic Firestore-backed sections — silently absent when collections are empty
const FeaturedSection     = dynamic(() => import('../components/sections/FeaturedSection').then(m => m.FeaturedSection),         { ssr: false });
const CategorySection     = dynamic(() => import('../components/sections/CategorySection').then(m => m.CategorySection),         { ssr: false });
const AntonioSection      = dynamic(() => import('../components/sections/AntonioSection').then(m => m.AntonioSection),           { ssr: false });
const CompanyShareSection = dynamic(() => import('../components/sections/CompanyShareSection').then(m => m.CompanyShareSection), { ssr: false });
const JoinSection         = dynamic(() => import('../components/sections/JoinSection').then(m => m.JoinSection),                 { ssr: false });

export const metadata: Metadata = {
  title: 'LUXA — Advanced Vehicle Innovation Platform',
  description:
    'Discover, showcase, and acquire advanced vehicle concepts, engineering innovations, and automotive projects. Curated by Antonio.',
};

export default function LandingPage() {
  return (
    <>
      {/* Layer 20: invisible admin gesture detector, always active */}
      <AdminSignalDetector />

      {/* Layer 11: sticky glassmorphic nav */}
      <LandingNav />

      <main>
        {/* ① Hero — full viewport, the entire landing experience */}
        <HeroAnimation />

        {/* ② Static explainer — no data dependency */}
        <WhatIsLuxa />

        {/* ③ Static 3-step flow — no data dependency */}
        <HowItWorks />

        {/* ④ Live Firestore sections — render only when populated */}
        <FeaturedSection />
        <CategorySection />
        <AntonioSection />
        <CompanyShareSection />

        {/* ⑤ Join CTA — always visible */}
        <JoinSection />
      </main>

      <LandingFooter />
    </>
  );
}
